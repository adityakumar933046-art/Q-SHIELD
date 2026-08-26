import time
from sqlalchemy.orm import Session
from app.attacks.base import BaseAttack, AttackType, AttackStatus, AttackResult
from app.security.authorization import has_permission, Permission
from app.security.identity import IdentityContext


class UnauthorizedVerificationAttack(BaseAttack):
    """Simulates unauthorized verification attempt by unauthenticated/unprivileged actor."""

    def __init__(self, target: str = "local_qshield"):
        super().__init__(attack_type=AttackType.UNAUTHORIZED_VERIFICATION, target=target)

    def run_simulation(
        self,
        unauthorized_user_id: str = "unauth_guest",
        db: Session = None
    ) -> AttackResult:
        start_time = time.time()

        guest_identity = IdentityContext(user_id=unauthorized_user_id, username="guest", roles=["GUEST"])

        # Check if guest user has VERIFY permission
        allowed = has_permission(guest_identity.roles, Permission.VERIFY.value)

        blocked = not allowed
        detected = blocked
        success = allowed


        return AttackResult(
            attack_type=self.attack_type,
            status=AttackStatus.COMPLETED if blocked else AttackStatus.FAILED,
            detected=detected,
            blocked=blocked,
            success=success,
            severity="HIGH",
            target=self.target,
            evidence={
                "user_id": unauthorized_user_id,
                "roles": guest_identity.roles,
                "permission_tested": Permission.VERIFY.value
            },
            triggered_controls=["Rule: Authorization Service"],
            duration=round(time.time() - start_time, 4)
        )

