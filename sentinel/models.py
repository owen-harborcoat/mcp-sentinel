"""Validated scan evidence and agent judgments."""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, PrivateAttr, model_validator

Severity = Literal["info", "low", "medium", "high", "critical"]
SEVERITIES = {"info": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    kind: str
    summary: str = Field(max_length=1500)
    data: dict = Field(default_factory=dict)


class Judgment(BaseModel):
    _resolved_model: str | None = PrivateAttr(default=None)
    model_config = ConfigDict(extra="forbid")
    flag: bool
    severity: Severity
    category: Literal["instruction_abuse", "data_access", "behavior", "capability", "none"]
    title: str = Field(min_length=3, max_length=100)
    rationale: str = Field(min_length=10, max_length=2000)
    evidence_ids: list[str] = Field(max_length=20)
    recommendation: str = Field(min_length=5, max_length=1000)

    @model_validator(mode="after")
    def consistent(self):
        if self.flag and (not self.evidence_ids or self.category == "none"):
            raise ValueError("A finding requires cited evidence and a category")
        if not self.flag and (self.category != "none" or self.severity != "info"):
            raise ValueError("An unflagged assessment must be informational")
        return self


class ScanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario: Literal["clean", "benign", "poison", "behavior"] = "poison"
    runtime: Literal["wasmer", "demo"] = "wasmer"
    assessor: Literal["openrouter", "gemini", "demo"] = "demo"


class AlertAction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["acknowledge", "resolve", "reopen"]


class DeliveryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    channel: Literal["telegram", "twilio"]
