from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.repositories import SignatureRepository
from app.schemas.signature import SignatureResponse, QDSSignRequest
from app.qds.protocol import QDSProtocol
from app.api.dependencies import require_authenticated_user
from app.security.identity import IdentityContext

router = APIRouter(prefix="/signatures", tags=["signatures"])
protocol = QDSProtocol()


@router.get("/", response_model=List[SignatureResponse])
def list_signatures(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = SignatureRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_qds_signature(
    req: QDSSignRequest,
    identity: IdentityContext = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    try:
        session = protocol.initialize_session(signer_id=identity.user_id)
        sig = protocol.create_signature(message=req.message, signer_id=identity.user_id, session=session, db=db)
        return sig.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{signature_id}", response_model=SignatureResponse)
def get_signature(signature_id: str, db: Session = Depends(get_db)):
    repo = SignatureRepository(db)
    sig = repo.get_by_signature_id(signature_id)
    if not sig:
        sig = repo.get_by_id(signature_id)
    if not sig:
        raise HTTPException(status_code=404, detail="Signature not found")
    return sig
