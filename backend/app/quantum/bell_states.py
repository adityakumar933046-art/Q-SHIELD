import math
import numpy as np
from typing import Dict
from qiskit import QuantumCircuit
from app.quantum.states import QuantumState

class InvalidBellStateError(Exception):
    """Raised when an invalid Bell state is requested."""
    pass


# 4 Bell State Vectors (|00>, |01>, |10>, |11>)
INV_SQRT2 = 1.0 / math.sqrt(2.0)

BELL_VECTORS: Dict[str, np.ndarray] = {
    "PHI_PLUS": np.array([INV_SQRT2, 0.0, 0.0, INV_SQRT2], dtype=np.complex128),
    "PHI_MINUS": np.array([INV_SQRT2, 0.0, 0.0, -INV_SQRT2], dtype=np.complex128),
    "PSI_PLUS": np.array([0.0, INV_SQRT2, INV_SQRT2, 0.0], dtype=np.complex128),
    "PSI_MINUS": np.array([0.0, INV_SQRT2, -INV_SQRT2, 0.0], dtype=np.complex128),
}


def build_bell_state(bell_type: str = "PHI_PLUS") -> QuantumState:
    """Construct a 2-qubit Bell QuantumState."""
    b_type = bell_type.upper().replace("+", "_PLUS").replace("-", "_MINUS")
    if b_type not in BELL_VECTORS:
        raise InvalidBellStateError(f"Unknown Bell state type '{bell_type}'. Choose PHI_PLUS, PHI_MINUS, PSI_PLUS, PSI_MINUS.")
    return QuantumState(BELL_VECTORS[b_type], label=f"Bell_{b_type}")


def build_bell_circuit(bell_type: str = "PHI_PLUS") -> QuantumCircuit:
    """Build Qiskit QuantumCircuit preparing target Bell state."""
    b_type = bell_type.upper().replace("+", "_PLUS").replace("-", "_MINUS")
    qc = QuantumCircuit(2, name=f"Bell_{b_type}")
    
    if b_type == "PHI_PLUS":
        qc.h(0)
        qc.cx(0, 1)
    elif b_type == "PHI_MINUS":
        qc.x(0)
        qc.h(0)
        qc.cx(0, 1)
    elif b_type == "PSI_PLUS":
        qc.x(1)
        qc.h(0)
        qc.cx(0, 1)
    elif b_type == "PSI_MINUS":
        qc.x(0)
        qc.x(1)
        qc.h(0)
        qc.cx(0, 1)
    else:
        raise InvalidBellStateError(f"Unknown Bell state type '{bell_type}'.")

    return qc
