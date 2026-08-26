from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import VerificationRepository
from app.schemas.verification import VerificationResponse, QDSVerifyRequest
from app.verification.verification_engine import VerificationEngine
from app.api.dependencies import require_authenticated_user
from app.security.identity import IdentityContext

router = APIRouter(prefix="/verification", tags=["verification"])
engine = VerificationEngine()


@router.get("/", response_model=List[VerificationResponse])
def list_verifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = VerificationRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.post("/", status_code=status.HTTP_200_OK)
def verify_signature_endpoint(
    req: QDSVerifyRequest,
    identity: IdentityContext = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    try:
        decision_result = engine.verify_signature(
            signature_id=req.signature_id,
            message=req.message,
            verifier_identity=identity,
            db=db
        )
        return decision_result.model_dump()
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{verification_id}")
def get_verification_record(verification_id: str, db: Session = Depends(get_db)):
    repo = VerificationRepository(db)
    verif = repo.get_by_id(verification_id)
    if not verif:
        raise HTTPException(status_code=404, detail="Verification record not found")
    return {
        "id": verif.id,
        "signature_id": verif.signature_id,
        "verifier_id": verif.verifier_id,
        "result": verif.result,
        "error_rate": verif.error_rate,
        "threshold": verif.threshold,
        "confidence": verif.confidence,
        "created_at": verif.created_at
    }
