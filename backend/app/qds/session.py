import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field
from app.config.security_config import security_settings
from app.security.nonce import generate_nonce, NonceService


class QDSSessionState(str, Enum):
    CREATED = "CREATED"
    INITIALIZED = "INITIALIZED"
    SIGNING = "SIGNING"
    SIGNED = "SIGNED"
    VERIFICATION_READY = "VERIFICATION_READY"
    VERIFYING = "VERIFYING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    FAILED = "FAILED"


class InvalidSessionTransitionError(Exception):
    """Raised when an invalid session state transition is attempted."""
    pass


class ExpiredSessionError(Exception):
    """Raised when an operation is attempted on an expired QDS session."""
    pass


# Allowed State Machine Transitions
VALID_TRANSITIONS: Dict[QDSSessionState, List[QDSSessionState]] = {
    QDSSessionState.CREATED: [QDSSessionState.INITIALIZED, QDSSessionState.FAILED],
    QDSSessionState.INITIALIZED: [QDSSessionState.SIGNING, QDSSessionState.VERIFICATION_READY, QDSSessionState.VERIFYING, QDSSessionState.EXPIRED, QDSSessionState.FAILED],
    QDSSessionState.SIGNING: [QDSSessionState.SIGNED, QDSSessionState.FAILED],
    QDSSessionState.SIGNED: [QDSSessionState.VERIFICATION_READY, QDSSessionState.VERIFYING, QDSSessionState.EXPIRED],
    QDSSessionState.VERIFICATION_READY: [QDSSessionState.VERIFYING, QDSSessionState.EXPIRED],
    QDSSessionState.VERIFYING: [QDSSessionState.VERIFIED, QDSSessionState.REJECTED, QDSSessionState.FAILED],
    QDSSessionState.VERIFIED: [QDSSessionState.COMPLETED],
    QDSSessionState.REJECTED: [QDSSessionState.COMPLETED, QDSSessionState.FAILED],
    QDSSessionState.COMPLETED: [],
    QDSSessionState.EXPIRED: [],
    QDSSessionState.FAILED: [],
}



class QDSSession(BaseModel):
    session_id: str = Field(default_factory=lambda: f"SESS-{uuid.uuid4().hex[:12].upper()}")
    signer_id: str
    nonce: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    protocol_version: str = "1.0"
    state: QDSSessionState = QDSSessionState.CREATED
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def transition_to(self, new_state: QDSSessionState) -> None:
        """Execute validated state machine transition."""
        if self.is_expired():
            self.state = QDSSessionState.EXPIRED
            raise ExpiredSessionError(f"Session '{self.session_id}' has expired.")

        allowed = VALID_TRANSITIONS.get(self.state, [])
        if new_state not in allowed:
            raise InvalidSessionTransitionError(
                f"Cannot transition QDS session from {self.state.value} to {new_state.value}."
            )
        self.state = new_state

    def is_expired(self) -> bool:
        """Check if current time exceeds session expiration."""
        return datetime.now(timezone.utc) > self.expires_at


def create_qds_session(signer_id: str, timeout_seconds: Optional[int] = None) -> QDSSession:
    """Initialize a new QDS Session with Phase 2 nonce registration."""
    timeout = timeout_seconds or security_settings.SESSION_TIMEOUT
    nonce_val = generate_nonce()

    # Register nonce with Phase 2 NonceService
    nonce_svc = NonceService(ttl=timeout)
    nonce_svc.register_nonce(nonce_val)

    now = datetime.now(timezone.utc)
    session = QDSSession(
        signer_id=signer_id,
        nonce=nonce_val,
        created_at=now,
        expires_at=now + timedelta(seconds=timeout),
        state=QDSSessionState.CREATED
    )
    session.transition_to(QDSSessionState.INITIALIZED)
    return session
