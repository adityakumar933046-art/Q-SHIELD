from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class UserBase(BaseModel):
    username: str
    email: str = Field(pattern=EMAIL_PATTERN, description="User email address")
    is_active: bool = True
    role: str = "USER"


class UserCreate(UserBase):
    password: str = Field(min_length=6, description="Raw user password")


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = Field(default=None, pattern=EMAIL_PATTERN)
    is_active: Optional[bool] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
