# Team workflow

Start with docs/TEAM.md and the matching CODEX_PROMPT file. The initialized local
repository has main plus feature/contract-monitor and feature/attack-lab. The
feature branches began at the original foundation; merge updated main into each
before starting the sandbox/alerts feature work. No remote has been selected or created.

## Separate computers

Once the team chooses a repository host and URL, publish this foundation and let
each teammate clone it and check out their assigned branch. Do not put credentials
in URLs or tracked files. Feature branches can also be created locally from main.
No license is selected; choose one together before public distribution.

## Two checkouts on one computer

From the main repository, create separate worktrees if useful:

```sh
git worktree add ../helix-monitor feature/contract-monitor
git worktree add ../helix-lab feature/attack-lab
```

Run uv sync --frozen --extra dev and npm ci in each (Node 24+). Worktrees share Git history but not their
working files or virtual environments. Do not run both copies of the services on
the same ports at once. These commands are optional; no worktrees were pre-created.

## Integrate early

Commit small vertical slices. At the checkpoint, merge A then B into main using
ordinary reviewed merges, run locked checks, then both branches merge main back.
Agree on changes to the shared seam before coding them. Do not independently
rewrite lockfiles, contracts, app composition, or the HTML shell.

The local PR template captures behavior, validation, and integration dependencies.
GitHub CI is supplied for Windows and Linux but has not run remotely. Local
validation covers Windows only until another host or CI actually runs it.
