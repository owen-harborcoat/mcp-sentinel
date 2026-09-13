"""Scan -> execution evidence -> agent judgment -> alert -> notification outbox."""
import asyncio

from sentinel.assessor import assess_demo, assess_gemini, validate_judgment
from sentinel.notifications import deliver, readiness
from sentinel.scanner import collect_demo, collect_wasmer, digest


class ScanService:
    def __init__(self, store, settings):
        self.store, self.settings = store, settings
        self.lock = asyncio.Lock()

    async def run(self, scan_id, request):
        emit = lambda kind, detail, data: self.store.event(scan_id, kind, detail, data=data)
        try:
            self.store.event(scan_id, 'SCAN_STARTED',
                f'Helix / {request.scenario} / {request.runtime} / {request.assessor}')
            collector = collect_wasmer if request.runtime == 'wasmer' else collect_demo
            evidence = await collector(self.settings, request, scan_id, emit)
            self.store.event(scan_id, 'ASSESSMENT_STARTED',
                             'Assessing test evidence; metadata changes are not automatic alerts')
            assessor = assess_gemini if request.assessor == 'gemini' else assess_demo
            judgment = await assessor(self.settings, evidence)
            judgment = validate_judgment(judgment.model_dump(), evidence)
            provenance = ('gemini:' + self.settings.gemini_model if request.assessor == 'gemini'
                          else 'demo:deterministic-test-double')
            result = {'evidence': [e.model_dump() for e in evidence],
                      'judgment': judgment.model_dump(), 'provenance': provenance,
                      'runtime': request.runtime, 'alert_id': None}
            self.store.event(scan_id, 'AGENT_FLAGGED' if judgment.flag else 'AGENT_CLEARED',
                             judgment.title, judgment.severity, {'judgment': judgment.model_dump()})
            if judgment.flag:
                cited = [e.model_dump() for e in evidence if e.id in judgment.evidence_ids]
                fingerprint = digest({'target': 'helix', 'runtime': request.runtime,
                                      'assessor': provenance, 'category': judgment.category,
                                      'evidence': cited})
                alert, created = self.store.upsert_alert(scan_id, fingerprint, judgment, provenance)
                result['alert_id'] = alert['id']
                self.store.event(scan_id, 'ALERT_OPENED' if created else 'ALERT_REPEATED',
                                 f'Alert #{alert["id"]}: {judgment.title}', judgment.severity)
                if created and judgment.severity in ('high', 'critical'):
                    for channel in ('telegram', 'twilio'):
                        if not self.settings.live_notifications or readiness(self.settings, channel):  # noqa: SIM102
                            # Demo verdicts never trigger a real external send.
                            if not self.settings.live_notifications or request.assessor == 'gemini':
                                await deliver(self.store, self.settings, alert, channel)
            self.store.finish_scan(scan_id, result=result)
            self.store.event(scan_id, 'SCAN_COMPLETED', 'Scan and assessment recorded')
        except asyncio.CancelledError:
            self.store.finish_scan(scan_id, error='Scan interrupted during shutdown')
            raise
        except Exception as exc:  # noqa: BLE001 - background task boundary must persist any failure
            # Exception strings may contain credentials or poisoned server content.
            error = f'{type(exc).__name__}: scan or assessment failed; verify runtime/provider configuration'
            self.store.finish_scan(scan_id, error=error)
            self.store.event(scan_id, 'SCAN_FAILED', error, 'high')
        finally:
            self.lock.release()
