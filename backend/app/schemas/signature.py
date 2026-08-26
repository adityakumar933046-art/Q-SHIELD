from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class SignatureBase(BaseModel):
    signature_id: str
    signer_id: str
    message_reference: str
    signature_data: Optional[Dict[str, Any]] = None
    status: str = "PENDING"


class SignatureCreate(SignatureBase):
    pass


class QDSSignRequest(BaseModel):
    message: str


class SignatureResponse(SignatureBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
