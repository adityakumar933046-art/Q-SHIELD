from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class CorrelationRule(BaseModel):
    rule_id: str
    description: str
    event_types: List[str]
    time_window_seconds: int = 300
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    action: str = "FLAG_SUSPICIOUS_SESSION"


class Incident(BaseModel):
    incident_id: str
    title: str
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.OPEN
    source: str = "SECURITY_CORRELATION_ENGINE"
    correlation_id: str
    event_count: int = 1
    description: str
    related_event_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Alert(BaseModel):
    alert_id: str
    incident_id: str
    severity: IncidentSeverity
    status: str = "NEW"
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
