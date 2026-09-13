# Demo acceptance and negative controls

These are implementation requirements. None is marked passed by the scaffold's
foundation tests. Use actual SDK traffic and upstream effects for integration cases.

| Case | Stimulus | Required evidence |
|---|---|---|
| Clean utility | list/get/add_comment through Sentinel | success, approved metadata, zero live drift |
| Trigger boundary | 0, 1, 2, 3 clean calls while poison armed | mutations absent before threshold, both present afterward |
| Description-only | change description only | DESC_HASH_MISMATCH; quarantine and deny |
| Schema-only | add sidenote with unchanged description | SCHEMA_HASH_MISMATCH; quarantine and deny |
| Added harmless-name tool | new tool named lookup | NEW_TOOL; enforce denies without high-risk name heuristic |
| Removed tool | remove get_ticket | REMOVED_TOOL; direct call denied |
| Extra metadata | change title, outputSchema, annotations or extension text | METADATA_HASH_MISMATCH; no unreviewed metadata exposure |
| Canonical ordering | reorder dictionary keys only | same hashes; no false drift from object order |
| Arrays/strings | reorder required array or change whitespace in a description | documented syntactic drift; not semantic-equivalence claim |
| Hidden arguments | path marker in nested object/list and backslash form | ARG_ANOMALY with safe summary |
| No preceding list | directly call export after activation | fresh discovery; deny before upstream handler |
| Discovery failure | timeout, repeated cursor, duplicate name, missing page, invalid JSON | DISCOVERY_FAILED; no call forwarded |
| Discovery poisoning | list tools in enforce mode | poisoned text absent from SDK-visible response |
| Counter proof | compare received_tool_calls immediately before/after denied call | delta exactly zero; no concurrent traffic in measurement |
| Still useful | get_ticket after other tools quarantined | successful result and counter delta one |
| Poll stability | refresh same poisoned list repeatedly | drift findings deduped, score stable, call rows retained |
| Reset safety | reset while Helix remains poisoned | seed unchanged; next discovery still flags poison |
| Synthetic history | startup with sample rows | visible synthetic labels, excluded from live counts |
| Host/Origin | hostile Origin or Host on MCP/control route | rejected before mutation or forwarding |
| HTML payload | tool description contains markup | rendered literally, no script/HTML execution |
| MCP correctness | official SDK init/list/call and isError result | negotiated version recorded; no hand-built API substitution |
| Repeatability | reset both services and run four beats twice | both runs pass; no leaked state or hidden restart steps |
| Benign update control | harmless description correction | still drift; demonstrates operational false alarm tradeoff |
| Behavior-only control | change dummy result without metadata change | no metadata alert; limitation explicitly shown |

Report fixture pass counts only as fixture results, not attack-success rates or
real-world detection coverage. A timeline DENIED row without the counter assertion
does not prove prevention. Test the discovery response separately from tool calls.
