"""API v1 foundation, not an implementation of detection or enforcement.

Coordinate changes across both feature owners; see docs/INTERFACES.md.
"""

from enum import StrEnum
from typing import Any, Literal, Protocol

from pydantic import BaseModel, ConfigDict, Field


class EventKind(StrEnum):
    BASELINE_LOCKED = "BASELINE_LOCKED"
    TOOLS_LIST = "TOOLS_LIST"
    TOOL_CALL = "TOOL_CALL"
    NEW_TOOL = "NEW_TOOL"
    REMOVED_TOOL = "REMOVED_TOOL"
    DESC_HASH_MISMATCH = "DESC_HASH_MISMATCH"
    SCHEMA_HASH_MISMATCH = "SCHEMA_HASH_MISMATCH"
    ARG_ANOMALY = "ARG_ANOMALY"
    FIRST_SEEN_HIGH_RISK = "FIRST_SEEN_HIGH_RISK"
    PRIVILEGE_EXPAND = "PRIVILEGE_EXPAND"
    DENIED = "DENIED"
    METADATA_HASH_MISMATCH = "METADATA_HASH_MISMATCH"
    DISCOVERY_FAILED = "DISCOVERY_FAILED"


class ToolContract(BaseModel):
    # Preserve extension fields for the full-metadata digest.
    model_config = ConfigDict(extra="allow")
    name: str = Field(min_length=1)
    description: str = ""
    inputSchema: dict[str, Any]


class EventDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")
    request_id: str
    kind: EventKind
    tool: str | None = None
    detail: str
    name_hash: str | None = None
    desc_hash: str | None = None
    schema_hash: str | None = None
    tool_hash: str | None = None
    metadata_hash: str | None = None
    args_summary: str | None = None
    blocked: bool = False
    points: int = Field(default=0, ge=0)
    source: Literal["live", "synthetic"] = "live"


class Event(EventDraft):
    id: int = Field(ge=1)
    ts: str  # UTC RFC3339, assigned by the store.


class EventPage(BaseModel):
    events: list[Event]
    next_since_id: int = Field(ge=0)


class DetectionSnapshot(BaseModel):
    """Result of one complete upstream discovery; no partial-list decisions."""

    complete: bool
    tools: list[ToolContract] = Field(default_factory=list)
    reasons_by_tool: dict[str, list[EventKind]] = Field(default_factory=dict)
    events: list[EventDraft] = Field(default_factory=list)


class Decision(BaseModel):
    allowed: bool
    reasons: list[EventKind] = Field(default_factory=list)
    events: list[EventDraft] = Field(default_factory=list)


class Monitor(Protocol):
    def inspect_tools(
        self, tools: list[ToolContract], *, request_id: str, complete: bool
    ) -> DetectionSnapshot: ...


class Policy(Protocol):
    def evaluate_call(
        self,
        name: str,
        arguments: dict[str, Any],
        snapshot: DetectionSnapshot,
        *,
        request_id: str,
        enforce: bool,
    ) -> Decision: ...


class EventSink(Protocol):
    def append(self, events: list[EventDraft]) -> list[Event]: ...
