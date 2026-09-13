# MCP Sentinel handoff — September 13, 2026

## Current state

The dashboard redesign and adversarial evaluation are complete. Product name: MCP Sentinel. Flat black/white interface, compact alert table, no hero or numbered stages, smooth sidebar navigation, scrollable event timeline with yellow/red divergence branches. Live SQLite data drives the page; evidence and provenance open on demand.

**Baseline interpretation corrected.** The original combined score is invalid for security detection: a missing requested write is a functional discrepancy, not an established security violation. Of 15 runs with visible security concerns, the model detected 9, missed 1 and returned 5 assessment errors. Twelve non-actionable control runs (including the write discrepancy) produced 8 clears, 1 false positive and 3 errors. Three additional runs exposed a collection gap: the attack started after collection ended. Raw records remain unchanged. Read [docs/EVALUATION.md](docs/EVALUATION.md) and the complete [run ledger](docs/evaluation-results.json). The completed [prompt study](docs/PROMPT_LAB.md) is summarized below. Earlier four-case smoke successes do not establish consistency.

The current collector executes fixed tests through an actual MCP SDK client against an actual Wasmer Python guest. Twelve owned fixture scenarios are selectable. The model reviews evidence; it does not autonomously plan or execute tests. Data and secrets inside fixtures are synthetic. No arbitrary MCP onboarding, scheduler, autonomous attacker, cloud deployment or production gateway is implemented.

OpenRouter is configured from the user-supplied ignored key file and .env; the baseline used dots-studio/dots-3-note-preview:free. All three assessment-override runs reported that same model identifier: two flagged, one returned the injected clean response. The initial report did not independently replay that failure and cannot identify its provider-level cause. No Gemini key is needed. Wasmer runs locally with SDK 0.11.0 / python/python@=3.13.5 / Node 24.19.0. The stored Wasmer token is reserved for future cloud work and is not used by local execution.

## Prompt update

Version B is installed in sentinel/prompts/security-assessor.txt. Same model and evidence: baseline replay reproduced the injected clean verdict. Development comparison was original 4/6 vs B 5/6 valid expected results; the shortest candidate regressed and was rejected. The independent held-out comparison was disrupted by provider/transport errors and is inconclusive. B then matched 6/7 additional recorded cases, with a false positive on a normal ticket update. A fresh isolated Wasmer scan detected the assessor-targeted injection. Some correct flags still contain unsupported recommendations. See docs/PROMPT_LAB.md for full method, prompts, hashes and failures.

## Presentation update

A top-right How it works button opens /how-it-works. The page includes a five-node architecture diagram and ten slides with animated SVG illustrations, two short bullets per slide, keyboard navigation and pause/play. An independent copy review found no em dashes or misleading live-demo claims. Browser checks covered all ten slides, navigation, pause and 390px layout. Animations respect the reduced-motion CSS preference; this was checked in source rather than emulated in the browser.

Presentation refinement: added soft blue headings, diagram accents and controls; removed all figcaptions, repeated topic labels and explanatory page footers. Shortened headings and normalized title baselines, bullet positions and diagram frames across all ten slides. Browser checks confirmed stable 384px desktop slide height and 526px height at 390px width, with no page overflow. Diagrams retain their own horizontal scroll on narrow screens. JavaScript syntax and whitespace checks passed. Pause affects SVG motion without freezing the slide entry transition.

## Dashboard interaction update

The main dashboard now has a unified scan-control panel, actual overview counts, a compact sidebar, a timeline with adjacent event inspector, and visible recent activity. Alerts and scans share columns on wide screens. Grayscale surfaces and consistent spacing replace the separate action row and disconnected sections.

Timeline nodes have custom pointer/focus previews, Escape/scroll dismissal, persistent click/Enter inspection, previous/next/latest controls, and selectable activity rows. Labels use actual test-case names; adjacent context labels stay separated even when alert actions from older scans are interleaved. Inspector rationale remains expandable across unchanged polls. Programmatic focus restoration during new-event polling does not reopen dismissed previews. Resizing the chart keeps the selected event and its branch in view; this was browser-verified from 1440px back to the normal 884px viewport.

Verification: eight focused JavaScript timeline tests and syntax checks passed. Browser checks covered pointer-triggered preview, focus preview and Escape, previous/next/latest, event-log keyboard selection, filters and empty-result recovery, clear/reselect, rationale persistence through polling, and opening actual scan evidence. Desktop 884px, mobile 390px and wide 1440px layouts had no page overflow. Native drag could not reliably validate pointer transfer into the tooltip; independent source review confirmed the hover-retention handlers, and identified the polling dismissal issue that was fixed. The new-event focus-restoration fix was source-reviewed, not tested by creating a live scan. No new scans, alerts or deliveries were created during this UI work.

Brand update: added an original M and signal-dot SVG mark to both page headers and the favicon. Both pages include a compact linked Powered by Wasmer footer using text attribution. SVG XML and local HTTP image/svg+xml responses were checked; browser inspection confirmed the logo loads and footer renders. No runtime, model or notification behavior changed.

## Verification

- After the prompt and presentation update: 31 Python tests passed, six opt-in Wasmer tests skipped, two JavaScript tests passed, and Ruff passed. A separate fresh Wasmer/model service run completed in an isolated database and persisted the expected injection alert.
- In the preceding build, 37 Python tests passed, including six real Wasmer collector cases; two upstream deprecation warnings.
- Two JavaScript timeline tests passed; Ruff passed.
- Thirty live model assessments recorded without replacing failures. All collected Wasmer evidence.
- Runtime isolation probes record observations, not universal startup gates. Integration tests assert host-file exclusion and guest-file access; the failed socket probe alone does not establish blocked egress.
- Separate UI-launched support-handoff case completed in 28.9 seconds, high alert #4.
- Browser verified event selection/evidence inspection, timeline spacing, alert search and resolve/reopen of the demo alert. Mobile 390px had no document horizontal overflow; smooth scroll is enabled.
- Telegram/Twilio remain preview-only. No external notification was sent. Provider adapter tests use mocked responses.
- Local app remains running at http://127.0.0.1:8787.

## Feature ownership and next work

A (feature/contract-monitor): strengthen functional read/write postconditions and consistency checks, broaden session lengths, and build approved-target onboarding. Establish a security boundary and collect destination evidence before labeling an unintended write a security violation.

B (feature/attack-lab): harden assessor handling of tool-output injection, capture safe structured failure diagnostics, validate clear verdicts and quoted-content policy, and evaluate fresh holdout cases. Monitoring UI and lifecycle are implemented.

Both teammates are full stack. Coordinate shared web/app.js, sentinel/app.py and model changes; merge main before starting. See docs/TEAM.md. Do not optimize on this test suite and then report those same cases as independent proof of improvement.

Telegram is optional for the demo: configure bot token/chat ID and explicitly enable LIVE_NOTIFICATIONS only for an authorized send. Twilio is not necessary. Manual alert reopen does not automatically send externally; scan-created/reopened/escalated high/critical alerts can attempt configured channels when enabled. The core demo is real Wasmer execution, evidence, model assessment, timeline, and alert review—with detector limitations disclosed.

No remote publication, deployment or external message has been performed. Original ZIP files in docs/handoff remain intact. Building ends at 6 PM Pacific at Entrepreneurs First, 501 Folsom.
