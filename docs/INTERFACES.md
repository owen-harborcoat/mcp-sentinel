# Current implementation interfaces

These interfaces supersede the initial metadata-gateway contracts.
shared/contracts.py and the original seed are preserved legacy foundation assets;
the current scan/alert API uses sentinel/models.py.

## Scan boundary

POST /api/scans accepts one of twelve owned scenarios, runtime=wasmer,
assessor=openrouter/gemini (default openrouter), rejects extra fields, and returns
202 {scan_id,status}. One scan at a time; another receives 409.
A missing selected provider key returns 409 before creating a scan. No caller-supplied target,
URL, shell command, recipient or model API endpoint is accepted.

GET /api/scans/{id} returns persisted state, error or result containing evidence,
judgment, runtime, provenance and optional alert_id.
Evidence has id, kind, summary and data. Judgment has flag, severity, category,
title, rationale, evidence_ids and recommendation. See Pydantic models for enums
and validation. Every flagged result must cite existing evidence.

Collectors return list[Evidence] and emit(kind, detail, data).
Assessors return Judgment. ScanService coordinates persistence and delivery.
No metadata-comparison helper may directly bypass assessment and create an alert.

## Dashboard/alerts

GET /api/overview returns recent scans (100), alerts (200), deliveries (100),
summary stats over those windows, and running state.
GET /api/events?since_id=0&limit=200 returns ordered events and next_since_id;
max limit 500. UI keeps the newest 500 timeline events; SQLite retains older rows.
GET /api/config returns readiness flags/model label, never secrets.
GET /api/health reports the scan-dashboard service; there is no /mcp proxy route.

POST /api/alerts/{id}/actions takes action acknowledge/resolve/reopen.
POST /api/alerts/{id}/deliveries takes channel telegram/twilio.
When LIVE_NOTIFICATIONS=0 the delivery endpoint rejects the action without creating
a delivery attempt. No new previews or simulation results are generated.
Transitions and deliveries validate lifecycle/configuration; errors are surfaced
rather than silently treated as successful.

POSTs require JSON. Requests with a supplied cross-origin Origin are rejected;
Host is loopback-only. This is a local single-user service, not deployed auth.
UI uses textContent for all untrusted content and an external-script-only CSP.
