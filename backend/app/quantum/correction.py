from typing import List, Dict
from app.quantum.pauli import apply_pauli
from app.quantum.states import QuantumState

class PauliCorrection:
    """Maps 2-bit classical measurement outcomes to required Pauli corrections."""

    # Measurement (m0, m1) mapping:
    # 00 -> I
    # 01 -> X
    # 10 -> Z
    # 11 -> XZ (Z after X)
    CORRECTION_MAP: Dict[str, List[str]] = {
        "00": ["I"],
        "01": ["X"],
        "10": ["Z"],
        "11": ["X", "Z"],
    }

    @classmethod
    def get_corrections(cls, bit_string: str) -> List[str]:
        """Return list of Pauli operators to apply for classical measurement outcome."""
        bits = bit_string.zfill(2)
        return cls.CORRECTION_MAP.get(bits, ["I"])

    @classmethod
    def apply_corrections(cls, bit_string: str, state: QuantumState) -> QuantumState:
        """Apply Pauli corrections for measurement bits to a single-qubit QuantumState."""
        ops = cls.get_corrections(bit_string)
        curr = state
        for op in ops:
            if op != "I":
                curr = apply_pauli(op, curr)
        return curr
