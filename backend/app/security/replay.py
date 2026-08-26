import time
from typing import Optional, Dict
from app.config.security_config import security_settings


class ReplayDetectedError(Exception):
    """Raised when a replayed nonce, session, or request ID is detected."""
    def __init__(self, message: str = "Replay attack detected: security identifier already used"):
        super().__init__(message)


_seen_identifiers: Dict[str, float] = {}


class ReplayProtectionService:
    def __init__(self, window: Optional[int] = None):
        self.window = window or security_settings.REPLAY_PROTECTION_WINDOW

    def check_and_record(self, identifier: str) -> None:
        """Record identifier within replay window. Raises ReplayDetectedError if seen."""
        now = time.time()
        # Cleanup expired records
        expired = [k for k, exp in _seen_identifiers.items() if exp < now]
        for k in expired:
            _seen_identifiers.pop(k, None)

        if identifier in _seen_identifiers:
            raise ReplayDetectedError(f"Replay detected for identifier '{identifier}'")

        _seen_identifiers[identifier] = now + self.window
