# Product correction and implementation evidence

September 13, 2026. This supersedes the narrow recommendation in VALIDATION.md.

## Recommendation

Build the user's original broader workflow: **run MCPs in Wasmer, execute tests,
let a scanning agent assess the evidence, and give people a clean monitoring and
alert investigation workspace.** The prior recommendation incorrectly treated
existing drift primitives as a reason to narrow the entire product to drift.
It also treated Wasmer as optional despite sandbox execution being central to
the intended product. Both decisions are reversed.

This is a credible hackathon implementation, with working local execution now
demonstrated. Commercial demand and uniqueness remain unvalidated; competitive
overlap does not by itself invalidate the workflow.

## Competitive grounding, with precise boundaries

Vercel's relevant feature is a pair of SDK helpers, fingerprintTools and
detectToolDrift. It compares definition fingerprints; the application must own
baseline persistence and the response. It cannot observe behavior changes behind
unchanged definitions. That is useful infrastructure, not a turnkey Wasmer test
lab or alert investigation workspace. The important distinction is product scope,
not whether it takes one or two function calls.
[Vercel MCP documentation](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools).

The older OSS MCP-Scan documentation does explicitly describe proxy-mode runtime
monitoring, logging and guardrails. Therefore we should not pitch against it by
claiming that no monitoring or observability exists. Those docs do not establish
a comparable integrated Wasmer execution/test/evidence dashboard. The present
successor, Snyk Agent Scan, also documents background reporting to its Evo platform;
that broader product must be distinguished from the standalone OSS CLI.
[MCP-Scan docs](https://invariantlabs-ai.github.io/docs/mcp-scan/),
[Snyk Agent Scan README](https://github.com/snyk/agent-scan).

The current Agent Scan README warns that scanning stdio MCP configurations starts
the configured server commands, and recommends a sandbox for untrusted configs.
That is evidence for the practical importance of execution isolation. It does
not prove Wasmer is uniquely suitable or that competitors cannot add it.
[Source](https://github.com/snyk/agent-scan#security-warning).

Our differentiating hypothesis is the integrated workflow: isolated execution,
repeatable behavioral tests, agent triage, and durable evidence attached to an
alert timeline. The build should demonstrate that workflow rather than claiming
any one component is novel. Customer interviews are still needed to validate
who would adopt it and what integration they require.

## Feasibility evidence now obtained

The Wasmer JavaScript SDK runs a Python guest locally and exposes explicit files,
commands and network policy. It does not require an API key for this local path.
The implementation uses SDK 0.11.0 and python/python@=3.13.5 with Node 24.19.0.
Node 22.14 failed the pinned runtime on the tested Windows machine.
[Wasmer runtime docs](https://docs.wasmer.io/runtime/js/),
[SDK package](https://www.npmjs.com/package/@wasmer/sdk).

Local tests initialized the guest MCP with the official Python MCP SDK and ran
four scenarios. The real guest could read an explicitly supplied synthetic file
and could not read a host-only random canary. Network policy was disabled and a
connection probe failed. These are bounded observations, not a complete isolation
proof. Filesystem, subprocess and egress coverage should expand with each newly
supported target/runtime.

The four scenarios separate capabilities that the earlier pivot conflated:

| Scenario | Evidence | Intended assessment |
|---|---|---|
| Clean | Stable contract and output | No alert |
| Harmless clarification | Changed instruction text | No alert; keep observation |
| Delayed poisoning | Key-seeking instruction plus new export after calls | Flag with rationale |
| Behavior change | Changed output, same metadata | Flag behavioral concern |

All four execute in real Wasmer today. The keyless demo assessor produces the
expected judgments deterministically. This validates plumbing and demonstrability;
it is not evidence that a real model will make those decisions accurately.

## Agent and alert design

The model receives bounded test evidence, not authority to obey tool text. It
chooses flag/severity/category/rationale and cites evidence IDs under a strict
schema. Invalid responses and failed runtime/model requests produce failed scans.
No hash delta bypasses judgment. The implementation provides the Gemini adapter
and a visibly labeled test double; real provider evaluation awaits the key.
[Gemini structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

Alerts persist across runs, deduplicate repeated evidence, support acknowledgment,
resolution and reopening, and retain a timeline. A harmless observation is still
visible. High/critical alerts can generate notification attempts, with fixed
recipients and minimal payloads. Provider failure or uncertain delivery is visible.
This is the implemented product behavior, not a roadmap-only presentation.

## Free channel choice

Dashboard and browser notifications need no paid provider. Telegram bot messaging
is suitable for optional free push at this demonstration's volume; the adapter
does not enable paid broadcasts. Gemini lists model-specific free tiers, subject
to account eligibility and quota.
[Telegram FAQ](https://core.telegram.org/bots/faq),
[Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage),
[Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing).

Twilio's currently documented trial restricts SMS content to predefined templates.
It cannot honestly be promised as free arbitrary security-alert SMS. The custom
SMS adapter is implemented for an eligible account, but the no-cost demo should
use dashboard/browser/Telegram. No provider messages were sent during this build.
[Twilio SMS trial](https://www.twilio.com/docs/usage/trials/try-out-sms),
[Messages API](https://www.twilio.com/docs/messaging/api/message-resource).

## What to validate before pitching

Evaluate the actual model on benign and malicious instruction edits plus stable
metadata behavior changes; record false positives and missed findings. Give each
teammate a clean setup and run the same tests on their OS. Show the full investigation
loop from real execution to evidence to resolution. Admit that target onboarding,
scheduling, fleet support and broader runtime coverage are next steps.

Ask potential users which MCP approval decisions they cannot make confidently,
which evidence would change that decision, and where alerts must arrive. None of
the sources inspected establishes willingness to pay. An honest pitch can claim
a working sandbox test-and-review workflow and measurable demo cases without
claiming complete prompt-injection prevention or a unique market category.

All external sources above were discovered with Exa search and inspected with Exa
fetch. No generic web search substituted for Exa. Local execution findings are
from this repository's tests and dashboard, not vendor marketing.
