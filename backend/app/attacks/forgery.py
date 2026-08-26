import time
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.attacks.base import BaseAttack, AttackType, AttackStatus, AttackResult
from app.verification.verification_engine import VerificationEngine
from app.security.identity import IdentityContext


class ForgeryAttack(BaseAttack):
    """Simulates controlled signature data and message digest forgery against Q-SHIELD."""

    def __init__(self, target: str = "local_qshield"):
        super().__init__(attack_type=AttackType.FORGERY, target=target)
        self.engine = VerificationEngine()

    def run_simulation(
        self,
        signature_id: str,
        message: str,
        scenario: str = "MESSAGE_DIGEST_MODIFICATION",
        db: Session = None
    ) -> AttackResult:
        start_time = time.time()
        
        # Controlled forgery payload creation
        if scenario == "MESSAGE_DIGEST_MODIFICATION":
            tampered_message = message + " [FORGED_TAMPERED_CONTENT]"
        elif scenario == "MALFORMED_SIGNATURE":
            signature_id = "SIG-MALFORMED-0000"
            tampered_message = message
        else:
            tampered_message = message + " [GENERIC_FORGERY]"

        verifier_identity = IdentityContext(user_id="test_verifier_01", username="verifier1", roles=["VERIFIER"])
        
        try:
            decision_res = self.engine.verify_signature(
                signature_id=signature_id,
                message=tampered_message,
                verifier_identity=verifier_identity,
                db=db
            )
            
            # Defense success: VerificationEngine REJECTED the signature
            blocked = (decision_res.decision.value in ("REJECT", "ERROR"))
            detected = not decision_res.message_match or blocked
            success = not blocked  # Attack succeeded ONLY if signature was ACCEPTED

            status = AttackStatus.COMPLETED if blocked else AttackStatus.FAILED

            return AttackResult(
                attack_type=self.attack_type,
                status=status,
                detected=detected,
                blocked=blocked,
                success=success,
                severity="HIGH",
                target=self.target,
                evidence={
                    "original_message": message,
                    "tampered_message": tampered_message,
                    "scenario": scenario,
                    "reasons": decision_res.reasons
                },
                triggered_controls=decision_res.policy_eval.passed_rules if decision_res.policy_eval else [],
                verification_result=decision_res.model_dump(),
                duration=round(time.time() - start_time, 4)
            )

        except ValueError as ve:
            # Signature not found / malformed structure
            return AttackResult(
                attack_type=self.attack_type,
                status=AttackStatus.BLOCKED,
                detected=True,
                blocked=True,
                success=False,
                severity="HIGH",
                target=self.target,
                evidence={"scenario": scenario, "error": str(ve)},
                triggered_controls=["Rule: Signature Structure Validation"],
                duration=round(time.time() - start_time, 4)
            )
