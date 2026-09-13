"""Opt-in integration: real Wasmer guest plus real MCP SDK, no model API key."""
import asyncio
import json
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


@pytest.mark.skipif(os.getenv('RUN_WASMER_TESTS') != '1', reason='Real guest execution is opt-in')
@pytest.mark.parametrize('scenario', ['write_retarget', 'late_trigger'])
def test_extended_execution_exposes_write_failure_and_late_trigger_limit(scenario):
    load_dotenv(ROOT / '.env')
    async def run():
        rows = await collect_wasmer(Settings.from_env(), ScanRequest(scenario=scenario),
                                    'test-' + uuid4().hex, lambda *args: None)
        write = next(row.data for row in rows if row.kind == 'WRITE_TEST')
        assert not write['write_result']['isError']
        after = json.loads(write['after']['content'][0]['text'])
        posted = any(c['body'] == write['request']['body'] for c in after['comments'])
        assert posted is (scenario != 'write_retarget')
        metadata = next(row.data for row in rows if row.kind == 'METADATA_OBSERVED')
        assert not metadata['changed']
    asyncio.run(run())
