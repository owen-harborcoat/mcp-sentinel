# MCP Sentinel handoff — September 13, 2026

## Current state

### Active scan timeline tracking

New scan submission now scrolls to the timeline, clears event filters that would
hide initialization and selects the running scan's latest real event. A 9px-radius
white orbit ring surrounds that node, with a Running/current-phase status. It moves
as events arrive, ignores interleaved actions on other scans and stops on completion,
failure or interrupted overview status. Terminal events stop it even if the overview
snapshot is briefly stale. No placeholder event or simulated progress is generated.
Selecting an older event or changing filters pauses follow mode; Latest resumes it.
Reduced motion retains a static ring and the status text. Concurrent refreshes are
serialized, and a submitted scan requests a fresh read after an in-flight poll.

Verification: ten timeline JS tests and JS syntax/diff checks passed. Playwright
with Edge tested startup from filtered/old history, moving ring animation, event
following, manual inspection, Latest, unrelated events, failed state cleanup with
stale overview, reduced motion, and 1440/390px layouts. Controlled browser responses
were used only for those timing/edge-state checks, without mutating the database.
A separate browser context then launched real Wasmer/OpenRouter scan
`6bb013cba51340aab4803b04f237673d` (clean), observed the ring at initialization,
and confirmed it disappeared with Scan completed selected. The scan completed with
no finding; returned model `dots-studio/dots-3-note-preview:free`. No external
notification was sent. Browser errors: none. Screenshots and the temporary script
are under `C:/Users/oweng/AppData/Local/Temp/mcp-sentinel-ui-review/`.


### Live-only scanning and results slide

Final UI follow-up: removed the Warning/Emergency timeline legend. Notifications
show Off for disabled channels and omit historical dry-run rows/counts. Historical
records remain in SQLite. Playwright verified no preview text in the notification
section, zero actual delivery rows, absent legend, all ten slides at 1440/884/390px,
fullscreen/navigation/motion and equal panels with no console errors or overflow.
Missing-key UI is disabled immediately and remains disabled after polling; current
provider selection enables scans. The fresh live scan completed in 24.682 seconds
and its evidence/provenance dialog rendered correctly. No notification event was
recorded for that scan. Answers are provided directly in chat at the user's request.


Latest direction removes all selectable simulation features. `collect_demo` and
`assess_demo` are deleted. The request schema allows only Wasmer with OpenRouter or
Gemini; OpenRouter is the default. Unconfigured model options are disabled and the
scan button stays disabled until configuration loads and a provider is available.
The API rejects removed modes and missing keys. ScanService invokes only the real
Wasmer collector. Notification previews are removed; disabled delivery creates no
attempt, and the delivery endpoint rejects it. Historical records remain accurately
labeled, and historical demo alerts remain ineligible for external delivery.

The old host-side protocol fixture is replaced by a real Wasmer protocol/collector
smoke check. Integration tests now assert actual evidence and read/write behavior
rather than invoking a deterministic assessor. Test mocks remain confined to unit
tests. The server's owned synthetic fixture and safe data are unchanged.

Fresh browser-launched scan `27ab3ef667964c5c87a95b0850d46fc3` ran scenario `handoff`
through actual Wasmer and OpenRouter, completed, and persisted a high-severity
finding. Returned model: `dots-studio/dots-3-note-preview:free`. All nine collected
evidence records include actual sandbox checks, MCP initialization, discovery,
three reads, metadata comparison, repeated-output evidence and write/readback.
SDK 0.11.0 / Python guest 3.13.5 / Node 24.19.0; host canary blocked, guest file
accessible, no mounts, disabled guest networking. The failed-socket-probe caveat
remains. No notification was attempted and live notifications remain disabled.
This one integration result is separate from the historical evaluation denominator.

Validation: 32 unit tests passed (includes a missing-runtime no-fallback test), six
real Wasmer collector cases passed, eight JS tests passed, and the rewritten real
Wasmer protocol smoke passed. Ruff, JS syntax and whitespace checks passed. Two
existing dependency deprecation warnings remain. Unit provider tests mock HTTP;
the browser-launched OpenRouter scan above was a real provider request.

Slide ten now states "9/10 valid threat assessments succeeded" and discloses five
additional assessment errors and 9/15 overall detections. It labels these as the
recorded baseline, not a current-prompt reliability estimate. Checked at 1440, 884
and 390px and in fullscreen. The complete local pipeline requires internet for the
model; only the MCP guest runs inside Wasmer. FastAPI, collector and Node bridge are
host processes, and the UI runs in the browser. README explains these boundaries.


### Recovered task UI update

Recovered the questions from the crashed September 13 task and completed its last
four requests. Alert and scan panels now share a 454px outer height, including empty
and filtered states, with internal table scrolling. The How it works page now has
a branched architecture SVG with application/Wasmer boundaries, MCP request and
response flow, evidence/assessment validation, SQLite/API feedback and gated external
delivery. Slides use monochrome styling, aligned title/content grids and consistent
spacing, plus native fullscreen entry/exit. Test labels in the browser now identify
instruction-abuse patterns, controls, the functional discrepancy and the late-trigger
gap. Fixture files and model inputs were not changed. Simulation explicitly says
no execution.

Fresh verification: 31 Python unit tests, six real Wasmer integration cases and eight
JavaScript tests passed; Ruff, JS syntax and diff whitespace checks passed. Two
existing upstream deprecation warnings remain. Wasmer reports SDK 0.11.0, Python
3.13.5, Node 24.19.0, no mounts, disabled networking, guest-file access and host-canary
exclusion. The socket-probe limitation still applies. These integration checks used
deterministic assessments, not new provider assessments.

