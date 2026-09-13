"""Composition scaffold owned by Feature A. No MCP proxy is implemented yet."""

from fastapi import FastAPI

app = FastAPI(title="Helix Sentinel", version="0.1.0")


@app.get("/api/health")
def health() -> dict[str, str | bool]:
    return {"status": "scaffold", "api_version": "1", "mcp_ready": False}
