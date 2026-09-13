"""Local scanning dashboard and alerts API."""
import asyncio
from contextlib import asynccontextmanager
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from sentinel.config import ROOT, Settings, placeholder
from sentinel.models import AlertAction, DeliveryRequest, ScanRequest
from sentinel.notifications import deliver, readiness
from sentinel.service import ScanService
from sentinel.store import Store


def create_app(settings=None):
    settings = settings or Settings.from_env()
    store = Store(settings.database)
    service = ScanService(store, settings)
    tasks = set()

    @asynccontextmanager
    async def lifespan(_app):
        yield
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    app = FastAPI(title='Helix Sentinel', version='0.2.0', lifespan=lifespan)
    app.state.store, app.state.service = store, service
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=['127.0.0.1', 'localhost'])

    @app.middleware('http')
    async def boundaries(request: Request, call_next):
        origin = request.headers.get('origin')
        if origin and origin != f'{request.url.scheme}://{request.url.netloc}':
            return JSONResponse({'detail': 'Cross-origin request rejected'}, status_code=403)
        if request.method == 'POST':
            if request.headers.get('content-type', '').split(';')[0] != 'application/json':
                return JSONResponse({'detail': 'JSON body required'}, status_code=415)
            body = await request.body()
            if len(body) > 16384:
                return JSONResponse({'detail': 'Request too large'}, status_code=413)
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Cache-Control'] = 'no-store'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; script-src 'self'; style-src 'self'; "
            "img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'")
        return response

    @app.get('/api/health')
    def health():
        return {'status': 'ready', 'api_version': '2', 'service': 'scan-dashboard',
                'mcp_proxy': False}

    @app.get('/api/config')
    def config():
        return {'gemini_ready': not placeholder(settings.gemini_key),
                'gemini_model': settings.gemini_model,
                'live_notifications': settings.live_notifications,
                'telegram_ready': readiness(settings, 'telegram'),
                'twilio_ready': readiness(settings, 'twilio'),
                'wasmer_key_required': False,
                'wasmer_sdk_installed': (ROOT / 'node_modules/@wasmer/sdk').exists(),
                'notification_min_severity': 'high',
                'sms_note': 'Custom Twilio SMS is not available on the current free trial.'}

    @app.get('/api/overview')
    def overview():
        scans, alerts = store.scans(), store.alerts()
        return {'scans': scans, 'alerts': alerts, 'deliveries': store.deliveries(),
                'stats': {'scans': len(scans),
                          'open': sum(a['status'] == 'open' for a in alerts),
                          'flagged': sum(bool(s.get('result', {}).get('alert_id'))
                                         for s in scans if s.get('result')),
                          'reviewed_clear': sum(not s['result']['judgment']['flag']
                                                for s in scans if s.get('result'))},
                'running': service.lock.locked()}

    @app.get('/api/events')
    def events(since_id: int = Query(0, ge=0), limit: int = Query(200, ge=1, le=500)):
        rows = store.events(since_id, limit)
        return {'events': rows, 'next_since_id': rows[-1]['id'] if rows else since_id}

    @app.get('/api/scans/{scan_id}')
    def scan_detail(scan_id: str):
        value = store.scan(scan_id)
        if not value:
            raise HTTPException(404, 'Scan not found')
        return value

    @app.post('/api/scans', status_code=202)
    async def scan(request: ScanRequest):
        if request.assessor == 'gemini' and placeholder(settings.gemini_key):
            raise HTTPException(409, 'Configure GEMINI_API_KEY or use the labeled demo assessor')
        if service.lock.locked():
            raise HTTPException(409, 'A scan is already running')
        await service.lock.acquire()
        scan_id = uuid4().hex
        try:
            store.create_scan(scan_id, request)
            task = asyncio.create_task(service.run(scan_id, request))
            tasks.add(task)
            task.add_done_callback(tasks.discard)
        except BaseException:
            service.lock.release()
            raise
        return {'scan_id': scan_id, 'status': 'running'}

    @app.post('/api/alerts/{alert_id}/actions')
    def action(alert_id: int, request: AlertAction):
        try:
            return store.transition(alert_id, request.action)
        except KeyError as exc:
            raise HTTPException(404, 'Alert not found') from exc
        except ValueError as exc:
            raise HTTPException(409, str(exc)) from exc

    @app.post('/api/alerts/{alert_id}/deliveries')
    async def notification(alert_id: int, request: DeliveryRequest):
        value = store.alert(alert_id)
        if not value:
            raise HTTPException(404, 'Alert not found')
        try:
            return await deliver(store, settings, value, request.channel)
        except ValueError as exc:
            raise HTTPException(409, str(exc)) from exc

    @app.get('/')
    def index():
        return FileResponse(ROOT / 'web/index.html')

    app.mount('/static', StaticFiles(directory=ROOT / 'web'), name='static')
    return app


load_dotenv(ROOT / '.env', override=False)
app = create_app()
