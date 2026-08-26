import secrets
import time
from typing import Optional, Dict
from app.config.security_config import security_settings

# Attempt redis connection, fallback to in-memory dictionary for development/testing
try:
    import redis
    redis_client = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)
    redis_client.ping()
    HAS_REDIS = True
except Exception:
    HAS_REDIS = False

_in_memory_nonces: Dict[str, float] = {}


def generate_nonce(length: Optional[int] = None) -> str:
    """Generate cryptographically secure random hex nonce."""
    nonce_len = length or security_settings.NONCE_LENGTH
    return secrets.token_hex(nonce_len // 2 if nonce_len % 2 == 0 else nonce_len)


class NonceService:
    def __init__(self, ttl: Optional[int] = None):
        self.ttl = ttl or security_settings.SESSION_TIMEOUT

    def register_nonce(self, nonce: str) -> bool:
        """Register nonce atomically. Returns True if registered, False if already exists."""
        if HAS_REDIS:
            try:
                # setnx returns True if key was set, False if key already exists
                result = redis_client.set(f"nonce:{nonce}", "active", ex=self.ttl, nx=True)
                return bool(result)
            except Exception:
                pass
        
        # Fallback in-memory
        now = time.time()
        # Clean expired
        expired = [k for k, exp in _in_memory_nonces.items() if exp < now]
        for k in expired:
            _in_memory_nonces.pop(k, None)

        if nonce in _in_memory_nonces:
            return False
        _in_memory_nonces[nonce] = now + self.ttl
        return True

    def validate_and_consume(self, nonce: str) -> bool:
        """Consume nonce so it cannot be reused. Returns True if valid & consumed."""
        if HAS_REDIS:
            try:
                key = f"nonce:{nonce}"
                if redis_client.exists(key):
                    redis_client.delete(key)
                    return True
                return False
            except Exception:
                pass

        now = time.time()
        exp = _in_memory_nonces.get(nonce)
        if exp and exp >= now:
            _in_memory_nonces.pop(nonce, None)
            return True
        return False
