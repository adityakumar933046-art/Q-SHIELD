from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ThreatSignal(str, Enum):
    AUTH_FAILURE = "AUTH_FAILURE"
    AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED"
    INVALID_NONCE = "INVALID_NONCE"
    REPLAY_ATTEMPT = "REPLAY_ATTEMPT"
    UNKNOWN_IDENTITY = "UNKNOWN_IDENTITY"
    INACTIVE_USER = "INACTIVE_USER"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# Risk Point Weights for Signals
SIGNAL_WEIGHTS: Dict[ThreatSignal, float] = {
    ThreatSignal.AUTH_FAILURE: 15.0,
    ThreatSignal.AUTHORIZATION_DENIED: 25.0,
    ThreatSignal.INVALID_NONCE: 35.0,
    ThreatSignal.REPLAY_ATTEMPT: 50.0,
    ThreatSignal.UNKNOWN_IDENTITY: 20.0,
    ThreatSignal.INACTIVE_USER: 30.0,
    ThreatSignal.RATE_LIMIT_EXCEEDED: 40.0,
}


class ThreatAssessment(BaseModel):
    detected: bool
    threat_type: str
    severity: Severity
    score: float
    reasons: List[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ThreatEngine:
    @staticmethod
    def evaluate(signals: List[ThreatSignal], metadata: Optional[Dict[str, Any]] = None) -> ThreatAssessment:
        if not signals:
            return ThreatAssessment(
                detected=False,
                threat_type="NONE",
                severity=Severity.LOW,
                score=0.0,
                reasons=["No suspicious security signals detected"],
                metadata=metadata or {}
            )

        total_score = sum(SIGNAL_WEIGHTS.get(sig, 10.0) for sig in signals)
        reasons = [f"Signal triggered: {sig.value}" for sig in signals]

        if total_score >= 75.0 or ThreatSignal.REPLAY_ATTEMPT in signals:
            severity = Severity.CRITICAL
            threat_type = "CRITICAL_SECURITY_BREACH_RISK"
        elif total_score >= 45.0:
            severity = Severity.HIGH
            threat_type = "HIGH_THREAT_ACTIVITY"
        elif total_score >= 25.0:
            severity = Severity.MEDIUM
            threat_type = "SUSPICIOUS_BEHAVIOR"
        else:
            severity = Severity.LOW
            threat_type = "MINOR_SECURITY_EVENT"

        return ThreatAssessment(
            detected=True,
            threat_type=threat_type,
            severity=severity,
            score=round(total_score, 2),
            reasons=reasons,
            metadata=metadata or {}
        )
