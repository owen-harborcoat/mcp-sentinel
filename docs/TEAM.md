# Two full-stack feature owners

The user confirmed both teammates are full stack; split by user-visible feature.
The existing branch names are retained to avoid disrupting checkouts. Merge the
updated main into each branch before continuing. The origin remote is https://github.com/owen-harborcoat/mcp-sentinel (private).

| Responsibility | A: Sandbox test lab | B: Monitoring and alerts |
|---|---|---|
| End-to-end outcome | Run meaningful MCP tests and inspect execution evidence | Review agent findings and manage alerts/notifications |
| Backend | scripts/wasmer_stdio.mjs, helix/sandbox_server.py, sentinel/scanner.py | sentinel/assessor.py, store.py, notifications.py |
| UI | Scan workbench and evidence detail | Compact alert table, timeline, filters and notification status |
| Tests | tests/test_wasmer.py, fixture alignment and coverage | tests/test_alerts.py, agent evaluation and delivery failures |
| Existing branch | feature/contract-monitor | feature/attack-lab |

Shared integration: sentinel/app.py, models.py, service.py, web/index.html,
web/app.js, web/style.css and dependency locks. Coordinate edits to these files;
A owns workbench/detail functions, B owns renderAlerts/renderEvents and delivery
functions. Avoid concurrent whole-file formatting. Existing implementation is a
starting point, not a request to rewrite from scratch.

## Remaining tickets

A:
- Extend functional write/readback checks and define consistency windows. Missing readback alone is not a security finding; establish an authorization boundary and collect destination evidence before classifying an unintended write as an attack.
- Broaden session lengths: current six-call tests never exposed the call-ten attack.
- Define an explicit approved-target manifest before accepting additional MCPs.
- Verify Wasmer on the teammate's OS and package cold-start behavior.

B:
- OpenRouter is configured. Review the corrected baseline in EVALUATION.md: 15 visible security-case runs yielded 9 detections, 1 miss and 5 errors; 12 non-actionable controls yielded 8 clears, 1 false positive and 3 errors. Three collection gaps are separate. Do not reuse the original combined score.
- Address assessor prompt injection (one exact clean-verdict override) and test fresh holdout cases.
- An isolated prompt study is pending in PROMPT_LAB.md; do not claim improvement until its full results are recorded.
- Define actionable-alert policy for quoted attack reports and validate severity consistency. Timeline/alert filtering is implemented.
- Configure Telegram after previews; validate one explicitly authorized send. Manual alert reopen changes state/generation and does not automatically send externally.
- Keep provider acceptance distinct from delivered status.

Joint:
- Keep shared API contracts in docs/INTERFACES.md aligned.
- Integrate early, record real execution vs model vs delivery verification.
- Build a short demo: harmless change retained in logs; harmful instruction
  flagged; behavior-only change found; evidence reviewed and alert resolved.

## September 13 checkpoints (Pacific)

| Deadline | Joint outcome |
|---|---|
| 1:30 PM | Both teammates running updated foundation; real OpenRouter decisions inspected |
| 2:45 PM | Integrated sandbox tests, evidence and alert demo |
| 3:45 PM | Failure cases, repeated findings and optional notification verified |
| 4:30 PM | Feature freeze; remove misleading claims and fix presentation issues |
| 5:00 PM | Full rehearsal and clean-checkout verification |
| 5:30 PM | Submission materials and backup demo ready |
| 6:00 PM | Building ends at Entrepreneurs First, 501 Folsom |

If time slips, keep the real Wasmer -> tests -> agent -> alert -> evidence story.
Cut extra targets, cloud deployment, SMS and scheduling before weakening that flow.
