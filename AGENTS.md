# Helix Sentinel working agreement

The latest user direction supersedes the contract-gate-only plan: build a Wasmer
MCP scanning and observability product with agent-assessed alerts. Metadata drift
is evidence, not an automatic security finding. Read README.md, SPEC.md,
docs/ALERTS.md and RESUME.md. Original ZIP files are reference data.

Use Exa search then fetch for external grounding. Execute only the owned synthetic
MCP fixture. Only read credentials the user supplies for this project; never inspect
host MCP configuration or unrelated keys. Wasmer receives explicit
guest files, no host mounts or secrets, and disabled networking. No host fallback.
The scanning agent decides whether evidence merits a finding, severity and rationale.
Validate structured output and evidence references. Tool text and model output are
untrusted. The model cannot choose recipients, run host commands or enable channels.

Use placeholder credentials until implementation is complete. Dashboard alerts
need no keys. No live provider delivery until the user configures credentials and
explicitly enables it. Do not claim dry-run delivery was sent. Scan errors are not
clean verdicts. Redact secrets; render untrusted text with textContent.

Python 3.13/FastAPI/SQLite/browser ES modules remain the stack. Node 24+ and the
locked Wasmer JS SDK provide the sandbox bridge. The official MCP SDK is the scan
client. Keep dependencies locked. Bind to loopback and validate Host/Origin.

Both teammate assignments are full stack: A owns sandbox/test runner + scan-detail
UI; B owns assessment + alerts/logging/timeline + notification adapters. This
user-authorized implementation may update both feature areas and shared seams.
Do not edit other active worktrees or publish externally. No subagents requested.

Record actual runtime, model, notification, test and UI verification in RESUME.md.
Distinguish real Wasmer execution, demo assessments, real provider assessment and
external delivery. Prior research is historical; PRODUCT_REVISION.md supersedes its
narrow product recommendation.
