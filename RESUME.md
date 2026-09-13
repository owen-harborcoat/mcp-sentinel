# Current handoff

## Completed in initialization

- Preserved 16 ZIP file entries as inert reference text and recorded hashes.
- Created a local Git foundation, main and two feature branches; no remote/push.
- Locked Python 3.13 dependencies with uv; installed local .venv. mcp is 1.30.0.
- Defined typed feature seams, API contracts, ownership and copy-ready A/B briefs.
- Added a truthful health scaffold, foundation checks, Windows helper and CI file.
- Validated a real official-SDK Streamable HTTP spike with exact fixture contracts.
- Completed Exa research: 18 searches across five workstreams, 80 returned URL
  entries / 73 unique literal discovery URLs, and 22 unique fetched source pages.
- Reconciled logistics using the user's on-site confirmation: September 13,
  Entrepreneurs First, 501 Folsom; build ends 6 PM Pacific.

## Validation actually run

On Windows with Python 3.13.2:

```text
uv sync --frozen --extra dev                 PASS
uv run --frozen ruff check .                PASS
uv run --frozen pytest -q                   5 passed
uv run --frozen python -m scripts.protocol_smoke
  PASS: mcp 1.30.0, negotiated 2025-11-25,
  exact three clean definitions, synthetic get_ticket result
```

The test client reports two dependency deprecation warnings (Starlette's httpx
adapter and AnyIO's BlockingPortal alias); checks still pass. No third-party MCP
configuration was loaded. No credentials or real files were used as attack targets.
The protocol smoke stops its ephemeral local server when it exits.

GitHub's Windows/Linux workflow is configured but has not run remotely. The
requirements.txt fallback is exported from the lock but was not separately installed.

## Not implemented or validated

The actual Helix server, monitor, SQLite store, proxy, policy, APIs other than health,
UI and four-beat replay are NOT implemented. Full demo acceptance, denial counter
proof, external-client compatibility, Wasmer and deployment remain unvalidated.
Do not present the foundation tests as production or demo acceptance results.

## Resume immediately

Teammate A: use feature/contract-monitor and CODEX_PROMPT_A.md. Start detector/store;
use the SDK spike for bridge wiring. Own application composition and timeline.

Teammate B: use feature/attack-lab and CODEX_PROMPT_B.md. Start actual Helix server
and pure policy in parallel with A's work; own lab browser module and replay proof.

Keep shared/contracts.py and docs/INTERFACES.md aligned. The starter health test
intentionally requires mcp_ready=false and a missing /mcp route; replace that test
with real readiness/integration assertions when A implements the bridge.

Research recommendation: proceed as an evidence-based contract review gate and lab,
acknowledging prior art. Prioritize pre-exposure metadata quarantine and measured
non-forwarding; show benign-drift and behavior-only limits. See
docs/research/VALIDATION.md for the full cited analysis.

Open operational items: choose remote host/URL and repository visibility; assign
names to A/B; ask the on-site organizer about submission mechanism, pre-existing-code
disclosure and acceptance of the owned synthetic target. These do not block local
implementation. No remote, publishing or license choice has been made for the team.
