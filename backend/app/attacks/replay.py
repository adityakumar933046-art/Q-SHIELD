import time
from sqlalchemy.orm import Session
from app.attacks.base import BaseAttack, AttackType, AttackStatus, AttackResult
from app.verification.verification_engine import VerificationEngine
from app.security.identity import IdentityContext


class ReplayAttack(BaseAttack):
    """Simulates nonce and verification request replay attacks against Q-SHIELD."""

    def __init__(self, target: str = "local_qshield"):
        super().__init__(attack_type=AttackType.REPLAY, target=target)
        self.engine = VerificationEngine()

    def run_simulation(
        self,
        signature_id: str,
        message: str,
        verifier_id: str = "test_verifier_01",
        scenario: str = "REUSE_VERIFICATION_REQUEST",
        db: Session = None
    ) -> AttackResult:
        start_time = time.time()
        verifier_identity = IdentityContext(user_id=verifier_id, username="verifier", roles=["VERIFIER"])

        # Execute 1st valid verification request
        res1 = self.engine.verify_signature(
            signature_id=signature_id,
            message=message,
            verifier_identity=verifier_identity,
            db=db
        )

        # Execute 2nd REPLAYED verification request with same signature and verifier ID
        res2 = self.engine.verify_signature(
            signature_id=signature_id,
            message=message,
            verifier_identity=verifier_identity,
            db=db
        )

        # Defense success: Replay detected on second attempt
        blocked = res2.policy_eval.accepted is False or "Replay" in "".join(res2.reasons)
        detected = res2.policy_eval.accepted is False
        success = not blocked

        return AttackResult(
            attack_type=self.attack_type,
            status=AttackStatus.COMPLETED if blocked else AttackStatus.FAILED,
            detected=detected,
            blocked=blocked,
            success=success,
            severity="CRITICAL",
            target=self.target,
            evidence={
                "attempt_1_decision": res1.decision.value,
                "attempt_2_decision": res2.decision.value,
                "reasons": res2.reasons,
                "scenario": scenario
            },
            triggered_controls=["Rule: Replay Protection Service"],
            verification_result=res2.model_dump(),
            duration=round(time.time() - start_time, 4)
        )
