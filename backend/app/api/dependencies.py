from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import UserRepository, SecurityEventRepository
from app.security.identity import decode_access_token, IdentityContext
from app.security.authorization import has_role, has_permission

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[IdentityContext]:
    """Retrieve and decode current user identity context from HTTP Bearer token."""
    if not credentials or not credentials.credentials:
        return None

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None

    user_id = payload["sub"]
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user or not user.is_active:
        return None

    return IdentityContext(
        user_id=user.id,
        username=user.username,
        roles=[user.role],
        is_active=user.is_active
    )


def require_authenticated_user(
    identity: Optional[IdentityContext] = Depends(get_current_user)
) -> IdentityContext:
    """Ensure request is accompanied by valid authenticated active identity."""
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return identity


def require_role(required_role: str):
    """Dependency factory requiring identity to possess target role."""
    def role_checker(identity: IdentityContext = Depends(require_authenticated_user)) -> IdentityContext:
        if not has_role(identity.roles, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: requires role {required_role}"
            )
        return identity
    return role_checker


def require_permission(required_permission: str):
    """Dependency factory requiring identity to possess target permission."""
    def permission_checker(identity: IdentityContext = Depends(require_authenticated_user)) -> IdentityContext:
        if not has_permission(identity.roles, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: missing permission {required_permission}"
            )
        return identity
    return permission_checker
