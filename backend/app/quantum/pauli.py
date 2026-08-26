import numpy as np
from typing import Dict
from app.quantum.states import QuantumState, InvalidQuantumStateError

class InvalidPauliOperatorError(Exception):
    """Raised when an unknown Pauli operator is requested."""
    pass


PAULI_I = np.array([[1.0, 0.0], [0.0, 1.0]], dtype=np.complex128)
PAULI_X = np.array([[0.0, 1.0], [1.0, 0.0]], dtype=np.complex128)
PAULI_Y = np.array([[0.0, -1j], [1j, 0.0]], dtype=np.complex128)
PAULI_Z = np.array([[1.0, 0.0], [0.0, -1.0]], dtype=np.complex128)

MATRICES: Dict[str, np.ndarray] = {
    "I": PAULI_I,
    "X": PAULI_X,
    "Y": PAULI_Y,
    "Z": PAULI_Z
}


def get_pauli_matrix(name: str) -> np.ndarray:
    """Return 2x2 complex Pauli matrix for 'I', 'X', 'Y', or 'Z'."""
    op = name.upper()
    if op not in MATRICES:
        raise InvalidPauliOperatorError(f"Invalid Pauli operator '{name}'. Expected I, X, Y, or Z.")
    return MATRICES[op].copy()


def apply_pauli(operator_name: str, state: QuantumState) -> QuantumState:
    """Apply single-qubit Pauli operator to QuantumState."""
    if state.num_qubits != 1:
        raise InvalidQuantumStateError("apply_pauli requires single-qubit state.")
    matrix = get_pauli_matrix(operator_name)
    new_amps = matrix @ state.to_vector()
    return QuantumState(new_amps, label=f"{operator_name.upper()}({state.label})")
