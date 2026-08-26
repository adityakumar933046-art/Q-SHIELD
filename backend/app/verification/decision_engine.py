from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.verification.measurement_analyzer import MeasurementAnalysis
from app.verification.acceptance_policy import PolicyEvaluation
from app.qds.verifier import VerificationEvidence
from app.security.threat_engine import ThreatAssessment


class VerificationDecision(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    INCONCLUSIVE = "INCONCLUSIVE"
    ERROR = "ERROR"


class VerificationDecisionResult(BaseModel):
    decision: VerificationDecision
    decision_status: str
    signature_id: str
    message_match: bool
    signature_valid: bool
    error_rate: float
    threshold: float
    fidelity: Optional[float] = None
    threat_level: str
    reasons: List[str]
    analysis: MeasurementAnalysis
    policy_eval: PolicyEvaluation
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DecisionEngine:
    """Combines VerificationEvidence, MeasurementAnalysis, and PolicyEvaluation into final decision."""

    @staticmethod
    def decide(
        evidence: VerificationEvidence,
        analysis: MeasurementAnalysis,
        policy_eval: PolicyEvaluation,
        threat_assessment: ThreatAssessment
    ) -> VerificationDecisionResult:
        if not analysis.valid:
            decision = VerificationDecision.ERROR
            decision_status = "MEASUREMENT_ANALYSIS_ERROR"
        elif policy_eval.accepted:
            decision = VerificationDecision.ACCEPT
            decision_status = "SIGNATURE_VERIFIED_AND_ACCEPTED"
        else:
            decision = VerificationDecision.REJECT
            decision_status = "SIGNATURE_REJECTED"

        return VerificationDecisionResult(
            decision=decision,
            decision_status=decision_status,
            signature_id=evidence.signature_id,
            message_match=evidence.message_match,
            signature_valid=evidence.signature_valid,
            error_rate=analysis.error_rate,
            threshold=policy_eval.threshold,
            fidelity=analysis.fidelity,
            threat_level=threat_assessment.severity.value,
            reasons=policy_eval.reasons,
            analysis=analysis,
            policy_eval=policy_eval,
            metadata=evidence.metadata
        )
