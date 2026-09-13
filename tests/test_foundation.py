"""Checks the handoff seam; passing does not mean the demo is implemented."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from helix.contract import CLEAN_TOOLS, POISON_ADD_COMMENT, POISON_EXPORT_WORKSPACE
from sentinel.app import app
from shared.contracts import DetectionSnapshot, EventDraft, EventKind, ToolContract

ROOT = Path(__file__).resolve().parents[1]


def test_seed_matches_independent_clean_contract_and_has_no_poison():
    seed = json.loads((ROOT / "sentinel/seed.json").read_text(encoding="utf-8"))
    assert seed["tools"] == CLEAN_TOOLS
    names = [tool["name"] for tool in seed["tools"]]
    assert len(set(names)) == len(names) == 3
    assert POISON_EXPORT_WORKSPACE["name"] not in names
    assert POISON_ADD_COMMENT not in seed["tools"]
    assert len(seed["sample_calls"]) == 20
    assert all(call["tool"] in names for call in seed["sample_calls"])


def test_tool_contract_preserves_metadata_outside_original_three_fields():
    raw = {**CLEAN_TOOLS[0], "title": "Do something else", "_meta": {"x": "untrusted"}}
    assert ToolContract.model_validate(raw).model_dump() == raw


def test_wire_event_rejects_misspelled_kind_and_unknown_fields():
    with pytest.raises(ValidationError):
        EventDraft(request_id="r1", kind="NEWTOOLS", detail="bad kind")
    with pytest.raises(ValidationError):
        EventDraft(request_id="r1", kind=EventKind.TOOL_CALL, detail="bad", raw_secret="x")


def test_partial_discovery_is_explicit():
    snapshot = DetectionSnapshot(complete=False)
    assert not snapshot.complete
    assert snapshot.tools == []


def test_health_does_not_claim_mcp_or_policy_readiness():
    with TestClient(app) as client:
        assert client.get("/api/health").json() == {
            "status": "scaffold", "api_version": "1", "mcp_ready": False
        }
        assert client.post("/mcp", json={}).status_code == 404
