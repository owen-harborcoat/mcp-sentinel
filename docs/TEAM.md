# Two-person build plan

Both teammates own an end-to-end feature, including server code, browser behavior,
tests and demo acceptance. A/B are labels; assign names locally.

| Responsibility | Feature A: Contract Monitor | Feature B: Attack Lab |
|---|---|---|
| User outcome | See what changed and prevent unapproved metadata exposure | Reproduce the attack and prove call blocking |
| Backend | detector, baseline, event store, MCP bridge, app wiring | pure call policy, Helix server, lab/enforce routers |
| Frontend | timeline, diff, summary, baseline | attack/mode/reset/enforce controls, received-call proof |
| Main paths | sentinel/monitoring/, sentinel/db.py, sentinel/proxy.py, sentinel/app.py, web/{index.html,app.js,style.css,monitor.js} | sentinel/enforcement/, helix/server.py, web/{lab.js,lab.css}, scripts/demo_calls.py |
| Tests | tests/monitoring/, tests/transport/ | tests/enforcement/, tests/helix/, tests/demo/ |
| Branch | feature/contract-monitor | feature/attack-lab |

Shared: shared/contracts.py, helix/contract.py, sentinel/seed.json, pyproject.toml,
uv.lock and docs/INTERFACES.md. A coordinates shared edits; B reviews anything
affecting its inputs. A owns integration into sentinel/app.py; B supplies routers
and functions for A to include. Both can continue against fixtures before merging.

## Checkpoints, Pacific time on September 13

Owen's confirmed build window: 11:13 AM–6:00 PM, 6h47m. Preparation consumes part of
that window; keep the fixed integration/rehearsal deadlines and shorten polish.

| By | A delivers | B delivers | Joint check |
|---|---|---|---|
| 11:45 AM | begin detector + store | begin Helix clean + policy | setup passes; interfaces understood |
| 12:30 PM | pure diff tests + event API | real clean MCP + policy tests | SDK client reads exact three tools |
| 1:30 PM | bridge + discovery quarantine | deterministic poison + debug stats | first merged drift event and denial |
| 2:45 PM | live timeline + metadata diff | lab controls + replay runner | all four beats work once |
| 3:45 PM | pagination/failure controls | negative controls + denial proof | acceptance cases pass |
| 4:30 PM | readable UI + fixes | repeatable reset + talk | freeze features |
| 5:00 PM | integration evidence | rehearsed four-minute demo | go/no-go on optional work; normally skip |
| 5:30 PM | final clean-checkout run | backup local recording, if desired | submission material ready |
| 6:00 PM | stop building | stop building | present according to organizer directions |

If late: prioritize clean MCP, description/schema/new-tool detection, definition
quarantine, call denial with counter proof, and a readable timeline. Cut risk
points, elaborate filters, styling and sponsor integration first. Never silently
relax enforcement or relabel a JSON harness as MCP to meet the schedule.

## Ready-to-pick tickets

- [ ] A1: canonicalization, component/full-metadata digests and deterministic diffs.
- [ ] A2: SQLite store, labeled seed rows, APIs and reset semantics.
- [ ] A3: SDK bridge, fresh complete discovery, quarantine and failure handling.
- [ ] A4: timeline, expanded textual diff and clear live/synthetic state.
- [ ] B1: actual Helix MCP clean tools, in-memory tickets and counters.
- [ ] B2: poison trigger, safe dummy export and local lab controls.
- [ ] B3: pure deny policy, nested argument rules and enforcement router.
- [ ] B4: lab browser module, SDK replay and upstream side-effect assertions.
- [ ] Joint: merge at 1:30, replay at 2:45, adversarial acceptance, final rehearsal.

Do not spend the morning setting up external project management. These tickets,
branch ownership and local PR template are sufficient. Remote hosting awaits the
team's chosen repository URL; no account, visibility or licensing choice is assumed.
