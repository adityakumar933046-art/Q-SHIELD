from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class VerificationBase(BaseModel):
    signature_id: str
    verifier_id: str
    result: str
    error_rate: float = 0.0
    threshold: float = 0.89
    confidence: float = 0.95


class VerificationCreate(VerificationBase):
    pass


class QDSVerifyRequest(BaseModel):
    signature_id: str
    message: str


class VerificationResponse(VerificationBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
