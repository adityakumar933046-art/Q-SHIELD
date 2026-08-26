import math
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class InvalidQuantumStateError(Exception):
    """Raised when a quantum state vector fails normalization or dimensionality checks."""
    pass


class QuantumState:
    def __init__(self, amplitudes: Any, label: Optional[str] = None):
        amps = np.array(amplitudes, dtype=np.complex128)
        dim = len(amps)
        if dim == 0 or (dim & (dim - 1)) != 0:
            raise InvalidQuantumStateError(f"Dimension {dim} must be a positive power of 2.")
        
        self.amplitudes = amps
        self.num_qubits = int(math.log2(dim))
        self.label = label or f"{self.num_qubits}-qubit state"
        self.validate()

    def validate(self, tolerance: float = 1e-6) -> None:
        """Validate state vector normalization: sum(|a_i|^2) = 1."""
        norm_sq = np.sum(np.abs(self.amplitudes) ** 2)
        if abs(norm_sq - 1.0) > tolerance:
            raise InvalidQuantumStateError(f"Quantum state vector not normalized: sum(|a_i|^2) = {norm_sq:.6f}")

    def normalize(self) -> "QuantumState":
        """Return a new normalized QuantumState."""

        norm = np.linalg.norm(self.amplitudes)
        if norm == 0:
            raise InvalidQuantumStateError("Cannot normalize zero vector.")
        return QuantumState(self.amplitudes / norm, label=self.label)

    def to_vector(self) -> np.ndarray:
        return self.amplitudes.copy()

    def probabilities(self) -> np.ndarray:
        """Return probability distribution over computational basis states."""
        return np.abs(self.amplitudes) ** 2

    def to_dict(self) -> Dict[str, Any]:
        """Serializable dictionary representation."""
        return {
            "num_qubits": self.num_qubits,
            "label": self.label,
            "amplitudes": [{"real": float(c.real), "imag": float(c.imag)} for c in self.amplitudes],
            "probabilities": [float(p) for p in self.probabilities()]
        }

    def __repr__(self) -> str:
        return f"QuantumState(label='{self.label}', qubits={self.num_qubits})"


# Presets
def state_0() -> QuantumState:
    return QuantumState([1.0, 0.0], label="|0>")

def state_1() -> QuantumState:
    return QuantumState([0.0, 1.0], label="|1>")

def state_plus() -> QuantumState:
    return QuantumState([1/math.sqrt(2), 1/math.sqrt(2)], label="|+>")

def state_minus() -> QuantumState:
    return QuantumState([1/math.sqrt(2), -1/math.sqrt(2)], label="|->")
