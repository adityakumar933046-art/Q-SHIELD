from enum import Enum
from typing import List, Set, Dict


class Role(str, Enum):
    USER = "USER"
    VERIFIER = "VERIFIER"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    ADMIN = "ADMIN"


class Permission(str, Enum):
    SIGN = "SIGN"
    VERIFY = "VERIFY"
    VIEW_SIGNATURE = "VIEW_SIGNATURE"
    VIEW_STATISTICS = "VIEW_STATISTICS"
    RUN_ATTACK_SIMULATION = "RUN_ATTACK_SIMULATION"
    VIEW_AUDIT_LOG = "VIEW_AUDIT_LOG"
    MANAGE_USERS = "MANAGE_USERS"
    RUN_EXPERIMENT = "RUN_EXPERIMENT"


# Role-Permission Mappings
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.USER: {
        Permission.SIGN,
        Permission.VIEW_SIGNATURE,
    },
    Role.VERIFIER: {
        Permission.SIGN,
        Permission.VERIFY,
        Permission.VIEW_SIGNATURE,
        Permission.VIEW_STATISTICS,
    },
    Role.SECURITY_ANALYST: {
        Permission.SIGN,
        Permission.VERIFY,
        Permission.VIEW_SIGNATURE,
        Permission.VIEW_STATISTICS,
        Permission.RUN_ATTACK_SIMULATION,
        Permission.VIEW_AUDIT_LOG,
        Permission.RUN_EXPERIMENT,
    },
    Role.ADMIN: {
        Permission.SIGN,
        Permission.VERIFY,
        Permission.VIEW_SIGNATURE,
        Permission.VIEW_STATISTICS,
        Permission.RUN_ATTACK_SIMULATION,
        Permission.VIEW_AUDIT_LOG,
        Permission.MANAGE_USERS,
        Permission.RUN_EXPERIMENT,
    },
}


def has_role(user_roles: List[str], required_role: str) -> bool:
    """Check if user possesses the required role or ADMIN authority."""
    if "ADMIN" in user_roles:
        return True
    return required_role in user_roles


def has_permission(user_roles: List[str], required_permission: str) -> bool:
    """Check if any of user's roles grant the required permission."""
    for role_str in user_roles:
        try:
            role_enum = Role(role_str)
            allowed_perms = ROLE_PERMISSIONS.get(role_enum, set())
            if Permission(required_permission) in allowed_perms:
                return True
        except ValueError:
            continue
    return False
