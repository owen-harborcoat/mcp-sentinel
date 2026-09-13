# Two full-stack feature owners

The user confirmed both teammates are full stack; split by user-visible feature.
The existing branch names are retained to avoid disrupting checkouts. Merge the
updated main into each branch before continuing. No remote has been configured.

| Responsibility | A: Sandbox test lab | B: Monitoring and alerts |
|---|---|---|
| End-to-end outcome | Run meaningful MCP tests and inspect execution evidence | Review agent findings and manage alerts/notifications |
| Backend | scripts/wasmer_stdio.mjs, helix/sandbox_server.py, sentinel/scanner.py | sentinel/assessor.py, store.py, notifications.py |
| UI | Scan workbench and evidence detail | Alert cards, timeline, filters and notification status |
| Tests | tests/test_wasmer.py, fixture alignment and coverage | tests/test_alerts.py, agent evaluation and delivery failures |
| Existing branch | feature/contract-monitor | feature/attack-lab |

Shared integration: sentinel/app.py, models.py, service.py, web/index.html,
web/app.js, web/style.css and dependency locks. Coordinate edits to these files;
A owns workbench/detail functions, B owns renderAlerts/renderEvents and delivery
functions. Avoid concurrent whole-file formatting. Existing implementation is a
starting point, not a request to rewrite from scratch.

## Remaining tickets

A:
- Add more meaningful read/write tool tests and expose pass/fail details.
- Improve before/after evidence presentation and show per-test timing.
- Define an explicit approved-target manifest before accepting additional MCPs.
- Verify Wasmer on the teammate's OS and package cold-start behavior.

B:
- Configure the model key and evaluate all four scenarios with Gemini.
- Check rationale/citations and tune false positives with benign changes.
- Polish timeline/alert filtering; unchanged controls now retain focus during polling.
- Configure free Telegram after previews; validate one explicitly authorized send.
- Keep provider acceptance distinct from delivered status.

Joint:
- Keep shared API contracts in docs/INTERFACES.md aligned.
- Integrate early, record real execution vs model vs delivery verification.
- Build a short demo: harmless change retained in logs; harmful instruction
  flagged; behavior-only change found; evidence reviewed and alert resolved.

## September 13 checkpoints (Pacific)

| Deadline | Joint outcome |
|---|---|
| 1:30 PM | Both teammates running updated foundation; real Gemini decisions inspected |
| 2:45 PM | Integrated sandbox tests, evidence and alert demo |
| 3:45 PM | Failure cases, repeated findings and optional notification verified |
| 4:30 PM | Feature freeze; remove misleading claims and fix presentation issues |
| 5:00 PM | Full rehearsal and clean-checkout verification |
| 5:30 PM | Submission materials and backup demo ready |
| 6:00 PM | Building ends at Entrepreneurs First, 501 Folsom |

If time slips, keep the real Wasmer -> tests -> agent -> alert -> evidence story.
Cut extra targets, cloud deployment, SMS and scheduling before weakening that flow.