Playwright used installed Microsoft Edge because the Browser plugin and bundled
Playwright browser binary were unavailable. At 1440, 884 and 390px widths, all ten
slides retained stable heights and title positions with no document overflow.
Verified empty alerts against populated scans, navigation, fullscreen entry/exit,
motion pause and emulated reduced motion; no browser console/page errors. Inspected
screenshots of the diagram, desktop/mobile slides, fullscreen and equal panels.
Mobile diagrams retain their own horizontal scrolling. Safari/Firefox and native
mobile fullscreen were not tested. Browser evidence and temporary QA script are in
`C:/Users/oweng/AppData/Local/Temp/mcp-sentinel-ui-review/`.

App restarted at http://127.0.0.1:8787. Public configuration confirms OpenRouter ready
with dots-studio/dots-3-note-preview:free, Gemini unconfigured, live notifications off,
and Telegram/Twilio unconfigured. No new provider assessment, live alert mutation,
external delivery or deployment occurred during recovery. Historical evaluation
results below remain historical. A user report covering the recovered questions,
runtime/simulation distinction, case meanings, reliability, reproduced injection,
notifications, exact installed prompt and QA was saved outside tracked source at
`C:/Users/oweng/.codex/visualizations/2026/09/13/01a09ce5-81e8-75d3-ad89-9c5369577855/MCP-Sentinel-report.md`.

### Previous implementation and evaluation

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

Timeline copy follow-up: all finding branches now read Alert, with severity colors retained; failed scans retain Scan failed. JavaScript syntax and rendered browser labels verified (10 alert branches).

Startup timing verification: three fresh Node processes running real Wasmer with cached Python completed MCP initialization and tools/list. Host launch to MCP readiness: 2.227-2.828 seconds; transport cleanup: 60.3-70.4 ms. Sandbox creation alone: 1.097-1.644 seconds; Wasmer runtime close: 5.5-6.3 ms. First package download was not measured. No model calls or notification delivery. Raw measurements: artifacts/startup-benchmark/results.json.

How-it-works architecture simplified to six nodes: browser dashboard, Python/FastAPI, Node.js worker, Wasmer/test MCP, external model API and local SQLite. Five directed edges form an acyclic graph; FastAPI owns orchestration, storage and model requests. Enlarged labels and preserved horizontal scrolling on narrow screens. Browser plugin not available; Playwright with Edge verified page identity, rendered content, six-node count, graph acyclicity, text bounds, no page overflow, mobile horizontal scrolling, slide advancement and dashboard navigation at 1440px and 390px. Screenshots inspected; no console errors. QA script/screenshots are outside the repository in the temporary mcp-sentinel-ui-review directory. No scan, model call or delivery was triggered.

Diagram direction corrected: FastAPI now points separately to the dashboard (Serves) and Node.js (Launches); Node points to Wasmer. Removed browser-to-backend request arrow so the architecture expresses backend responsibilities, with six nodes and no cycles. Timeline warning/emergency branches now use vertical SVG gradients from opaque gray matching the baseline at the bottom to full severity color at the top; endpoint dots retain full severity color. Gradient definitions are recreated on timeline redraw. JavaScript syntax and Playwright/Edge checks passed at 1440px and 390px: exact graph edges, gradient coordinates and computed colors, actual red/yellow event rendering, keyboard focus, filter redraw, dashboard navigation and no page overflow or console errors. Screenshots inspected in temporary mcp-sentinel-ui-review directory. No scans, model calls or notifications triggered.

Architecture branding and motion: added locally bundled Simple Icons 16.21.0 SVG marks for Wasmer, Node.js, FastAPI, Python, SQLite and OpenRouter; asset source and license recorded in web/assets/README.md. SQLite retained to match the actual implementation. Six nodes and five acyclic responsibility arrows remain. A timed illustration highlights serving the dashboard, launching the worker, running MCP in Wasmer, model assessment after sandbox cleanup, persistence and results display, with moving packets and descriptive captions. Shared pause/resume controls and reduced-motion support cover diagram and slides; progress stops when hidden/offscreen. Illustration performs no scans or model requests. Alert branch gradients now start at opacity 0 and finish at full severity color. Playwright/Edge verified all six animation phases, local logo HTTP responses, text/image bounds, pause position stability, resume, reduced-motion media change, mobile scrolling, slide navigation, transparent/opaque gradient endpoints and clean console at 1440px/390px. JavaScript syntax and scoped diff checks passed. Screenshots inspected; temporary check-brands-motion.cjs and architecture-brands/gradient-transparent screenshots are outside the repository. No external delivery or publication.

Added a short Why MCP needs security section immediately after the architecture and before the presentation. Three dated story summaries link to the original Koi Postmark report and Invariant GitHub/WhatsApp research fetched through Exa in the prior turn. The real malicious package is distinguished from two research demonstrations; no victim-count estimates or claims of reproducing these attacks are included. The closing explanation distinguishes isolation from prompt-injection assessment and identifies the controlled-test scope. Playwright/Edge at 1440px and 390px verified section order, all three references and link attributes, keyboard focus, readable screenshots, no page overflow, slide advancement and clean console. Scoped diff check passed. Screenshots and QA script are in the temporary mcp-sentinel-ui-review directory. No scans, model calls, notification delivery or publication.

GitHub publication preparation: user requested a push and creation of a repository. Created private owen-harborcoat/mcp-sentinel and configured origin. Local pre-push validation passed: 32 Python tests, 10 timeline tests, Ruff and diff checks; six real Wasmer tests were not rerun in this check (earlier execution is recorded above). Configured project secret values were absent from tracked files and Git history; credential files remain ignored. This publishes source only, not the dashboard as a hosted application.
