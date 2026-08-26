from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.attack import AttackRequest, AttackResponse
from app.attacks.forgery import ForgeryAttack
from app.attacks.impersonation import ImpersonationAttack
from app.attacks.replay import ReplayAttack
from app.attacks.channel_manipulation import ChannelManipulationAttack
from app.attacks.unauthorized_verification import UnauthorizedVerificationAttack
from app.api.dependencies import require_authenticated_user, require_permission
from app.security.authorization import Permission
from app.security.identity import IdentityContext

router = APIRouter(prefix="/attacks", tags=["attacks"])
require_security_operator = require_permission(Permission.RUN_ATTACK_SIMULATION.value)




@router.post("/forgery", response_model=AttackResponse)
def simulate_forgery(
    req: AttackRequest,
    operator: IdentityContext = Depends(require_security_operator),
    db: Session = Depends(get_db)
):
    try:
        attack = ForgeryAttack(target=req.target)
        res = attack.run_simulation(
            signature_id=req.signature_id or "SIG-000",
            message=req.message or "Test Payload",
            scenario=req.scenario or "MESSAGE_DIGEST_MODIFICATION",
            db=db
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/impersonation", response_model=AttackResponse)
def simulate_impersonation(
    req: AttackRequest,
    operator: IdentityContext = Depends(require_security_operator),
    db: Session = Depends(get_db)
):
    try:
        attack = ImpersonationAttack(target=req.target)
        res = attack.run_simulation(user_id="impersonator_01", db=db)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/replay", response_model=AttackResponse)
def simulate_replay(
    req: AttackRequest,
    operator: IdentityContext = Depends(require_security_operator),
    db: Session = Depends(get_db)
):
    try:
        attack = ReplayAttack(target=req.target)
        res = attack.run_simulation(
            signature_id=req.signature_id or "SIG-000",
            message=req.message or "Test Payload",
            db=db
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/channel-manipulation", response_model=AttackResponse)
def simulate_channel_manipulation(
    req: AttackRequest,
    operator: IdentityContext = Depends(require_security_operator),
    db: Session = Depends(get_db)
):
    try:
        attack = ChannelManipulationAttack(target=req.target)
        res = attack.run_simulation(
            signature_id=req.signature_id or "SIG-000",
            original_message=req.message or "Test Payload",
            db=db
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/unauthorized-verification", response_model=AttackResponse)
def simulate_unauthorized_verification(
    req: AttackRequest,
    operator: IdentityContext = Depends(require_security_operator),
    db: Session = Depends(get_db)
):
    try:
        attack = UnauthorizedVerificationAttack(target=req.target)
        res = attack.run_simulation(unauthorized_user_id="guest_01", db=db)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
