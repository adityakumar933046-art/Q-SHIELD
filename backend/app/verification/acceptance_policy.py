from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.config.security_config import security_settings
from app.verification.measurement_analyzer import MeasurementAnalysis
from app.qds.verifier import VerificationEvidence
from app.security.threat_engine import ThreatAssessment, Severity


class PolicyEvaluation(BaseModel):
    eligible: bool
    accepted: bool
    reasons: List[str]
    failed_rules: List[str]
    passed_rules: List[str]
    threshold: float
    metrics: Dict[str, Any] = Field(default_factory=dict)


class AcceptancePolicy:
    """Evaluates whether verification evidence and measurement analysis satisfy security & protocol policies."""

    def __init__(self, threshold: Optional[float] = None):
        self.threshold = threshold or security_settings.VERIFICATION_THRESHOLD

    def evaluate(
        self,
        analysis: MeasurementAnalysis,
        evidence: VerificationEvidence,
        threat_assessment: ThreatAssessment
    ) -> PolicyEvaluation:
        passed_rules: List[str] = []
        failed_rules: List[str] = []
        reasons: List[str] = []

        # Security Precedence Rule 1: Message Digest Match
        if evidence.message_match:
            passed_rules.append("Rule: Message Digest Match")
        else:
            failed_rules.append("Rule: Message Digest Mismatch")
            reasons.append("Message has been tampered with or modified.")

        # Security Precedence Rule 2: Session Validity
        if evidence.session_valid:
            passed_rules.append("Rule: QDS Session Valid")
        else:
            failed_rules.append("Rule: QDS Session Invalid or Expired")
            reasons.append("QDS Session is invalid or expired.")

        # Security Precedence Rule 3: Nonce Validity
        if evidence.nonce_valid:
            passed_rules.append("Rule: Nonce Valid")
        else:
            failed_rules.append("Rule: Nonce Mismatch")
            reasons.append("Session nonce mismatch.")

        # Security Precedence Rule 4: Replay Protection Check
        if not evidence.replay_detected:
            passed_rules.append("Rule: Replay Protection Passed")
        else:
            failed_rules.append("Rule: Replay Attack Detected")
            reasons.append("Replay attack detected: security identifier reused.")

        # Security Precedence Rule 5: Threat Severity Check
        if threat_assessment.severity != Severity.CRITICAL:
            passed_rules.append(f"Rule: Threat Severity Acceptable ({threat_assessment.severity.value})")
        else:
            failed_rules.append("Rule: Critical Threat Detected")
            reasons.append(f"Threat engine reported CRITICAL severity: {threat_assessment.threat_type}")

        # Quantum Metric Rule 6: Measurement Consistency / Acceptance Threshold
        # Threshold: consistency_score >= threshold (e.g. 0.89) or fidelity >= threshold
        metric_score = analysis.fidelity if analysis.fidelity is not None else analysis.consistency_score
        if metric_score >= self.threshold:
            passed_rules.append(f"Rule: Quantum Acceptance Threshold Met ({metric_score:.4f} >= {self.threshold:.4f})")
        else:
            failed_rules.append(f"Rule: Quantum Threshold Failed ({metric_score:.4f} < {self.threshold:.4f})")
            reasons.append(f"Quantum verification score {metric_score:.4f} below threshold {self.threshold:.4f}")

        eligible = len(failed_rules) == 0
        accepted = eligible

        if accepted:
            reasons.append("All security precedence rules and quantum acceptance threshold criteria passed.")

        return PolicyEvaluation(
            eligible=eligible,
            accepted=accepted,
            reasons=reasons,
            failed_rules=failed_rules,
            passed_rules=passed_rules,
            threshold=self.threshold,
            metrics={
                "metric_score": metric_score,
                "error_rate": analysis.error_rate,
                "fidelity": analysis.fidelity,
                "threat_score": threat_assessment.score
            }
        )
