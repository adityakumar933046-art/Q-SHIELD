from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class AttackRequest(BaseModel):
    attack_type: str
    target: str = "local_qshield"
    signature_id: Optional[str] = None
    message: Optional[str] = None
    scenario: Optional[str] = None


class AttackResponse(BaseModel):
    attack_id: str
    attack_type: str
    status: str
    detected: bool
    blocked: bool
    success: bool
    severity: str
    target: str
    evidence: Dict[str, Any]
    triggered_controls: List[str]
    duration: float
    timestamp: datetime
