import uuid
import hashlib
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class QDSSignatureStatus(str, Enum):
    CREATED = "CREATED"
    ACTIVE = "ACTIVE"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


def calculate_message_digest(message: str) -> str:
    """Compute canonical SHA-256 digest of message string."""
    return hashlib.sha256(message.encode("utf-8")).hexdigest()


class QDSSignature(BaseModel):
    signature_id: str = Field(default_factory=lambda: f"SIG-{uuid.uuid4().hex[:12].upper()}")
    signer_id: str
    message_digest: str
    signature_data: Dict[str, Any] = Field(default_factory=dict)
    quantum_state_reference: str = "QuantumState_01"
    protocol_version: str = "1.0"
    session_id: str
    nonce: str
    status: QDSSignatureStatus = QDSSignatureStatus.CREATED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def to_db_dict(self) -> Dict[str, Any]:
        """Convert signature to database model initialization dictionary."""
        return {
            "signature_id": self.signature_id,
            "signer_id": self.signer_id,
            "message_reference": self.message_digest,
            "signature_data": self.signature_data,
            "status": self.status.value,
        }
