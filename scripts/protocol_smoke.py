"""Real loopback MCP handshake with the pinned SDK; not a Sentinel end-to-end test.

Uses an ephemeral port, exact clean fixture metadata, and a synthetic response.
No host MCP configuration, external targets, or actual files are accessed.
"""

import asyncio
import json
import socket
from contextlib import asynccontextmanager
from importlib.metadata import version

import uvicorn
from mcp import ClientSession, types
from mcp.client.streamable_http import streamable_http_client
from mcp.server.lowlevel import Server
from mcp.server.streamable_http_manager import StreamableHTTPSessionManager
from mcp.server.transport_security import TransportSecuritySettings
from starlette.applications import Starlette
from starlette.routing import Route

from helix.contract import CLEAN_TOOLS


async def main() -> None:
    fixture = Server("helix-protocol-smoke")

    @fixture.list_tools()
    async def list_tools() -> list[types.Tool]:
        return [types.Tool(**tool) for tool in CLEAN_TOOLS]

    @fixture.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
        if name != "get_ticket":
            raise ValueError("Only get_ticket is implemented in this transport spike")
        return [types.TextContent(type="text", text=json.dumps({"id": arguments["ticket_id"]}))]

    manager = StreamableHTTPSessionManager(
        app=fixture,
        json_response=True,
        stateless=True,
        security_settings=TransportSecuritySettings(
            enable_dns_rebinding_protection=True,
            allowed_hosts=["127.0.0.1:*"],
            allowed_origins=["http://127.0.0.1:*"],
        ),
    )

    @asynccontextmanager
    async def lifespan(_app):
        async with manager.run():
            yield

    class Endpoint:
        async def __call__(self, scope, receive, send):
            await manager.handle_request(scope, receive, send)

    app = Starlette(
        routes=[Route("/mcp", endpoint=Endpoint(), methods=["GET", "POST", "DELETE"])],
        lifespan=lifespan,
    )
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    server = uvicorn.Server(uvicorn.Config(app, log_level="error", lifespan="on"))
    task = asyncio.create_task(server.serve(sockets=[sock]))
    try:
        async with asyncio.timeout(15):
            while not server.started:
                if task.done():
                    await task
                    raise RuntimeError("Smoke server stopped before becoming ready")
                await asyncio.sleep(0.02)
            async with (
                streamable_http_client(f"http://127.0.0.1:{port}/mcp") as (read, write, _),
                ClientSession(read, write) as client,
            ):
                initialized = await client.initialize()
                listed = await client.list_tools()
                # Ensure schema generation does not silently rewrite the approved seed.
                assert [t.model_dump(exclude_none=True) for t in listed.tools] == CLEAN_TOOLS
                result = await client.call_tool("get_ticket", {"ticket_id": "HD-1042"})
                assert not result.isError
                assert json.loads(result.content[0].text) == {"id": "HD-1042"}
                print(json.dumps({
                    "status": "passed", "mcp_package": version("mcp"),
                    "protocol_version": initialized.protocolVersion,
                    "tools": len(listed.tools), "transport": "Streamable HTTP",
                    "scope": "SDK fixture only; Sentinel proxy is not implemented",
                }))
    finally:
        server.should_exit = True
        try:
            await asyncio.wait_for(task, timeout=5)
        finally:
            sock.close()


if __name__ == "__main__":
    asyncio.run(main())
