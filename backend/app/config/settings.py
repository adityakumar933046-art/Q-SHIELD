import os
from typing import List, Union
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
                    if val.lower() in ("true", "false"):
                        env_kwargs[field_name] = val.lower() == "true"
                    else:
                        env_kwargs[field_name] = val
            env_kwargs.update(kwargs)
            super().__init__(**env_kwargs)


class Settings(BaseSettings):
    """Central Application Configuration Settings."""

    APP_NAME: str = Field(default="Q-SHIELD", description="Application Name")
    APP_VERSION: str = Field(default="0.1.0", description="Application Version")
    ENVIRONMENT: str = Field(default="development", description="Execution Environment")
    DEBUG: bool = Field(default=True, description="Debug Mode")

    DATABASE_URL: str = Field(
        default="sqlite:///./qshield_dev.db",
        description="Database Connection URL"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis Connection URL"
    )

    API_PREFIX: str = Field(default="/api/v1", description="Global API Route Prefix")
    CORS_ORIGINS: Union[List[str], str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="CORS Allowed Origins"
    )

    JWT_SECRET: str = Field(
        default="qshield_default_dev_secret_key_change_in_production",
        description="JWT Signing Secret Key"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT Signing Algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access Token Validity Minutes")


settings = Settings()
