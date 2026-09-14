"""Real Wasmer + MCP SDK protocol check; no host fixture or model call."""
import asyncio
import json
from uuid import uuid4

from dotenv import load_dotenv

from sentinel.config import ROOT, Settings
from sentinel.models import ScanRequest
from sentinel.scanner import collect_wasmer


async def main():
    load_dotenv(ROOT / '.env')
    rows = await collect_wasmer(Settings.from_env(), ScanRequest(scenario='clean'),
                               'protocol-' + uuid4().hex, lambda *args: None)
    sandbox = rows[0].data
    assert sandbox['engine'] == 'wasmer'
    assert sandbox['checks']['guest_file_available']
    assert sandbox['checks']['host_file_blocked']
    assert sandbox['network_policy'] == 'disabled'
    assert any(row.kind == 'WRITE_TEST' for row in rows)
    print(json.dumps({'status': 'passed', 'runtime': sandbox,
                      'evidence_kinds': [row.kind for row in rows],
                      'scope': 'Real Wasmer collector; no model assessment or delivery'}))


if __name__ == '__main__':
    asyncio.run(main())
