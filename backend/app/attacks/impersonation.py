import time
from sqlalchemy.orm import Session
from app.attacks.base import BaseAttack, AttackType, AttackStatus, AttackResult
from app.security.authorization import has_permission, Permission, Role
from app.security.identity import IdentityContext


class ImpersonationAttack(BaseAttack):
    """Simulates identity impersonation and unauthorized role escalation attempts."""

    def __init__(self, target: str = "local_qshield"):
        super().__init__(attack_type=AttackType.IMPERSONATION, target=target)

    def run_simulation(
        self,
        user_id: str,
        claimed_role: str = "ADMIN",
        scenario: str = "ROLE_ESCALATION_ATTEMPT",
        db: Session = None
    ) -> AttackResult:
        start_time = time.time()

        # Simulate user with 'USER' role claiming 'ADMIN' permissions
        fake_identity = IdentityContext(user_id=user_id, username="impersonator", roles=["USER"])

        # Check if unauthorized user can perform admin permission
        allowed = has_permission(fake_identity.roles, Permission.RUN_ATTACK_SIMULATION.value)

        # Defense success: Permission denied for unauthorized user
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
                "actual_roles": fake_identity.roles,
                "claimed_role": claimed_role,
                "scenario": scenario,
                "permission_tested": Permission.RUN_ATTACK_SIMULATION.value
            },
            triggered_controls=["Rule: RBAC Authorization Check"],
            duration=round(time.time() - start_time, 4)
        )

