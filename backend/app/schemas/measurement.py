from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class MeasurementBase(BaseModel):
    signature_id: Optional[str] = None
    measurement_data: Optional[Dict[str, Any]] = None
    basis: Optional[str] = "Z"
    result: Optional[str] = None
    shot_count: int = 1024
    error_info: Optional[Dict[str, Any]] = None


class MeasurementCreate(MeasurementBase):
    pass


class MeasurementResponse(MeasurementBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class QuantumMeasureRequest(BaseModel):
    state_vector: List[float]
    basis: str = "Z"
    shots: int = 1024


class QuantumTeleportRequest(BaseModel):
    state_vector: List[float]
    label: Optional[str] = "|psi>"
