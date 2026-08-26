import os
from pydantic import Field, BaseModel

try:
    from pydantic_settings import BaseSettings
except Exception:
    class BaseSettings(BaseModel):
        def __init__(self, **kwargs):
            env_kwargs = {}
            for field_name in self.model_fields:
                if field_name in os.environ:
                    val = os.environ[field_name]
                    env_kwargs[field_name] = val
            env_kwargs.update(kwargs)
            super().__init__(**env_kwargs)


class SecuritySettings(BaseSettings):
    """Security Parameters Configuration."""

    NONCE_LENGTH: int = Field(default=32, description="Nonce Byte Length")
    SESSION_TIMEOUT: int = Field(default=3600, description="Session Timeout in seconds")
    VERIFICATION_THRESHOLD: float = Field(default=0.89, description="Quantum Verification Acceptance Threshold")
    MAX_VERIFICATION_ATTEMPTS: int = Field(default=3, description="Max Allowed Verification Attempts")
    REPLAY_PROTECTION_WINDOW: int = Field(default=300, description="Replay Protection Window in seconds")
    SECURITY_LOG_LEVEL: str = Field(default="INFO", description="Security Event Log Level")


security_settings = SecuritySettings()
