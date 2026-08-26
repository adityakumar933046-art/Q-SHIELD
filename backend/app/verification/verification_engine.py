from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.qds.protocol import QDSProtocol
from app.qds.signature import QDSSignature, QDSSignatureStatus
from app.qds.session import create_qds_session
from app.security.threat_engine import ThreatEngine, ThreatSignal
from app.security.identity import IdentityContext
from app.database.repositories import SignatureRepository, VerificationRepository
from app.verification.measurement_analyzer import MeasurementAnalyzer
from app.verification.acceptance_policy import AcceptancePolicy
from app.verification.decision_engine import DecisionEngine, VerificationDecisionResult


class VerificationEngine:
    """Master Verification Coordinator pipeline."""

    def __init__(self, threshold: Optional[float] = None):
        self.protocol = QDSProtocol()
        self.analyzer = MeasurementAnalyzer()
        self.policy = AcceptancePolicy(threshold=threshold)
        self.decision_engine = DecisionEngine()

    def verify_signature(
        self,
        signature_id: str,
        message: str,
        verifier_identity: IdentityContext,
        db: Session
    ) -> VerificationDecisionResult:
        """Execute full verification pipeline."""

        # Step 1: Retrieve Signature from Database
        sig_repo = SignatureRepository(db)
        db_sig = sig_repo.get_by_signature_id(signature_id)
        if not db_sig:
            db_sig = sig_repo.get_by_id(signature_id)
        if not db_sig:
            raise ValueError(f"Signature '{signature_id}' not found.")

        # Step 2: Initialize / Reconstruct QDS Session & Signature
        session = self.protocol.initialize_session(signer_id=db_sig.signer_id)
        qds_sig = QDSSignature(
            signature_id=db_sig.signature_id,
            signer_id=db_sig.signer_id,
            message_digest=db_sig.message_reference,
            signature_data=db_sig.signature_data or {},
            session_id=session.session_id,
            nonce=session.nonce,
            status=QDSSignatureStatus(db_sig.status) if db_sig.status in QDSSignatureStatus.__members__ else QDSSignatureStatus.ACTIVE
        )

        # Step 3: Invoke Phase 4 QDS Verifier for VerificationEvidence
        evidence = self.protocol.verify_signature(
            signature=qds_sig,
            message=message,
            session=session,
            verifier_id=verifier_identity.user_id,
            db=db
        )

        # Step 4: Evaluate Phase 2 Security Threat Engine
        signals: List[ThreatSignal] = []
        if not evidence.message_match:
            signals.append(ThreatSignal.AUTHORIZATION_DENIED)
        if evidence.replay_detected:
            signals.append(ThreatSignal.REPLAY_ATTEMPT)
        threat_assessment = ThreatEngine.evaluate(signals)

        # Step 5: Analyze Quantum Measurements via MeasurementAnalyzer
        analysis = self.analyzer.analyze(
            measurements_data=evidence.measurements,
            quantum_result_data=evidence.quantum_result
        )

        # Step 6: Evaluate Acceptance Policy
        policy_eval = self.policy.evaluate(
            analysis=analysis,
            evidence=evidence,
            threat_assessment=threat_assessment
        )

        # Step 7: Make Final Decision via DecisionEngine
        decision_result = self.decision_engine.decide(
            evidence=evidence,
            analysis=analysis,
            policy_eval=policy_eval,
            threat_assessment=threat_assessment
        )

        # Step 8: Persist Final Decision in Database via VerificationRepository
        verif_repo = VerificationRepository(db)
        verif_repo.create(
            signature_id=db_sig.signature_id,
            verifier_id=verifier_identity.user_id,
            result=decision_result.decision.value,
            error_rate=decision_result.error_rate,
            threshold=decision_result.threshold,
            confidence=0.95
        )

        self.protocol.finalize_session(session)
        return decision_result
