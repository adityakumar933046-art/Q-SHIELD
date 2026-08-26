import time
from sqlalchemy.orm import Session
from app.attacks.base import BaseAttack, AttackType, AttackStatus, AttackResult
from app.verification.verification_engine import VerificationEngine
from app.security.identity import IdentityContext


class ChannelManipulationAttack(BaseAttack):
    """Simulates in-transit protocol payload and message byte manipulation."""

    def __init__(self, target: str = "local_qshield"):
        super().__init__(attack_type=AttackType.CHANNEL_MANIPULATION, target=target)
        self.engine = VerificationEngine()

    def run_simulation(
        self,
        signature_id: str,
        original_message: str,
        scenario: str = "MESSAGE_MODIFICATION",
        db: Session = None
    ) -> AttackResult:
        start_time = time.time()
        tampered_message = original_message + " [CHANNEL_MUTATED_BYTES]"

        verifier_identity = IdentityContext(user_id="verifier_01", username="verifier", roles=["VERIFIER"])

        decision_res = self.engine.verify_signature(
            signature_id=signature_id,
            message=tampered_message,
            verifier_identity=verifier_identity,
            db=db
        )

        blocked = (decision_res.decision.value in ("REJECT", "ERROR"))
        detected = not decision_res.message_match
        success = not blocked

        return AttackResult(
            attack_type=self.attack_type,
            status=AttackStatus.COMPLETED if blocked else AttackStatus.FAILED,
            detected=detected,
            blocked=blocked,
            success=success,
            severity="HIGH",
            target=self.target,
            evidence={
                "original_message": original_message,
                "tampered_message": tampered_message,
                "scenario": scenario,
                "reasons": decision_res.reasons
            },
            triggered_controls=["Rule: Message Digest Match"],
            verification_result=decision_res.model_dump(),
            duration=round(time.time() - start_time, 4)
        )
