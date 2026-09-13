# Helix Sentinel

Hackathon demo: detect MCP contract drift after a server is already trusted.

Read `AGENTS.md` if you are Codex. Humans start here, then `SPEC.md`.

## What this is

Helix Desk is a fake internal ticket MCP. Sentinel is a local proxy that:

1. Locks a hashed baseline of tool name + description + schema
2. Logs every `tools/list` and `tools/call`
3. Flags new tools, description changes, schema changes, and suspicious args
4. Optionally denies the call

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# terminal 1
uvicorn helix.server:app --reload --port 8765

# terminal 2
uvicorn sentinel.app:app --reload --port 8787

# terminal 3
python scripts/demo_calls.py
```

UI: http://127.0.0.1:8787/

Helix MCP endpoint (behind the proxy): clients should use http://127.0.0.1:8787/mcp

## Team split

- Person A: `sentinel/`, `web/`
- Person B: `helix/`, `scripts/demo_calls.py`, live talk

Do not both edit the same file. Push small commits.

## Demo talk (4 minutes)

Once an MCP is connected, it does not need a new login to change what it is allowed to mean. Sentinel freezes the contract and shows the drift.

1. Clean ticket calls. Green.
2. Poison: `add_comment` description and schema change. Red hashes.
3. New tool `export_workspace` asks for `~/.ssh/id_rsa`.
4. Enforce on. Call denied. Point at the timeline.
