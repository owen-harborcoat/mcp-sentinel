# Helix Sentinel

Review what an MCP server advertises, quarantine unapproved changes, and prove
whether a blocked tool call reached the server.

**Status: initialized foundation, not a working security product yet.** The ZIP's
fixtures, shared API contracts, dependency lock, health endpoint, test setup,
teammate briefs and research are ready. Detection, enforcement, UI and the full
demo remain the teammates' implementation work.

## Start here

1. [Team assignments and today's checkpoints](docs/TEAM.md).
2. [Refined build specification](SPEC.md) and [shared interfaces](docs/INTERFACES.md).
3. [Research findings and recommendation](docs/research/VALIDATION.md).
4. Open [Feature A brief](CODEX_PROMPT_A.md) or [Feature B brief](CODEX_PROMPT_B.md).
5. [Current status and next steps](RESUME.md).

## Setup

Requires Git, Python 3.13 and uv. Run from the repo root on Windows, macOS or Linux:

```sh
uv sync --frozen --extra dev
uv run --frozen ruff check .
uv run --frozen pytest -q
uv run --frozen python -m scripts.protocol_smoke
```

Windows all-in-one: `powershell -File scripts/check.ps1`.
The protocol smoke uses an ephemeral loopback server, verifies exact clean tool
metadata, initializes an official SDK client and calls a synthetic get_ticket.
It does not run the Sentinel proxy or four-beat attack demo.

The scaffold can be started now:

```sh
uv run --frozen uvicorn sentinel.app:app --host 127.0.0.1 --port 8787
```

Only `/api/health` is implemented; it reports `mcp_ready: false`. No UI or `/mcp`
route exists yet. Do not use this as a security gateway.

Optional environment file: `Copy-Item .env.example .env` in PowerShell, or
`cp .env.example .env` in a POSIX shell. Uvicorn must use `--env-file .env` to load it.
If uv is unavailable, create/activate a Python 3.13 virtual environment and run
`python -m pip install -r requirements.txt`; the export matches uv.lock.

## Two full-stack features

| Track | End-to-end feature | Branch |
|---|---|---|
| A | Contract discovery, baseline diff, quarantine, persistence and timeline | `feature/contract-monitor` |
| B | Attack lab, enforcement policy, control UI, replay and upstream denial proof | `feature/attack-lab` |

Names remain unassigned. Shared interfaces are frozen in `shared/contracts.py`.
Branches start at the same foundation commit. No remote is configured or published.
Use a separate clone per teammate; [CONTRIBUTING.md](CONTRIBUTING.md) includes the
local worktree option and integration procedure.

## Demo promise

A local, deliberately adversarial helpdesk server changes its advertised tools
after three benign calls. Observe mode exposes the change. Enforce mode withholds
changed/new definitions and refuses corresponding calls. The timeline and the
upstream call counter show what happened. A behavior-only negative control shows
the limit of metadata comparison.

This is a controlled MCP security demonstration using synthetic data. It is not
evidence of an LLM being compromised, a new attack discovery, or a general defense
against prompt injection. Hash-based pinning already exists in
[MCP-Scan](https://invariantlabs-ai.github.io/docs/mcp-scan/) and
[Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools).

The confirmed event is September 13 at Entrepreneurs First, 501 Folsom, with
building ending at 6 PM Pacific. [EVENT.md](EVENT.md) records the conflicting
public page and the user-confirmed logistics.
