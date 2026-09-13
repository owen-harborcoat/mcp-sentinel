# Shared interfaces v1

Frozen integration seam for two full-stack tracks. Proposed changes need both
owners' agreement in the feature PR; add fields compatibly when possible.

## Python seam

`shared/contracts.py` defines ToolContract, EventKind, EventDraft, Event, EventPage,
DetectionSnapshot, Decision, and structural protocols Monitor, Policy, EventSink.

A implements Monitor.inspect_tools and EventSink.append. B implements
Policy.evaluate_call. A's bridge fetches a complete upstream list, invokes the
monitor, persists snapshot.events once, calls B's policy and persists decision.events
once. The policy must not re-emit the monitor events. Caller emits TOOL_CALL once
per attempted call. B emits ARG_ANOMALY/FIRST_SEEN_HIGH_RISK/DENIED as applicable.
No policy function performs network I/O; A alone decides whether to forward.

Default enforcement is on. Incomplete snapshots never authorize invocation.
Decision.allowed means whether upstream invocation is permitted for that request;
in observe mode this can be true despite findings. Monitor owns discovery filtering:
only baseline-equal present definitions leave enforce-mode tools/list.

Request IDs are generated inside Sentinel and correlate all emitted rows. The
demo driver records its JSON-RPC IDs separately; never use upstream text as an ID.
The store assigns increasing integer id and UTC RFC3339 ts. Hashes are hex SHA-256.

## Planned HTTP API

Only GET /api/health exists in the initialized scaffold. The following are contracts
for implementation, not claims that endpoints already run.

| Endpoint | Owner | Response / semantics |
|---|---|---|
| GET /api/health | A | `{status, api_version:"1", mcp_ready}` |
| GET /api/events?since_id=0&limit=200 | A | `{events:[Event], next_since_id:int}`; ascending IDs, 1–500 limit; next is last returned ID, not global max |
| GET /api/baseline | A | `{baseline_id, source:"reviewed_fixture", tools:[ToolContract]}` |
| GET /api/summary | A | `{enforce, baseline_id, live_counts, synthetic_count, risk_points, upstream, discovery_ok}` |
| POST /api/reset `{}` | A | `{ok:true, baseline_id}`; clear events, reload checked-in seed; preserve enforce; never accept live metadata |
| POST /api/enforce `{"on":true}` | B | `{enforce:true}`; Pydantic strict boolean; updates shared app.state.enforce |
| GET /api/lab | B | `LabState` below, fetched from fixed Helix endpoint |
| POST /api/lab/mode `{"mode":"poison"}` | B | `LabState`; resets trigger counter on mode selection |
| POST /api/lab/reset `{}` | B | `LabState`; clean mode, reset counters/tickets |
| POST /mcp | A | SDK-backed initialize, tools/list, tools/call, ping and lifecycle |
| GET/DELETE /mcp | A | SDK transport handling; unsupported streaming returns standard SDK status |
| GET / | A | Static shell with #monitor-root and #lab-root |

LabState = `{mode:"clean"|"poison", poison_call_count:int, poisoned:bool,
received_tool_calls:int, tool_call_counts:{name:int}}`. received_tool_calls counts
every dispatch reaching Helix's tool handler, including unsuccessful attempts;
poison_call_count counts only successfully handled clean tools while armed.
This distinguishes denial-before-forwarding from a rejected call at the target.

B owns Helix GET/POST /debug/mode, GET /debug/stats and POST /debug/reset on :8765.
Browser lab APIs on :8787 wrap those fixed paths; no arbitrary URL parameter.
API control routes are NOT MCP tools; the agent cannot toggle enforcement or reset.
Use same-origin controls, JSON-only mutation bodies, Host/Origin validation and no
permissive CORS. Reject hostile browser origins rather than accepting localhost as
an authentication mechanism. CLI requests may omit Origin under the local-only scope.

## Browser seam

A owns `web/index.html`, `app.js`, `style.css`, `monitor.js`.
B owns `web/lab.js`, `lab.css`; exports `mountLab(root, {apiBase, onChange})`.
apiBase is the empty string for same-origin access. onChange tells A to refetch
summary/events after a lab action; it does not transfer or mutate feature state.
Each module displays request failures. B scopes selectors under `.lab`.

## Independent development

A uses a local Policy test double and synthetic DetectionSnapshot fixtures while
B implements enforcement. The double must be visibly test-only and never become
the shipped enforcement implementation. B tests a pure policy against shared
snapshots and develops Helix and its lab API independently. Do not make tests pass
by returning canned security success from the application.
