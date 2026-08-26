import hashlib
import hmac
import os
import json
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.config.settings import settings

# Attempt PyJWT, fallback to hashlib HMAC JWT implementation if PyJWT not present
try:
    import jwt
    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False


class IdentityContext(BaseModel):
    user_id: str
    username: str
    roles: List[str] = Field(default_factory=lambda: ["USER"])
    is_active: bool = True
    session_id: Optional[str] = None


def hash_password(password: str) -> str:
    """Hash password securely using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"pbkdf2:sha256:100000${salt.hex()}${pwd_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password string."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3 or not parts[0].startswith("pbkdf2"):
            return False
        salt = bytes.fromhex(parts[1])
        expected_hash = parts[2]
        computed_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000).hex()
        return hmac.compare_digest(computed_hash, expected_hash)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT access token with payload and expiration."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(now.timestamp())})

    if HAS_PYJWT:
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    else:
        # Fallback compact token encoder
        header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
        signature_base = f"{header}.{payload}"
        sig = hmac.new(settings.JWT_SECRET.encode(), signature_base.encode(), hashlib.sha256).digest()
        signature = base64.urlsafe_b64encode(sig).decode().rstrip("=")
        return f"{signature_base}.{signature}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT access token."""
    try:
        if HAS_PYJWT:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload
        else:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, signature_b64 = parts
            signature_base = f"{header_b64}.{payload_b64}"
            expected_sig = hmac.new(settings.JWT_SECRET.encode(), signature_base.encode(), hashlib.sha256).digest()
            calc_sig = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            if not hmac.compare_digest(calc_sig, signature_b64):
                return None
            
            # Decode payload
            padded_payload = payload_b64 + "=" * (-len(payload_b64) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode()).decode())
            exp = payload.get("exp")
            if exp and datetime.now(timezone.utc).timestamp() > exp:
                return None
            return payload
    except Exception:
        return None
