# MCP Sentinel

Sandbox MCP servers in Wasmer, execute tests, and review security findings in a
persistent monitoring dashboard. The scanning agent decides whether observations
warrant alerts. Description/schema drift is one input, never the verdict.

**Implemented:** real Wasmer execution of the owned Helix MCP fixture, official
MCP SDK client tests, SQLite event history, scan evidence, agent assessment adapter,
alert lifecycle, and gated notification delivery. Every scan executes Wasmer and
requires a configured live model provider. OpenRouter is preferred; Gemini remains optional. Notification
adapters are tested with mocked providers. See RESUME.md for live verification.

**Baseline assessment, corrected:** 15 runs contained visible security concerns:
9 detections, 1 miss and 5 assessment errors. Twelve non-actionable control runs
produced 8 clears, 1 false positive and 3 errors. Three late-trigger runs are separate
collection gaps. A missing write was incorrectly labeled a security violation in
the original report. There is no combined accuracy claim; see the [corrected results](docs/EVALUATION.md).
The isolated [prompt study](docs/PROMPT_LAB.md) reproduced the failure and selected a revised
general prompt. The gain on development cases was modest; independent reliability
remains unproven.

The dashboard now has compact alert tables and a scrollable event timeline. Twelve
owned test cases are selectable with Wasmer. OpenRouter reviews fixed test evidence;
it does not autonomously choose or execute attacks.

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

Select **Wasmer / OpenRouter** and choose an owned test case. Runtime simulation
and the deterministic assessor have been removed. A missing model key blocks a
scan; Wasmer or provider failures produce failed scans with no fallback.

Open evidence, acknowledge/resolve/reopen an alert, and inspect the event timeline.
Repeat a finding to see occurrence deduplication. External notifications stay off
until credentials and explicit enablement are configured; disabled channels do not
create preview attempts. Historical demo/preview records retain their original
provenance and are labeled as historical in the dashboard.

## Where it runs and internet requirements

The browser renders the dashboard. FastAPI, SQLite, the custom Python scanner and
the official MCP client run on the host. The scanner launches a Node process using
`@wasmer/sdk/node`, which runs the owned Python MCP server inside a local Wasmer
WebAssembly/WASIX guest. MCP requests and responses travel over stdin/stdout through
the Node bridge. FastAPI's `/api/scans` route is application code, not a built-in
security scanning feature. Neither FastAPI nor the model runs inside the guest or
browser. This is not a Docker container or a cloud sandbox.

Saved results are local. Wasmer's pinned package is downloaded initially and cached;
local collection can reuse the cache. The full assessed scan requires internet for
OpenRouter/Gemini. Optional external delivery also requires internet. Disabling the
guest's network does not disable the host's model API requests. Fully offline
end-to-end assessment is not implemented or verified.

The target is still a deliberately synthetic MCP fixture executed live, with
synthetic ticket data, attack instructions and fake key material. Removing runtime
simulation does not turn this fixture into a third-party production target.

## Team handoff

- [Feature ownership and checkpoints](docs/TEAM.md)
- [Product specification](SPEC.md), [alert design](docs/ALERTS.md), [API seams](docs/INTERFACES.md)
- [Corrected product/research direction](docs/research/PRODUCT_REVISION.md)
- [Feature A brief](CODEX_PROMPT_A.md) / [Feature B brief](CODEX_PROMPT_B.md)
- [Verification and remaining work](RESUME.md)
- [OpenRouter setup](docs/OPENROUTER.md), [adversarial evaluation](docs/EVALUATION.md)

A owns sandbox execution, test coverage and scan-detail UI. B owns agent assessment,
alerts, timeline and notification channels. Both are full stack. Existing branch
names are retained; merge the updated main before beginning work.

## Validate

```sh
uv run --frozen ruff check .
uv run --frozen pytest -q
node --test tests/timeline.test.mjs
uv run --frozen python -m scripts.protocol_smoke
```

Real Wasmer tests are opt-in: PowerShell
`$env:RUN_WASMER_TESTS='1'; uv run --frozen pytest tests/test_wasmer.py -q`;
POSIX `RUN_WASMER_TESTS=1 uv run --frozen pytest tests/test_wasmer.py -q`.
Six collector tests execute real Wasmer cases without contacting a model or messaging provider.
Run the explicit live assessment with `uv run --frozen python -m scripts.evaluate`;
this makes 30 OpenRouter calls and is not part of CI.
CI includes collector checks on Windows and Linux; only Windows has been run locally.

## Scope and credentials

This build scans one owned synthetic stdio MCP fixture. It is not yet an arbitrary
MCP fleet scanner, scheduled service, transparent MCP gateway, or general security
guarantee. The guest gets explicit files, no host mounts or credentials, disabled
networking and execution/output bounds. The bridge records isolation probe results;
it does not enforce every recorded boolean as a startup gate. The failed socket
probe alone does not demonstrate blocked egress. Keep the dashboard on loopback,
single worker.

Set OPENROUTER_API_KEY for live assessment and OPENROUTER_MODEL to openrouter/free
(or a specific compatible model). The free router can vary models, availability and
latency; every verdict records the actual returned model. No paid fallback is added.
The direct Gemini adapter still accepts GEMINI_API_KEY. Free external notifications use
TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; LIVE_NOTIFICATIONS=1 explicitly enables
automatic high/critical notification attempts when a scan creates, reopens or
escalates a finding. A manual reopen changes state and generation without sending.
Browser notifications need no provider key and work while the page is open.
Twilio is optional: its current trial limits SMS to predefined templates, so custom
security SMS is not promised free. See [alert setup](docs/ALERTS.md).

The user-provided Wasmer token is stored in ignored local configuration, reserved
for a future cloud integration; it is not injected into the sandbox.
GitHub repository: https://github.com/owen-harborcoat/mcp-sentinel (private).
No external notifications or application deployment have been performed.
The confirmed event is September 13 at Entrepreneurs First, 501 Folsom, ending
6 PM Pacific; see [EVENT.md](EVENT.md).
