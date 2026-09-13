# Feature B: monitoring and alerts

Continue the existing implementation, reading AGENTS.md, README.md, SPEC.md,
docs/ALERTS.md, docs/TEAM.md and docs/INTERFACES.md first. You own an end-to-end
feature: agent security judgments, alert lifecycle, timeline, logging and
notification adapters. Merge updated main into feature/attack-lab before starting.

Own sentinel/assessor.py, store.py, notifications.py, tests/test_alerts.py and
alert/timeline/notification browser functions. Coordinate shared shell/lockfile
and ScanService edits with A. Preserve sandbox/workbench/detail work.

Priority: configure OpenRouter locally after obtaining the key, run and review all
four scenarios, improve alert/timeline investigation, and verify a free Telegram
channel only when delivery is explicitly enabled. Metadata drift is evidence,
never an automatic verdict. Reject malformed judgments and invented evidence;
failed scans are not clean. Display demo provenance honestly.

No model or tool content may choose recipients or enable external delivery.
Keep fixed-recipient minimal messages, unique attempt claims and unknown timeout
outcomes. Twilio custom trial SMS is not free; keep it optional. Do not send any
external notification merely to test mocks. Live delivery needs user-configured
keys and explicit opt-in. Use Exa search then fetch for grounding.
