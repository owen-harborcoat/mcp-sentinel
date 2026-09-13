# Decisions from handoff review

> Historical initial decisions. Current decisions are in SPEC.md, docs/ALERTS.md
> and docs/research/PRODUCT_REVISION.md. In particular, Wasmer is mandatory for real
> execution and agent judgment decides alerts; metadata quarantine is not the product.

| Handoff issue | Current decision | Reason |
|---|---|---|
| Split Sentinel/UI vs fixture/scripts | Two full-stack features: monitor and attack lab | User selected feature ownership |
| Event page conflicts with ZIP | September 13, EF 501 Folsom, 6 PM finish | User confirmed on-site facts |
| Hashes catch same-name behavior changes | Limit promise to observed metadata equality | Behavioral swaps are invisible to hashes |
| Simplified API may still be called MCP | Never mislabel; use pinned official SDK and client proof | Protocol credibility matters |
| Two different FastMCP packages | Only official mcp v1 SDK; mcp 1.30.0 lock | Avoid competing APIs and unbounded major-version changes |
| Mutation immediate in one section, delayed elsewhere | Both changes occur after third successful armed call | Deterministic shared state machine |
| Observe by default | Enforce by default; observe is explicit lab mode | Demo starts with protective behavior |
| Log drift then forward descriptors | Quarantine before client discovery in enforce mode | Descriptions can affect other tools without invocation |
| Only three metadata fields | Preserve original digests plus full metadata hash | Title/output/annotations/extensions are also untrusted |
| Baseline might change on reset | Reset always reloads checked-in reviewed seed | Reset must not approve active poison |
| Seed traffic looks like real history | Explicit synthetic source, separate live counts | Audit honesty |
| Denial shown only in timeline | Require upstream received-call delta zero | Verify the actual enforcement effect |
| Risk score grows with polling | Deduplicate unchanged drift; label points illustrative | No artificial risk inflation |
| Wasmer excluded without investigation | Research as optional; retain no-sponsor core | Sandbox is a different boundary, new SDK has platform constraints |
| Originality asserted implicitly | Acknowledge MCP-Scan and Vercel drift utilities | Demonstration quality is the credible differentiation |

References and supporting evidence are in docs/research/VALIDATION.md. These are
the current implementation decisions; docs/handoff retains the originals without
silently altering their contents.
