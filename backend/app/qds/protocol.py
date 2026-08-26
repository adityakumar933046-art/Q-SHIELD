from sqlalchemy.orm import Session
from app.qds.session import QDSSession, QDSSessionState, create_qds_session
from app.qds.signature import QDSSignature
from app.qds.signer import QDSSigner
from app.qds.verifier import QDSVerifier, VerificationEvidence

QDS_PROTOCOL_VERSION = "1.0"


class QDSProtocol:
    """Master QDS Protocol Lifecycle Coordinator."""

    def __init__(self, version: str = QDS_PROTOCOL_VERSION):
        self.version = version

    def initialize_session(self, signer_id: str, timeout_seconds: int = 1800) -> QDSSession:
        """Step 1: Initialize QDS Protocol Session."""
        return create_qds_session(signer_id=signer_id, timeout_seconds=timeout_seconds)

    def create_signature(
        self,
        message: str,
        signer_id: str,
        session: QDSSession,
        db: Session
    ) -> QDSSignature:
        """Step 2: Sign message using QDS Protocol."""
        return QDSSigner.sign_message(message=message, signer_id=signer_id, session=session, db=db)

    def prepare_verification(self, session: QDSSession) -> None:
        """Step 3: Transition session state for verification."""
        session.transition_to(QDSSessionState.VERIFICATION_READY)
        session.transition_to(QDSSessionState.VERIFYING)

    def verify_signature(
        self,
        signature: QDSSignature,
        message: str,
        session: QDSSession,
        verifier_id: str,
        db: Session
    ) -> VerificationEvidence:
        """Step 4: Collect verification evidence."""
        if session.state != QDSSessionState.VERIFYING:
            if session.state != QDSSessionState.VERIFICATION_READY:
                session.transition_to(QDSSessionState.VERIFICATION_READY)
            session.transition_to(QDSSessionState.VERIFYING)

        evidence = QDSVerifier.verify_signature(
            signature=signature,
            message=message,
            session=session,
            verifier_id=verifier_id,
            db=db
        )


        if evidence.signature_valid:
            session.transition_to(QDSSessionState.VERIFIED)
        else:
            session.transition_to(QDSSessionState.REJECTED)

        return evidence

    def finalize_session(self, session: QDSSession) -> None:
        """Step 5: Finalize QDS Session."""
        session.transition_to(QDSSessionState.COMPLETED)
