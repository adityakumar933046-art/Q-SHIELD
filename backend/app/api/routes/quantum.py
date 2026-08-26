from fastapi import APIRouter, HTTPException, Depends
from app.quantum.backend import AerBackend
from app.quantum.states import QuantumState
from app.quantum.measurement import MeasurementService
from app.quantum.teleportation import TeleportationService, TeleportationResult
from app.schemas.measurement import QuantumMeasureRequest, QuantumTeleportRequest

router = APIRouter(prefix="/quantum", tags=["quantum"])
backend = AerBackend()


@router.get("/backend")
def get_backend_info():
    return backend.backend_info().model_dump()


@router.post("/measure")
def measure_quantum_state(req: QuantumMeasureRequest):
    try:
        # Convert flat list [real0, imag0, real1, imag1] or [a, b] into complex state
        if len(req.state_vector) == 2:
            amps = req.state_vector
        elif len(req.state_vector) == 4:
            amps = [complex(req.state_vector[0], req.state_vector[1]), complex(req.state_vector[2], req.state_vector[3])]
        else:
            raise ValueError("state_vector must contain 2 or 4 floats.")

        state = QuantumState(amps)
        res = MeasurementService.measure_state(state, basis=req.basis, shots=req.shots)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/teleport")
def teleport_quantum_state(req: QuantumTeleportRequest):
    try:
        if len(req.state_vector) == 2:
            amps = req.state_vector
        elif len(req.state_vector) == 4:
            amps = [complex(req.state_vector[0], req.state_vector[1]), complex(req.state_vector[2], req.state_vector[3])]
        else:
            raise ValueError("state_vector must contain 2 or 4 floats.")

        state = QuantumState(amps, label=req.label)
        res = TeleportationService.teleport(state)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
