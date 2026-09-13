# Feature A: sandbox test lab

Continue the existing implementation, reading AGENTS.md, README.md, SPEC.md,
docs/TEAM.md and docs/INTERFACES.md first. You own an end-to-end feature: real MCP
execution inside Wasmer, meaningful test collection and the scan-detail/workbench
UI. Merge the updated main into feature/contract-monitor before starting.

Own scripts/wasmer_stdio.mjs, helix/sandbox_server.py, sentinel/scanner.py and
tests/test_wasmer.py. Coordinate shared HTML/CSS/app.js edits with B. Preserve B's
alert/timeline functions. Use Node 24+, the locked Wasmer SDK and official MCP client.
Never silently execute the MCP on the host if Wasmer fails. Guest files must be
explicit synthetic inputs; no host mounts/keys/network by default.

Priority: deepen tool tests beyond repeated get_ticket, show readable evidence
differences/timings, preserve harmless and behavior-only negative controls, and
validate on your OS. Do not accept arbitrary third-party targets without first
designing an approved-target manifest and execution policy with the team.
The scanning agent owns security judgment; your test observations are inputs.

Run lint, unit tests and opt-in real Wasmer tests. Report exactly which runtime
and scenarios were executed. Finish with a reproducible dashboard demonstration
and concrete integration notes. Use Exa search then fetch for external research.
