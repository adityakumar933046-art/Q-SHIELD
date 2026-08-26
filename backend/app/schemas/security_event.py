from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class SecurityEventBase(BaseModel):
    event_type: str
    severity: str
    description: str
    details: Optional[Dict[str, Any]] = None


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventResponse(SecurityEventBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
