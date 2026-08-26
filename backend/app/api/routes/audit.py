from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import SecurityEventRepository
from app.schemas.security_event import SecurityEventResponse
from app.audit.forensic import ForensicEngine
from app.api.dependencies import require_permission
from app.security.authorization import Permission
from app.security.identity import IdentityContext

router = APIRouter(prefix="/audit", tags=["audit"])
require_audit_permission = require_permission(Permission.VIEW_AUDIT_LOG.value)


class ForensicRequest(BaseModel):
    actor_id: Optional[str] = None
    category: Optional[str] = None
    limit: Optional[int] = 100


@router.get("/events", response_model=List[SecurityEventResponse])
def list_audit_events(
    skip: int = 0,
    limit: int = 100,
    operator: IdentityContext = Depends(require_audit_permission),
    db: Session = Depends(get_db)
):
    repo = SecurityEventRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.get("/events/{event_id}", response_model=SecurityEventResponse)
def get_audit_event(
    event_id: str,
    operator: IdentityContext = Depends(require_audit_permission),
    db: Session = Depends(get_db)
):
    repo = SecurityEventRepository(db)
    ev = repo.get_by_id(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Audit event record not found")
    return ev


@router.post("/forensics")
def run_forensic_investigation(
    req: ForensicRequest,
    operator: IdentityContext = Depends(require_audit_permission),
    db: Session = Depends(get_db)
):
    try:
        res = ForensicEngine.investigate(
            actor_id=req.actor_id,
            category=req.category,
            limit=req.limit or 100,
            db=db
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
