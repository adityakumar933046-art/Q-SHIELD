from sqlalchemy.orm import Session
from app.qds.signature import QDSSignature, QDSSignatureStatus, calculate_message_digest
from app.qds.session import QDSSession, QDSSessionState, ExpiredSessionError
from app.quantum.states import state_plus
from app.quantum.teleportation import TeleportationService
from app.database.repositories import SignatureRepository


class QDSSigner:
    """Quantum Digital Signature Signer Engine."""

    @staticmethod
    def sign_message(
        message: str,
        signer_id: str,
        session: QDSSession,
        db: Session
    ) -> QDSSignature:
        """Sign canonical message digest using Phase 3 Quantum Engine and persist signature."""
        if session.signer_id != signer_id:
            raise ValueError("Signer ID mismatch for QDS session.")

        if session.is_expired():
            session.transition_to(QDSSessionState.EXPIRED)
            raise ExpiredSessionError("Cannot sign with expired session.")

        # Transition session to SIGNING state
        session.transition_to(QDSSessionState.SIGNING)

        # Step 1: Message Canonicalization & SHA-256 Digest
        digest = calculate_message_digest(message)

        # Step 2: Prepare Quantum State Material via Phase 3 Quantum Engine
        q_state = state_plus()
        teleport_res = TeleportationService.teleport(q_state, seed=42)

        # Step 3: Construct QDSSignature object
        signature = QDSSignature(
            signer_id=signer_id,
            message_digest=digest,
            signature_data={
                "quantum_result": teleport_res.model_dump(),
                "teleported_fidelity": teleport_res.fidelity,
                "measurement_bits": teleport_res.measurement_bits,
            },
            quantum_state_reference=q_state.label,
            protocol_version=session.protocol_version,
            session_id=session.session_id,
            nonce=session.nonce,
            status=QDSSignatureStatus.ACTIVE,
            metadata={"message_length": len(message)}
        )

        # Step 4: Persist in Database using SignatureRepository
        repo = SignatureRepository(db)
        repo.create(**signature.to_db_dict())

        # Update session state to SIGNED
        session.transition_to(QDSSessionState.SIGNED)

        return signature
