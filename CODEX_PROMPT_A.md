# Feature A: Contract Monitor + Timeline

Work as one of two full-stack teammates. Read AGENTS.md, SPEC.md,
docs/INTERFACES.md, docs/TEAM.md and RESUME.md. The original ZIP prompts are archived
reference, and the current user explicitly selected feature-based full-stack work.

Use branch feature/contract-monitor. Own sentinel/monitoring/, sentinel/db.py,
sentinel/proxy.py, sentinel/app.py and web/index.html, app.js, style.css, monitor.js;
own tests/monitoring/ and tests/transport/. Coordinate any shared-contract change.

Build in small increments: (1) deterministic baseline diff with full metadata
coverage; (2) store/APIs and labeled seed history; (3) real SDK bridge with complete
discovery and pre-exposure quarantine; (4) timeline/diff UI. Reuse
scripts/protocol_smoke.py as a verified SDK wiring example. Do not substitute its
synthetic get_ticket handler for the actual Helix server.

Consume B's pure Policy.evaluate_call and routers from sentinel/enforcement/.
Use a test-only policy double while B builds; never ship that double. You own app
composition and discovery filtering. Refresh before each call, fail closed if
discovery fails, and prove a denied call is not forwarded. Include B's mountLab
browser module after integration; do not edit its code without coordinating.

Done: exact fixtures accepted, changed/new metadata withheld in enforce mode,
all drift reasons persist correctly, event pagination works without dropped IDs,
baseline never learns live poison, and unchanged tools remain usable. Tests must
include extra-metadata changes, malformed/partial discovery and benign drift.

Run uv run --frozen ruff check ., uv run --frozen pytest -q and the real SDK demo
when B supplies it. Record what ran and what remains in RESUME.md. Do not claim a
complete demo from unit tests. The confirmed event ends today at 6 PM Pacific.
