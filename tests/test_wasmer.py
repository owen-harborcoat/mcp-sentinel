"""Opt-in integration: real Wasmer guest plus real MCP SDK, no model API key."""
import asyncio
import os
from uuid import uuid4

import pytest
from dotenv import load_dotenv

from sentinel.assessor import assess_demo
from sentinel.config import ROOT, Settings
from sentinel.models import ScanRequest
from sentinel.scanner import collect_wasmer


@pytest.mark.skipif(os.getenv('RUN_WASMER_TESTS') != '1', reason='Set RUN_WASMER_TESTS=1 for real guest execution')
@pytest.mark.parametrize('scenario,flag', [('clean', False), ('benign', False), ('poison', True), ('behavior', True)])
def test_sandbox_mcp_scenarios(scenario, flag):
    load_dotenv(ROOT / '.env')
    async def run():
        rows = await collect_wasmer(Settings.from_env(), ScanRequest(scenario=scenario),
                                    'test-' + uuid4().hex, lambda *args: None)
        sandbox = rows[0].data
        assert sandbox['engine'] == 'wasmer' and sandbox['host_mounts'] == []
        assert sandbox['checks']['host_file_blocked'] and sandbox['checks']['guest_file_available']
        assert sandbox['network_policy'] == 'disabled'
        assert (await assess_demo(Settings(), rows)).flag is flag
    asyncio.run(run())
