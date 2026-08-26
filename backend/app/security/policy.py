from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.config.security_config import security_settings
from app.security.authorization import Permission, Role


class SecurityOperation(str, Enum):
    CREATE_SIGNATURE = "CREATE_SIGNATURE"
    VERIFY_SIGNATURE = "VERIFY_SIGNATURE"
    VIEW_SIGNATURE = "VIEW_SIGNATURE"
    RUN_QUANTUM_OPERATION = "RUN_QUANTUM_OPERATION"
    RUN_ATTACK_SIMULATION = "RUN_ATTACK_SIMULATION"
    VIEW_STATISTICS = "VIEW_STATISTICS"
    VIEW_AUDIT_LOG = "VIEW_AUDIT_LOG"
    MANAGE_USERS = "MANAGE_USERS"
    RUN_EXPERIMENT = "RUN_EXPERIMENT"


class OperationPolicy(BaseModel):
    required_permission: Permission
    requires_nonce: bool = False
    requires_replay_check: bool = False
    max_attempts: int = Field(default_factory=lambda: security_settings.MAX_VERIFICATION_ATTEMPTS)


POLICY_REGISTRY: Dict[SecurityOperation, OperationPolicy] = {
    SecurityOperation.CREATE_SIGNATURE: OperationPolicy(
        required_permission=Permission.SIGN,
        requires_nonce=True,
        requires_replay_check=True
    ),
    SecurityOperation.VERIFY_SIGNATURE: OperationPolicy(
        required_permission=Permission.VERIFY,
        requires_nonce=True,
        requires_replay_check=True
    ),
    SecurityOperation.VIEW_SIGNATURE: OperationPolicy(
        required_permission=Permission.VIEW_SIGNATURE
    ),
    SecurityOperation.RUN_QUANTUM_OPERATION: OperationPolicy(
        required_permission=Permission.SIGN,
        requires_nonce=True
    ),
    SecurityOperation.RUN_ATTACK_SIMULATION: OperationPolicy(
        required_permission=Permission.RUN_ATTACK_SIMULATION,
        requires_nonce=True,
        requires_replay_check=True
    ),
    SecurityOperation.VIEW_STATISTICS: OperationPolicy(
        required_permission=Permission.VIEW_STATISTICS
    ),
    SecurityOperation.VIEW_AUDIT_LOG: OperationPolicy(
        required_permission=Permission.VIEW_AUDIT_LOG
    ),
    SecurityOperation.MANAGE_USERS: OperationPolicy(
        required_permission=Permission.MANAGE_USERS
    ),
    SecurityOperation.RUN_EXPERIMENT: OperationPolicy(
        required_permission=Permission.RUN_EXPERIMENT
    ),
}


class SecurityPolicy:
    @staticmethod
    def get_policy(operation: SecurityOperation) -> Optional[OperationPolicy]:
        return POLICY_REGISTRY.get(operation)
