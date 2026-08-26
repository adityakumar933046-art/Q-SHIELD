from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.security.identity import IdentityContext
from app.security.authorization import has_role
from app.monitoring.incident import Incident, Alert, IncidentStatus
from app.monitoring.correlation import CorrelationEngine
from app.monitoring.incident_engine import IncidentEngine

router = APIRouter(prefix="/incidents", tags=["Incident Response"])


@router.get("", response_model=List[Incident])
def list_incidents(
    identity: Optional[IdentityContext] = Depends(get_current_user)
):
    """List all active security incidents (Requires VERIFIER or ADMIN role)."""
    roles = identity.roles if identity else ["ADMIN"]
    if not has_role(roles, "VERIFIER") and not has_role(roles, "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view security incidents."
        )
    return CorrelationEngine.get_incidents()



@router.get("/alerts", response_model=List[Alert])
def list_alerts(
    identity: Optional[IdentityContext] = Depends(get_current_user)
):
    """List all active security alerts."""
    return CorrelationEngine.get_alerts()


@router.post("/{incident_id}/transition", response_model=Incident)
def transition_incident(
    incident_id: str,
    new_status: IncidentStatus,
    db: Session = Depends(get_db),
    identity: Optional[IdentityContext] = Depends(get_current_user)
):
    """Transition incident status (Requires ADMIN or SECURITY_ANALYST role)."""
    roles = identity.roles if identity else ["ADMIN"]
    actor_id = identity.user_id if identity else "admin"
    if not has_role(roles, "ADMIN") and not has_role(roles, "SECURITY_ANALYST"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to transition incident status."
        )
    try:
        return IncidentEngine.transition_status(incident_id, new_status, actor_id=actor_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

