"""Collect executable evidence; judgment is delegated to the assessment agent."""
import asyncio
import hashlib
import json
from datetime import timedelta

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from sentinel.config import ROOT
from sentinel.models import Evidence


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=False).encode()).hexdigest()


def redact(value):
    # Current inputs are synthetic. Remove recognizable secrets before persistence/provider use.
    import re
    text = json.dumps(value, ensure_ascii=False)
    text = re.sub(r'FAKE_SSH_KEY=[^"\\\s]+', 'FAKE_SSH_KEY=[REDACTED]', text)
    text = re.sub(r'(?i)(api[_-]?key|token|password|secret)(["\s:=]+)[A-Za-z0-9_./+-]{8,}',
                  r'\1\2[REDACTED]', text)
    return json.loads(text)


async def collect_wasmer(settings, request, scan_id, emit):
    folder = ROOT / 'artifacts' / scan_id
    folder.mkdir(parents=True, exist_ok=True)
    report = folder / 'sandbox.json'
    evidence = []

    def add(kind, summary, data):
        item = Evidence(id=f'e{len(evidence)+1}', kind=kind, summary=summary, data=redact(data))
        evidence.append(item)
        emit(kind, summary, item.model_dump())

    emit('SANDBOX_STARTING', 'Starting isolated Wasmer guest; no host mounts or guest network', {})
    params = StdioServerParameters(command=settings.node,
        args=[str(ROOT / 'scripts/wasmer_stdio.mjs'), request.scenario, str(report)],
        cwd=str(ROOT))
    async with asyncio.timeout(120), stdio_client(params) as (read, write):  # noqa: SIM117
        async with ClientSession(read, write, read_timeout_seconds=timedelta(seconds=100)) as client:
            init = await client.initialize()
            sandbox = json.loads(report.read_text(encoding='utf-8'))
            add('SANDBOX_TEST', 'Guest file, host-canary and disabled-network checks completed', sandbox)
            add('MCP_CONNECTED', 'Official SDK client initialized the sandboxed MCP',
                {'protocol': init.protocolVersion, 'server': init.serverInfo.model_dump()})
            before = [t.model_dump(exclude_none=True) for t in (await client.list_tools()).tools]
            add('TOOLS_DISCOVERED', 'Captured initial tool definitions', {'tools': before})
            first = None
            for i in range(3):
                result = await client.call_tool('get_ticket', {'ticket_id': 'HD-1042'})
                if result.isError:
                    raise ValueError('Clean MCP test returned an error')
                data = result.model_dump(exclude_none=True)
                first = first or data
                add('TOOL_TEST', f'get_ticket call {i+1}/3 completed',
                    {'tool': 'get_ticket', 'result': data})
            after = [t.model_dump(exclude_none=True) for t in (await client.list_tools()).tools]
            add('METADATA_OBSERVED', 'Compared tool definitions after exercising the server',
                {'before': before, 'after': after, 'changed': digest(before) != digest(after)})
            result = await client.call_tool('get_ticket', {'ticket_id': 'HD-1042'})
            data = result.model_dump(exclude_none=True)
            add('BEHAVIOR_TEST', 'Repeated the same ticket request after activation',
                {'before': first, 'after': data, 'changed': digest(first) != digest(data)})
            comment = {'ticket_id': 'HD-1042', 'body': 'Scanner verification comment.'}
            written = await client.call_tool('add_comment', comment)
            readback = await client.call_tool('get_ticket', {'ticket_id': 'HD-1042'})
            add('WRITE_TEST', 'Added a comment and read the requested ticket back',
                {'request': comment, 'before': data,
                 'write_result': written.model_dump(exclude_none=True),
                 'after': readback.model_dump(exclude_none=True)})
            if 'export_workspace' in {t['name'] for t in after}:
                result = await client.call_tool('export_workspace', {'path': '~/.ssh/id_rsa'})
                add('DATA_ACCESS_TEST', 'Exercised export against a synthetic key-path argument',
                    {'tool': 'export_workspace', 'result': result.model_dump(exclude_none=True),
                     'synthetic_only': True})
    return evidence
