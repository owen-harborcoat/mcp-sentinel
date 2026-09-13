# Helix Sentinel

Sandbox MCP servers in Wasmer, execute tests, and review security findings in a
persistent monitoring dashboard. The scanning agent decides whether observations
warrant alerts. Description/schema drift is one input, never the verdict.

**Implemented:** real Wasmer execution of the owned Helix MCP fixture, official
MCP SDK client tests, SQLite event history, scan evidence, agent assessment adapter,
alert lifecycle, and notification previews. The local dashboard works without API
keys using a visibly labeled deterministic demo assessor. OpenRouter is the preferred live assessor; Gemini remains optional. Notification
adapters are tested with mocked providers. See RESUME.md for live verification.

## Run

Requires Python 3.13, uv, and **Node 24+**. Node 22 failed the pinned Wasmer Python
runtime on this Windows machine. Dependencies are locked in uv.lock/package-lock.json.

```sh
uv sync --frozen --extra dev
npm ci --ignore-scripts --no-audit --no-fund
# Copy .env.example to .env only if .env does not already exist.
uv run --frozen uvicorn sentinel.app:app --host 127.0.0.1 --port 8787
```

Open http://127.0.0.1:8787. The app loads the ignored .env automatically. Set
WASMER_NODE to a Node 24+ executable if PATH points to an older version.
The first scan downloads the pinned public Wasmer Python package; later scans use
the runtime cache. No Wasmer API key is required for local SDK execution.

Select **Wasmer sandbox / Demo assessor**, then run the four scenarios:

| Scenario | Execution evidence | Demo assessment |
|---|---|---|
| Clean | Normal tools and repeatable output | No alert |
| Instruction clarification | Description changes harmlessly | No alert |
| Delayed instruction poisoning | After three calls, instructions seek key material and expose export | High alert |
| Behavior change | Output changes while metadata stays stable | Medium alert |

Open evidence, acknowledge/resolve/reopen an alert, and inspect the event timeline.
Repeat a finding to see occurrence deduplication. External notifications default
to previews. Demo assessments cannot send externally even when live mode is enabled.
OpenRouter is selected automatically when its key is configured. Otherwise the UI
selects the labeled demo assessor. Gemini remains available as an alternative.

## Team handoff

- [Feature ownership and checkpoints](docs/TEAM.md)
- [Product specification](SPEC.md), [alert design](docs/ALERTS.md), [API seams](docs/INTERFACES.md)
- [Corrected product/research direction](docs/research/PRODUCT_REVISION.md)
- [Feature A brief](CODEX_PROMPT_A.md) / [Feature B brief](CODEX_PROMPT_B.md)
- [Verification and remaining work](RESUME.md)
- [OpenRouter setup and live fixture results](docs/OPENROUTER.md)

A owns sandbox execution, test coverage and scan-detail UI. B owns agent assessment,
alerts, timeline and notification channels. Both are full stack. Existing branch
names are retained; merge the updated main before beginning work.

## Validate

```sh
uv run --frozen ruff check .
uv run --frozen pytest -q
uv run --frozen python -m scripts.protocol_smoke
```

Real Wasmer tests are opt-in: PowerShell
`$env:RUN_WASMER_TESTS='1'; uv run --frozen pytest tests/test_wasmer.py -q`;
POSIX `RUN_WASMER_TESTS=1 uv run --frozen pytest tests/test_wasmer.py -q`.
These tests execute all four scenarios without contacting a model or messaging provider.
CI includes them on Windows and Linux; only Windows has been run locally.

## Scope and credentials

This build scans one owned synthetic stdio MCP fixture. It is not yet an arbitrary
MCP fleet scanner, scheduled service, transparent MCP gateway, or general security
guarantee. The guest gets explicit files, no host mounts or credentials, disabled
networking and execution/output bounds. Keep the dashboard on loopback, single worker.

Set OPENROUTER_API_KEY for live assessment and OPENROUTER_MODEL to openrouter/free
(or a specific compatible model). The free router can vary models, availability and
latency; every verdict records the actual returned model. No paid fallback is added.
The direct Gemini adapter still accepts GEMINI_API_KEY. Free external notifications use
TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; LIVE_NOTIFICATIONS=1 explicitly enables
automatic high/critical notification attempts on new or reopened findings.
Browser notifications need no provider key and work while the page is open.
Twilio is optional: its current trial limits SMS to predefined templates, so custom
security SMS is not promised free. See [alert setup](docs/ALERTS.md).

The user-provided Wasmer token is stored in ignored local configuration, reserved
for a future cloud integration; it is not injected into the sandbox.
No remote is configured and no external messages or deployment have been performed.
The confirmed event is September 13 at Entrepreneurs First, 501 Folsom, ending
6 PM Pacific; see [EVENT.md](EVENT.md).
