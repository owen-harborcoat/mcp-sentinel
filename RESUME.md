# MCP Sentinel handoff — September 13, 2026

## Current state

The dashboard redesign and adversarial evaluation are complete. Product name: MCP Sentinel. Flat black/white interface, compact alert table, no hero or numbered stages, smooth sidebar navigation, scrollable event timeline with yellow/red divergence branches. Live SQLite data drives the page; evidence and provenance open on demand.

**Detection is not reliable yet.** Thirty repeated live Wasmer/OpenRouter runs produced 14 matching expected verdicts, 8 assessment errors, 7 missed malicious targets (including 3 scanner coverage gaps), and 1 false positive under the declared policy. One assessor-targeted injection dictated the exact clean JSON response. Read [docs/EVALUATION.md](docs/EVALUATION.md) and the complete [run ledger](docs/evaluation-results.json). Earlier four-case smoke successes do not establish consistency.

The current collector executes fixed tests through an actual MCP SDK client against an actual Wasmer Python guest. Twelve owned fixture scenarios are selectable. The model reviews evidence; it does not autonomously plan or execute tests. Data and secrets inside fixtures are synthetic. No arbitrary MCP onboarding, scheduler, autonomous attacker, cloud deployment or production gateway is implemented.

OpenRouter is configured from the user-supplied ignored key file and .env; the model remains dots-studio/dots-3-note-preview:free. No Gemini key is needed. Wasmer runs locally with SDK 0.11.0 / python/python@=3.13.5 / Node 24.19.0. The stored Wasmer token is reserved for future cloud work and is not used by local execution.

## Verification

- 37 Python tests passed, including six real Wasmer collector cases; two upstream deprecation warnings.
- Two JavaScript timeline tests passed; Ruff passed.
- Thirty live model assessments recorded without replacing failures. All collected Wasmer evidence.
- Separate UI-launched support-handoff case completed in 28.9 seconds, high alert #4.
- Browser verified event selection/evidence inspection, timeline spacing, alert search and resolve/reopen of the demo alert. Mobile 390px had no document horizontal overflow; smooth scroll is enabled.
- Telegram/Twilio remain preview-only. No external notification was sent. Provider adapter tests use mocked responses.
- Local app remains running at http://127.0.0.1:8787.

## Feature ownership and next work

A (feature/contract-monitor): strengthen executable read/write postconditions, broaden session lengths, collect evidence of unintended writes, and build approved-target onboarding.

B (feature/attack-lab): harden assessor handling of tool-output injection, capture safe structured failure diagnostics, validate clear verdicts and quoted-content policy, and evaluate fresh holdout cases. Monitoring UI and lifecycle are implemented.

Both teammates are full stack. Coordinate shared web/app.js, sentinel/app.py and model changes; merge main before starting. See docs/TEAM.md. Do not optimize on this test suite and then report those same cases as independent proof of improvement.

Telegram is optional for the demo: configure bot token/chat ID and explicitly enable LIVE_NOTIFICATIONS only for an authorized send. Twilio is not necessary. The core demo is real Wasmer execution, evidence, model assessment, timeline, and alert review—with detector limitations disclosed.

No remote publication, deployment or external message has been performed. Original ZIP files in docs/handoff remain intact. Building ends at 6 PM Pacific at Entrepreneurs First, 501 Folsom.
