$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    uv sync --frozen --extra dev
    if ($LASTEXITCODE -ne 0) { throw 'Dependency sync failed' }
    uv run --frozen ruff check .
    if ($LASTEXITCODE -ne 0) { throw 'Lint failed' }
    uv run --frozen pytest -q
    if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
    uv run --frozen python -m scripts.protocol_smoke
    if ($LASTEXITCODE -ne 0) { throw 'MCP protocol smoke failed' }
} finally { Pop-Location }
