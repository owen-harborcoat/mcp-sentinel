# Handoff: Wasmer scans and agent-reviewed alerts

Current product direction is the user's broader MCP sandbox/testing/monitoring
workspace. The former metadata-quarantine pivot is superseded by SPEC.md and
docs/research/PRODUCT_REVISION.md. Original ZIP reference files remain intact.

Implemented:
- Real local Wasmer Python guest, four scenarios, official MCP SDK test client.
- Persisted scan/evidence/events, Gemini structured assessment adapter and
  explicitly labeled deterministic assessor for keyless development.
- Dashboard, alert deduplication, severity/lifecycle, evidence dialog, timeline,
  browser notifications, Telegram and Twilio preview/live adapters.
- Fixed-recipient minimal messages, atomic attempts, no retry for uncertain sends.
- Dummy provider configuration; user-provided Wasmer token saved in ignored .env
  and original token file excluded from Git. Local SDK does not consume that key.

Verification:
- Four real Wasmer scenario tests passed on Windows with bundled Node 24.19.0 and
  Wasmer SDK 0.11.0 / python/python@=3.13.5.
- Node 22.14 fails this pinned guest; use Node 24+.
- 27 tests passed including all four real Wasmer cases, unit/API tests and mocked
  Gemini/Telegram/Twilio responses. Ruff, JS syntax and legacy SDK protocol smoke passed.
- Browser verified real poison and benign scans, evidence/isolation details,
  notification preview, acknowledge/resolve/reopen and timeline search. Polling
  now preserves unchanged controls instead of rebuilding them. Responsive layout
  checked at 390px requested viewport with no document horizontal overflow.
- Local server: http://127.0.0.1:8787. API keys/notifications were not exercised live.
- Wasmer filesystem/network probe results are specific observations, not universal
  isolation guarantees. All data and the only accepted MCP target are synthetic.

Next:
1. Teammates merge updated main; retain existing branch names.
2. Set GEMINI_API_KEY in .env, restart server, evaluate all four live agent verdicts.
3. Optional free Telegram: set bot token/chat ID, preview then explicitly enable
   LIVE_NOTIFICATIONS=1. Optional Twilio requires a custom-SMS-eligible account.
4. A deepens executable tests/evidence UI. B improves investigations and validates
   agent behavior. See CODEX_PROMPT_A/B and docs/TEAM.md.
5. Rehearse by 5 PM; stop building at 6 PM September 13, 501 Folsom.

No remote publication, deployment or external message has been performed.
No arbitrary-target onboarding or scheduled fleet scans are implemented yet.
