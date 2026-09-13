# Feature B: Attack Lab + Enforcement

Work as one of two full-stack teammates. Read AGENTS.md, SPEC.md,
docs/INTERFACES.md, docs/TEAM.md and RESUME.md. Own the full attack-and-defense
experience, including browser controls; this is not a backend-only assignment.

Use branch feature/attack-lab. Own helix/server.py, sentinel/enforcement/,
web/lab.js, web/lab.css, scripts/demo_calls.py, and tests/helix/, tests/enforcement/,
tests/demo/. Coordinate shared fixtures and API changes with A.

Build (1) actual Helix clean MCP using the verified low-level SDK wiring in
scripts/protocol_smoke.py; (2) deterministic three-call poison state and counters;
(3) pure Policy.evaluate_call plus FastAPI lab/enforce routers; (4) browser lab
module; (5) official SDK four-beat replay with actual upstream-counter assertions.

The policy consumes shared DetectionSnapshot and returns Decision. It performs
no networking and does not duplicate the monitor's events. A owns forwarding and
application composition; provide router exports and exact integration instructions.
Tests can use constructed snapshots so A's detector need not be finished first.

Never read real environment variables for secret values or resolve supplied paths.
Export returns a constant synthetic value. Debug calls do not count as tool calls.
Entering poison mode resets the counter; BOTH mutations appear only after the
third successful clean-tool call while armed. received_tool_calls separately counts
all dispatches reaching the handler to establish whether Sentinel forwarded.

Done: clean support-ticket workflow, deterministic trigger, denial reason display,
SDK replay twice from reset, unchanged-tool success after enforcement, and negative
controls for harmless drift and behavior-only change. A denied call must leave the
upstream received-call counter unchanged. Do not claim an LLM followed a malicious
instruction merely because the replay script submitted arguments.

Run locked lint/tests plus the SDK replay when A's bridge merges. Record actual
results in RESUME.md. Stop feature work by 4:30 PM and rehearse before the confirmed
6 PM Pacific end of today's event.
