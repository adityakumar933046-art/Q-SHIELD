import uuid
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class AttackType(str, Enum):
    FORGERY = "FORGERY"
    IMPERSONATION = "IMPERSONATION"
    REPLAY = "REPLAY"
    CHANNEL_MANIPULATION = "CHANNEL_MANIPULATION"
    UNAUTHORIZED_VERIFICATION = "UNAUTHORIZED_VERIFICATION"


class AttackStatus(str, Enum):
    CREATED = "CREATED"
    PREPARED = "PREPARED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"


class AttackOutcome(str, Enum):
    DETECTED = "DETECTED"
    NOT_DETECTED = "NOT_DETECTED"
    BLOCKED = "BLOCKED"
    FAILED = "FAILED"


class AttackResult(BaseModel):
    attack_id: str = Field(default_factory=lambda: f"ATK-{uuid.uuid4().hex[:12].upper()}")
    attack_type: AttackType
    status: AttackStatus
    detected: bool
    blocked: bool
    success: bool  # True ONLY if security control was bypassed!
    severity: str = "MEDIUM"
    target: str = "local_qshield"
    evidence: Dict[str, Any] = Field(default_factory=dict)
    triggered_controls: List[str] = Field(default_factory=list)
    verification_result: Optional[Dict[str, Any]] = None
    statistical_result: Optional[Dict[str, Any]] = None
    duration: float = 0.0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseAttack:
    """Abstract Base Class for controlled defensive attack simulations against Q-SHIELD."""

    ALLOWED_TARGETS = {"local", "local_qshield", "qshield_test", "localhost", "127.0.0.1"}

    def __init__(self, attack_type: AttackType, target: str = "local_qshield"):
        self.attack_type = attack_type
        self.target = target
        self._validate_target()

    def _validate_target(self) -> None:
        """Enforce strict target domain restriction to local Q-SHIELD simulation targets."""
        if not any(allowed in self.target.lower() for allowed in self.ALLOWED_TARGETS):
            raise ValueError(f"Attack target '{self.target}' is rejected. External target execution is prohibited.")
