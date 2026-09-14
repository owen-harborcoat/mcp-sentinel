"""Opt-in integration: real Wasmer guest plus real MCP SDK, no model API key."""
import asyncio
import json
import os
from uuid import uuid4

import pytest
from dotenv import load_dotenv

from sentinel.config import ROOT, Settings
from sentinel.models import ScanRequest
from sentinel.scanner import collect_wasmer


@pytest.mark.skipif(os.getenv('RUN_WASMER_TESTS') != '1', reason='Set RUN_WASMER_TESTS=1 for real guest execution')
@pytest.mark.parametrize('scenario', ['clean', 'benign', 'poison', 'behavior'])
def test_sandbox_mcp_scenarios(scenario):
    load_dotenv(ROOT / '.env')
    async def run():
        rows = await collect_wasmer(Settings.from_env(), ScanRequest(scenario=scenario),
                                    'test-' + uuid4().hex, lambda *args: None)
        sandbox = rows[0].data
        assert sandbox['engine'] == 'wasmer' and sandbox['host_mounts'] == []
        assert sandbox['checks']['host_file_blocked'] and sandbox['checks']['guest_file_available']
        assert sandbox['network_policy'] == 'disabled'
        metadata = next(row.data for row in rows if row.kind == 'METADATA_OBSERVED')
        behavior = next(row.data for row in rows if row.kind == 'BEHAVIOR_TEST')
        assert metadata['changed'] is (scenario in ('benign', 'poison'))
        assert behavior['changed'] is (scenario == 'behavior')
        assert len([row for row in rows if row.kind == 'TOOL_TEST']) == 3
        write = next(row.data for row in rows if row.kind == 'WRITE_TEST')
        after = json.loads(write['after']['content'][0]['text'])
        assert any(c['body'] == write['request']['body'] for c in after['comments'])
        assert any(row.kind == 'DATA_ACCESS_TEST' for row in rows) is (scenario == 'poison')
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


def test_wasmer_start_failure_cannot_fall_back(tmp_path, monkeypatch):
    from sentinel.service import ScanService
    from sentinel.store import Store

    async def forbidden(*args):
        pytest.fail('Model must not run when Wasmer cannot start')
    monkeypatch.setattr('sentinel.service.assess_openrouter', forbidden)
    store = Store(tmp_path / 'no-fallback.db')
    settings = Settings(node=str(tmp_path / 'missing-node-executable'))
    service = ScanService(store, settings)
    request = ScanRequest()
    async def run():
        await service.lock.acquire()
        store.create_scan('no-fallback', request)
        await service.run('no-fallback', request)
    asyncio.run(run())
    assert store.scan('no-fallback')['status'] == 'failed'
    assert store.scan('no-fallback')['result'] is None
    assert not store.alerts()
    assert not store.deliveries()
    assert any(e['kind'] == 'SCAN_FAILED' for e in store.events())
