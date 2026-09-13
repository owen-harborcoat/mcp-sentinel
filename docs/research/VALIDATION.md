# Helix Sentinel validation and build recommendation

> Historical initial analysis. The user rejected its contract-gate-only direction.
> [PRODUCT_REVISION.md](PRODUCT_REVISION.md) supersedes the recommendation, Wasmer
> scope and implementation plan below. Retained to preserve research provenance.

## Recommendation

Proceed with Helix Sentinel as a tightly scoped, reproducible MCP contract review
gate and attack laboratory. The threat model has credible published precedents and
fits an agent-security demonstration. The original proposal's core mechanism,
hashing tool descriptions and schemas to detect drift, is already established.
Its strongest hackathon version is therefore an unusually clear demonstration of
metadata exposure, policy enforcement, preserved utility and explicit blind spots.
It should not be positioned as a new vulnerability class or a novel hashing defense.
[MCP-Scan documentation](https://invariantlabs-ai.github.io/docs/mcp-scan/),
[Vercel MCP documentation](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools).

The recommended pitch is: **“Helix Sentinel shows when an approved MCP tool changes,
withholds unreviewed definitions, and proves whether blocked calls reached the
server.”** This is an implementation target, not a claim that the initialized repo
already provides those protections. The current code supplies fixtures, interfaces,
checks and an SDK transport spike; the two teammates must implement the actual
monitor and attack lab.

| Decision | Assessment | Confidence |
|---|---|---|
| Is the underlying security problem real? | Yes; both controlled demonstrations and a disclosed delivery campaign support it | High |
| Is metadata hashing original? | No; existing tools and SDK helpers provide it | High |
| Can two people build a useful local demonstration today? | Plausible with a narrow bridge, synthetic target and early integration | Medium; engineering judgment |
| Does this establish demand for a standalone security company? | No customer validation, buying evidence or differentiated distribution established | Unvalidated |
| Should a real model be on the critical path? | No; use an official SDK client and accurately call it deterministic replay | High for demo reliability |
| Should Wasmer be mandatory? | No; it addresses execution isolation and introduces an additional platform dependency | High for the scoped plan |

## Event fit and remaining rule uncertainty

Operational planning uses the on-site confirmation: September 13, Entrepreneurs
First at 501 Folsom, with building ending at 6 PM Pacific. The 11:13 AM time check
left 6 hours 47 minutes, including preparation. The public listing fetched during
validation instead says September 11 and Marina District. That public copy is
inconsistent with the confirmed event and must not be reused as travel guidance.
The exact conflict and confirmation are recorded in [EVENT.md](../../EVENT.md).

The listing supports a broad agentic-security theme, small teams, cash awards and
a separate Wasmer-credit award. Its judging considerations favor a functioning
target demonstration, depth, originality and progress during the event. A fixture
is clearly within the team's authorized control, but the page does not settle
whether a purpose-built synthetic service satisfies the judges' target expectation.
The submission mechanism and treatment of pre-existing code also remain unspecified
in the retrieved text. Ask those concrete questions in person while implementation
continues. Do not infer additional rules from other similarly named hackathons.
[Organizer listing](https://luma.com/7a4iutvp).

**Assessment:** theme fit is strong; originality and interpretation of the target
criterion are the primary judging risks. Keep the original ZIP inventory and the
foundation commit so the team can accurately distinguish existing assets from
same-day work. The minimum successful outcome is a visible policy boundary backed
by actual requests, rather than an architecture presentation.

## Threat validation

### Metadata can be an instruction channel

The relevant trust boundary is between an external tool's description and the
agent's planning context. A tool may have an ordinary name while its metadata
contains instructions unrelated to the user's task. Invariant's April 2025 research
demonstrated both direct tool-description poisoning and influence over other tools.
That evidence supports the attack primitive; it does not establish that every
current client or model remains susceptible to the same payload.
[Original disclosure](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks).

**Design implication:** rejecting the poisoned tool only at invocation can be too
late. The description may already have influenced a different tool choice. Enforce
mode should compare metadata before passing a discovery response to the client and
withhold changed/new definitions. Observe mode deliberately exposes them only in
the controlled replay. A model that already saw poisoned text may retain it in
context, so toggling enforcement cannot be described as removing prior influence.
Use a fresh context for any later optional live-agent demonstration.

### Delayed activation closely matches the proposed fixture

Pillar's Deadbugz disclosure describes ordinary-looking MCP tools whose metadata
changes after three tool calls. Its researchers reported a coordinated GitHub PR
delivery attempt and verified the delayed metadata change. The disclosure separates
that observed mechanism from consequences it did not prove. This directly supports
the handoff's delayed trigger as a recognizable reproduction pattern, not an
original discovery. The fixture should cite the precedent and remain independent
of the reported infrastructure.
[Pillar disclosure, updated August 12, 2026](https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign).

**Design implication:** use exactly one trigger definition. After entering poison
mode, three successful clean-tool calls return normal results; subsequent discovery
reveals both the altered comment contract and the added export tool. Lists and debug
requests must not advance the trigger. This avoids the ZIP's contradictory immediate
versus delayed mutation instructions and gives both teammates a stable test sequence.

### Benchmark evidence supports careful evaluation, not broad efficacy claims

MCPTox systematically evaluates poisoning of MCP tool metadata across a collection
of real server/tool definitions and agent configurations. It provides broader support
than a single demonstration for treating metadata as a security boundary. Its reported
model results depend on its own tasks, payloads and model versions; none should be
presented as Helix Sentinel's detection rate.
[MCPTox, AAAI, March 2026](https://ojs.aaai.org/index.php/AAAI/article/view/40895).

AgentDojo emphasizes evaluating both adversarial resistance and the ability to
complete legitimate tasks. Applied here, denying everything is not a convincing
result: get_ticket must remain usable after unrelated tools are quarantined.
Tool-Guard's 2026 preprint also studies the persistence of poisoned descriptions
in planning context. It is useful corroborating research, but its proposed defense
is not what Sentinel implements. Neither paper substitutes for local execution
evidence. [AgentDojo](https://arxiv.org/pdf/2406.13352),
[Tool-Guard preprint](https://arxiv.org/html/2606.20922).

## Competitive overlap and credible differentiation

| Existing project | What the inspected source establishes | Consequence for Sentinel |
|---|---|---|
| Historical MCP-Scan documentation | Hash-based pinning, runtime proxying and guardrail features were documented | Hashing plus a proxy is not new |
| Current Snyk Agent Scan repository | The former repository now presents a broader agent-component scanner | Treat historical and current product descriptions separately |
| Vercel AI SDK | fingerprintTools and detectToolDrift helpers, with baseline/action ownership left to the application | Avoid pitching a small utility as a new platform |
| Docker MCP Gateway | Existing isolation and interception work; security design discusses freezing definitions | Existing gateways cover adjacent enforcement layers |
| ToolHive | Containerized execution, identity/policy controls, gateway and observability features | Enterprise MCP management is already a substantial product category |

Sources: [MCP-Scan](https://invariantlabs-ai.github.io/docs/mcp-scan/),
[Agent Scan repository](https://github.com/invariantlabs-ai/mcp-scan),
[Vercel](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools),
[Docker security document](https://github.com/docker/mcp-gateway/blob/fdb82a06/docs/security.md),
[ToolHive](https://github.com/stacklok/toolhive/).

The historical MCP-Scan site and current repository are not interchangeable status
sources. The older site proves prior art; the current repository describes today's
exposed project identity and modes. Likewise, Docker's document contains design
language and implementation distinctions, so it should not be flattened into a
claim that every discussed control is available in every current release. These
sources were inspected as documentation, not tested installations.

**Assessment:** there is insufficient evidence of an unoccupied product category.
A defensible hackathon distinction is an inspectable teaching and evaluation
experience: clean baseline, deliberate state transition, visible contract diff,
quarantined discovery, attempted action, and independent proof of non-forwarding.
This may make the demo memorable without requiring a novel algorithm. That is a
presentation and workflow hypothesis, not validated market demand or exclusivity.

Three choices would weaken the project: pretending competitors do not exist,
adding numerous shallow integrations, or replacing the demo with a generic risk
dashboard. A short acknowledgment of prior art followed by a decisive experiment
is more credible. If commercial work continues after the event, interview MCP
operators about legitimate-update handling, incident review and policy ownership
before treating another standalone gateway as the product opportunity.

## What fingerprints do and do not prove

An equal digest establishes that the normalized metadata compared by the proxy is
equal. It does not establish that a remote implementation behaves the same way,
that the baseline was safe, or that the endpoint belongs to a trusted operator.
Vercel's documentation explicitly bounds its own drift helpers against unchanged-
metadata behavior/endpoint swaps. That limitation applies directly to Sentinel's
design. [Vercel MCP drift documentation](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools).

The original three-field digest is useful for attribution but insufficient as a
complete exposure gate. MCP definitions can include title, outputSchema, annotations
and other metadata. Preserve the complete validated tool object for an additional
digest. Do not trust annotations merely because their names sound authoritative.
The standard itself treats annotations from untrusted servers as untrusted.
[MCP tools, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

**Recommended boundary:** compare full definitions, explain component changes, and
quarantine any unreviewed metadata change. Use a harmless wording edit as a negative
control: it should trigger drift even though it is not malicious. This is the honest
cost of strict pinning. Do not infer actual privilege expansion from every schema
edit, and do not introduce an untested classifier to waive changes during the sprint.

Keep a reviewed fixture baseline instead of silently trusting the first connection.
This avoids a demo cold start but does not solve baseline provenance generally.
Never allow reset to learn the currently poisoned tools. Changing the reviewed
baseline should remain a code-review decision for this sprint; a live approval
workflow would need identities, revocation semantics and stronger audit controls.

## Protocol and implementation feasibility

### Pin a working line instead of mixing documentation generations

The retrieved Python SDK root documentation presents v2 as stable, while the fetched
GitHub README still describes v1 as stable and v2 as alpha with historical target
dates. The published sources therefore cannot be treated as a perfectly synchronized
release snapshot. This setup deliberately selects the maintenance v1 line and checks
its behavior locally rather than relying on a latest-version label.
[SDK repository](https://github.com/modelcontextprotocol/python-sdk),
[SDK documentation root](https://py.sdk.modelcontextprotocol.io/),
[versioned v1 server documentation](https://py.sdk.modelcontextprotocol.io/v1/server/).

The lock resolves mcp 1.30.0. The foundation's actual SDK smoke test negotiated
2025-11-25 over Streamable HTTP, returned the three clean contracts unchanged, and
successfully called a synthetic get_ticket. That establishes a viable local protocol
starting point on Windows/Python 3.13.2. It does not establish the unfinished bridge's
compatibility or compatibility with arbitrary desktop clients.

Use the low-level SDK server for exact tool metadata. A decorator-generated schema
can differ from a handwritten baseline and create false drift before an attack
occurs. The smoke test demonstrates the exact-contract path. The bridge should
terminate and originate its own MCP sessions and advertise only implemented
capabilities. It should not claim universal transparent proxy behavior.
[Low-level SDK server](https://py.sdk.modelcontextprotocol.io/v1/low-level-server/),
[SDK client documentation](https://py.sdk.modelcontextprotocol.io/v1/client/).

### A small MCP transport is still real MCP

Streamable HTTP supports JSON responses and optional streaming behavior; using a
restricted SDK-supported transport is different from inventing similarly named
REST routes. Preserve initialization, request IDs, errors and negotiated version
through the SDK. The transport specification also requires Origin validation and
recommends loopback binding for local servers. Localhost alone is not the complete
browser security boundary.
[Transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

Full discovery matters because tools/list supports cursor pagination. A partial
page must not be treated as the entire server manifest: otherwise removals can be
invented and later-page additions missed. For the single-target demo, bounded
pagination and explicit failure are enough; an arbitrary-server aggregation system
is out of scope. [Pagination specification](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination).

The 2026-07-28 tool specification also changes aspects of the protocol and restricts
tool sets that vary as a consequence of requests on a connection. The delayed
fixture is intentionally malicious; it should not be presented as an example of
latest-spec compliant behavior. The defense can investigate an adversarial violation
without claiming to implement that newer protocol revision.
[MCP tools, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

### Call freshness and prevention evidence

**Engineering recommendation:** refresh the complete manifest before each tool call
for this tiny fixture. This prevents a cached client from skipping discovery and
calling an unapproved tool directly. Apply the pure enforcement decision before
network dispatch. Refuse the action if discovery cannot be verified. Bound request
time, pages, tools and error payloads to keep the demo understandable.

This is still a check-then-use design. A malicious server can lie about metadata or
change behavior after responding. No local hash can make that remote behavior
atomic. Independent capability limits or execution isolation would address other
parts of that problem, but are not properties of this implementation.

The upstream fixture must maintain a received-call counter independent of Sentinel's
event store. In a quiet demo run, the counter's before/after difference should be
zero for a denied attempt and one for an allowed call. A DENIED log entry alone is
not sufficient evidence: the code might log denial and still forward. Likewise,
inspect the actual tools/list response to establish that poisoned text was withheld.

## Wasmer track assessment

Wasmer's September 1 announcement describes an embeddable local sandbox SDK for
agent execution. That offers a plausible secondary experiment: isolate an owned
fixture's execution with explicitly provided dummy files and demonstrate the
difference between contract gating and resource access. Vendor speed claims are
not independently measured here and should not enter the pitch as local results.
[Wasmer announcement](https://wasmer.io/posts/wasmer-local-sandboxes-for-ai-agents).

The inspected wasmer-sdk 0.1.2 package page lists macOS and Linux wheels on arm64
and x86_64; it does not list a native Windows wheel. This is a version-specific
constraint, not a claim that all Wasmer products lack Windows support. The older
wasmer runtime package and the new sandbox SDK are different products. Changing
the main build environment to pursue this track would add time and integration risk.
[Versioned package documentation](https://pypi.org/project/wasmer-sdk/0.1.2/).

**Recommendation:** keep Wasmer outside the core. Consider it only after the full
demo passes, on a supported machine already available to a teammate, with a strict
time limit and an independently testable isolation claim. Running an unrelated
hello-world sandbox is weak sponsor integration. A sandbox also does not prevent
poisoned text from influencing another tool outside that sandbox; it cannot replace
the metadata exposure gate. No SDK installation, sandbox trial or sponsor-eligibility
validation was performed for this optional path.

## The refined demo

The first minute establishes legitimate utility. The client lists the reviewed
helpdesk tools and fetches a ticket, while the UI shows live requests separately
from synthetic seed history. Avoid a screen full of unexplained risk scores.
The audience should know which tool was approved and which result came from a
request made during the demonstration.

The second minute arms the fixture and makes the three ordinary calls that cross
the trigger. A subsequent discovery reveals the comment metadata change and the
new export tool. In observe mode, show the exact textual diff and a controlled call
returning a fixed dummy secret. Explain that the script chose these arguments; it
does not prove an LLM followed the injected instruction.

The third minute enables enforcement, refreshes discovery, and shows that the
poisoned definitions no longer reach the client. Direct attempts to invoke the
quarantined tools return explicit denial. The upstream counter stays unchanged.
An unchanged ticket read still succeeds, establishing useful service continuity.

The final minute states the boundary: a harmless metadata update would also require
review, and a behavior change with identical metadata is invisible to hashes.
Those negative controls make the demonstration more credible than promising
complete agent safety. End with the local result: these requests were intercepted
under this policy, with this evidence, on this authorized synthetic target.

## Implementation plan and go/no-go gates

Feature A owns discovery, fingerprinting, event persistence, the bridge and the
timeline. Feature B owns Helix's state machine, enforcement policy, lab controls
and replay. Both are full-stack assignments; their shared input/output models and
HTTP contracts are defined before either builds. The split creates independently
testable modules without making B wait for a finished detector or A wait for a UI.

The first decisive integration gate is a real client reading Helix through Sentinel.
The next is a denied call with an unchanged upstream counter. The final gate is
two full replays after reset plus failure controls. Styling, optional sponsor work
and richer scores come after those gates. The detailed clock schedule and file
ownership are in [TEAM.md](../TEAM.md); the negative tests are in
[ACCEPTANCE.md](../ACCEPTANCE.md).

| Risk | Early signal | Response |
|---|---|---|
| Protocol integration consumes the day | no working proxied SDK list/call by early afternoon | reduce advertised capabilities, reuse proven SDK wiring |
| Teammates conflict on shared files | both editing app shell/contracts | A composes; B exports policy/router/module seams |
| False prevention claim | DENIED row without target evidence | block release until counter proof passes |
| Trust reset launders malicious state | reset changes baseline to live tools | load only checked-in fixture |
| UI obscures the result | dense scores, no actual diff or source labels | show contract delta and one call-counter comparison |
| Originality challenged | judges identify existing pinning utilities | acknowledge prior art and demonstrate the investigation workflow |
| Fixture target judged insufficient | organizer rejects a self-authored target | clarify early; do not test unrelated third-party services |

Proceed if the team accepts this narrow, evidence-based claim. Do not expand into
general MCP governance during the remaining build window. Post-event work should
be driven by observed operator needs and harder adversarial evaluations, not by
the assumption that successful fixture demos establish production protection.

## Sources

Research date: September 13, 2026. Publication dates are noted only when available;
undated documentation is not assumed immutable. Official specifications and
maintainer documentation support technical claims; original disclosures and papers
support threat claims. Product pages establish documented scope, not independently
verified effectiveness. Search coverage and exclusions are recorded separately in
[search-log.json](search-log.json).

| ID | Publisher / title | Date or version | Evidence use and caveat |
|---|---|---|---|
| S01 | [Hackathons.team, AI Security Hackathon](https://luma.com/7a4iutvp) | undated event page | rubric/prizes; date/venue conflict with on-site confirmation |
| S02 | [Invariant, Tool Poisoning Attacks](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) | April 1, 2025; updated | original controlled research; historical client behavior |
| S03 | [Pillar, Deadbugz](https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign) | updated August 12, 2026 | original campaign investigation; no independent campaign probing |
| S04 | [Invariant, MCP-Scan documentation](https://invariantlabs-ai.github.io/docs/mcp-scan/) | undated, historical product docs | pinning/proxy prior art, not current-version guarantee |
| S05 | [Snyk, Agent Scan repository via original URL](https://github.com/invariantlabs-ai/mcp-scan) | fetched repository state | current project identity/modes; not executed |
| S06 | [Vercel, MCP tools](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools) | undated current documentation | named drift helpers and limitations; not locally benchmarked |
| S07 | [Docker, Securing MCP Servers](https://github.com/docker/mcp-gateway/blob/fdb82a06/docs/security.md) | pinned commit fdb82a06 | design and implementation distinctions |
| S08 | [Stacklok, ToolHive](https://github.com/stacklok/toolhive/) | fetched README | maintainer capability description; not installed |
| S09 | [MCP, Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) | 2025-11-25 | selected protocol's metadata model |
| S10 | [MCP, Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) | 2025-11-25 | HTTP framing, origins and lifecycle |
| S11 | [MCP, Pagination](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination) | 2025-11-25 | complete tool discovery |
| S12 | [MCP, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | 2026-07-28 | newer protocol differences; not local compatibility claim |
| S13 | [MCP Python SDK repository](https://github.com/modelcontextprotocol/python-sdk) | fetched README | v1 guidance, conflicts with root docs |
| S14 | [MCP Python SDK root docs](https://py.sdk.modelcontextprotocol.io/) | fetched v2 documentation | documents different release line |
| S15 | [MCP v1 Building Servers](https://py.sdk.modelcontextprotocol.io/v1/server/) | v1 | JSON/stateless supported setup |
| S16 | [MCP v1 Low-Level Server](https://py.sdk.modelcontextprotocol.io/v1/low-level-server/) | v1 | exact advertised schemas |
| S17 | [MCP v1 Writing Clients](https://py.sdk.modelcontextprotocol.io/v1/client/) | v1 | real client protocol check |
| S18 | [Wang et al., MCPTox](https://ojs.aaai.org/index.php/AAAI/article/view/40895) | March 14, 2026 | peer-reviewed benchmark, abstract inspected |
| S19 | [Debenedetti et al., AgentDojo](https://arxiv.org/pdf/2406.13352) | 2024 paper | security/utility evaluation principle |
| S20 | [Shi et al., Think Twice Before You Act](https://arxiv.org/html/2606.20922) | June 2026 preprint | planner-context threat and alternative defense; not peer-review claim |
| S21 | [Wasmer, Local Sandboxes for AI Agents](https://wasmer.io/posts/wasmer-local-sandboxes-for-ai-agents) | September 1, 2026 page date | sponsor product scope; vendor performance claims not adopted |
| S22 | [Wasmer SDK package](https://pypi.org/project/wasmer-sdk/0.1.2/) | 0.1.2 | version-specific platforms/API, not latest availability claim |

Private inputs: helix-sentinel.zip, especially EVENT.md, SPEC.md, AGENTS.md,
helix/contract.py and sentinel/seed.json, preserved under docs/handoff; on-site
confirmation of date, venue and deadline. Those inputs establish project intent
and operational facts, not external proof of security efficacy.
