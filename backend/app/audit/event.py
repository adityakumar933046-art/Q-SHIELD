import uuid
import hashlib
import json
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class AuditEventCategory(str, Enum):
    SECURITY = "SECURITY"
    AUTHENTICATION = "AUTHENTICATION"
    AUTHORIZATION = "AUTHORIZATION"
    QDS_PROTOCOL = "QDS_PROTOCOL"
    VERIFICATION = "VERIFICATION"
    QUANTUM_ENGINE = "QUANTUM_ENGINE"
    ATTACK_SIMULATION = "ATTACK_SIMULATION"
    EXPERIMENT = "EXPERIMENT"
    SYSTEM = "SYSTEM"


class AuditSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


def calculate_event_checksum(
    event_type: str,
    category: str,
    severity: str,
    action: str,
    actor_id: Optional[str],
    resource_id: Optional[str],
    status: str,
    timestamp_str: str,
    details: Dict[str, Any]
) -> str:
    """Compute canonical SHA-256 checksum over audit event parameters for tamper detection."""
    details_json = json.dumps(details or {}, sort_keys=True)
    canonical = f"{event_type}|{category}|{severity}|{action}|{actor_id or ''}|{resource_id or ''}|{status}|{timestamp_str}|{details_json}"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class AuditEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:12].upper()}")
    event_type: str
    category: AuditEventCategory = AuditEventCategory.SECURITY
    severity: AuditSeverity = AuditSeverity.INFO
    actor_id: Optional[str] = None
    resource_id: Optional[str] = None
    action: str
    status: str = "SUCCESS"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = "127.0.0.1"
    details: Dict[str, Any] = Field(default_factory=dict)
    checksum: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def compute_and_set_checksum(self) -> str:

        ts_str = self.timestamp.isoformat()
        chk = calculate_event_checksum(
            event_type=self.event_type,
            category=self.category.value,
            severity=self.severity.value,
            action=self.action,
            actor_id=self.actor_id,
            resource_id=self.resource_id,
            status=self.status,
            timestamp_str=ts_str,
            details=self.details
        )
        self.checksum = chk
        return chk

    def verify_integrity(self) -> bool:
        """Verify event integrity by recalculating SHA-256 checksum."""
        ts_str = self.timestamp.isoformat()
        expected = calculate_event_checksum(
            event_type=self.event_type,
            category=self.category.value,
            severity=self.severity.value,
            action=self.action,
            actor_id=self.actor_id,
            resource_id=self.resource_id,
            status=self.status,
            timestamp_str=ts_str,
            details=self.details
        )
        return expected == self.checksum
