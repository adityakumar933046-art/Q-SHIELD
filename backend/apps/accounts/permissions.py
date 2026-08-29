from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdmin(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_superuser)
        )

class IsSigner(permissions.BasePermission):
    """Allows access to Signer users or Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.SIGNER] or request.user.is_superuser)
        )

class IsVerifier(permissions.BasePermission):
    """Allows access to Verifier users or Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.VERIFIER] or request.user.is_superuser)
        )

class IsSecurityAnalyst(permissions.BasePermission):
    """Allows access to Security Analyst users or Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.SECURITY_ANALYST] or request.user.is_superuser)
        )

class IsSignerOrVerifier(permissions.BasePermission):
    """Allows access to Signers, Verifiers, or Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.SIGNER, User.Role.VERIFIER] or request.user.is_superuser)
        )

class IsAdminOrSecurityAnalyst(permissions.BasePermission):
    """Allows access to Admins or Security Analysts."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.SECURITY_ANALYST] or request.user.is_superuser)
        )

class IsAdminOrReadOnly(permissions.BasePermission):
    """Allows read access to all authenticated users, write access to Admin only."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.role == User.Role.ADMIN or request.user.is_superuser)

class IsAnalystOrReadOnly(permissions.BasePermission):
    """Allows read access to all authenticated users, write access to Security Analyst or Admin."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.role in [User.Role.ADMIN, User.Role.SECURITY_ANALYST] or request.user.is_superuser)
