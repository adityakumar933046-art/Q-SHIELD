from app.security.authorization import Role, Permission, has_role, has_permission, ROLE_PERMISSIONS


def test_role_check():
    assert has_role(["USER"], "USER") is True
    assert has_role(["USER"], "ADMIN") is False
    assert has_role(["ADMIN"], "USER") is True  # Admin has access to all roles


def test_permission_check():
    assert has_permission(["USER"], "SIGN") is True
    assert has_permission(["USER"], "MANAGE_USERS") is False
    assert has_permission(["ADMIN"], "MANAGE_USERS") is True
    assert has_permission(["SECURITY_ANALYST"], "RUN_ATTACK_SIMULATION") is True
