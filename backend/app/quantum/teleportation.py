import numpy as np
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.quantum.states import QuantumState
from app.quantum.correction import PauliCorrection
from app.quantum.pauli import apply_pauli


class TeleportationResult(BaseModel):
    input_state: Dict[str, Any]
    measurement_bits: str
    correction_operations: List[str]
    output_state: Dict[str, Any]
    fidelity: float
    success: bool
    metadata: Dict[str, Any] = Field(default_factory=dict)


def calculate_fidelity(state_in: QuantumState, state_out: QuantumState) -> float:
    """Calculate state fidelity F = |<psi_in|psi_out>|^2."""
    v_in = state_in.to_vector()
    v_out = state_out.to_vector()
    overlap = np.vdot(v_in, v_out)
    return float(np.abs(overlap) ** 2)


class TeleportationService:
    @staticmethod
    def teleport(input_state: QuantumState, seed: Optional[int] = None) -> TeleportationResult:
        """Simulate Quantum Teleportation of 1-qubit state."""
        if input_state.num_qubits != 1:
            raise ValueError("Teleportation currently supports 1-qubit input states.")

        if seed is not None:
            np.random.seed(seed)

        # Step 1: Input state |psi> = a|0> + b|1> on q0
        a, b = input_state.to_vector()

        # Step 2: 3-qubit system (q0: input, q1: Alice Bell, q2: Bob Bell)
        # Initial 3-qubit state: |psi> x (|00> + |11>)/sqrt(2)
        # State vector order: |q0 q1 q2>
        inv_sqrt2 = 1.0 / np.sqrt(2.0)
        # Amplitudes for |q0 q1 q2>:
        # |000>: a*inv_sqrt2
        # |011>: a*inv_sqrt2
        # |100>: b*inv_sqrt2
        # |111>: b*inv_sqrt2
        full_state = np.zeros(8, dtype=np.complex128)
        full_state[0] = a * inv_sqrt2  # |000>
        full_state[3] = a * inv_sqrt2  # |011>
        full_state[4] = b * inv_sqrt2  # |100>
        full_state[7] = b * inv_sqrt2  # |111>

        # Step 3: Apply CNOT(q0 -> q1)
        # CNOT on q0, q1 swaps |100> <-> |110> (idx 4 <-> 6) and |101> <-> |111> (idx 5 <-> 7)
        cnot_state = full_state.copy()
        cnot_state[4], cnot_state[6] = cnot_state[6], cnot_state[4]
        cnot_state[5], cnot_state[7] = cnot_state[7], cnot_state[5]

        # Step 4: Apply H on q0
        # H(q0) transforms |0q1q2> -> (|0q1q2> + |1q1q2>)/sqrt(2)
        # and |1q1q2> -> (|0q1q2> - |1q1q2>)/sqrt(2)
        h_state = np.zeros(8, dtype=np.complex128)
        for q1q2 in range(4):
            idx0 = 0 + q1q2  # |0 q1 q2>
            idx1 = 4 + q1q2  # |1 q1 q2>
            v0 = cnot_state[idx0]
            v1 = cnot_state[idx1]
            h_state[idx0] = (v0 + v1) * inv_sqrt2
            h_state[idx1] = (v0 - v1) * inv_sqrt2

        # Step 5: Measure Alice's 2 qubits (q0, q1)
        # Probabilities for 4 outcomes of (q0, q1): 00, 01, 10, 11 (each with 1/4 total prob)
        probs_m = [
            np.sum(np.abs(h_state[0:2])**2),  # 00 (q2=0,1)
            np.sum(np.abs(h_state[2:4])**2),  # 01 (q2=0,1)
            np.sum(np.abs(h_state[4:6])**2),  # 10 (q2=0,1)
            np.sum(np.abs(h_state[6:8])**2),  # 11 (q2=0,1)
        ]
        
        outcome_idx = np.random.choice(4, p=probs_m)
        bit_outcomes = ["00", "01", "10", "11"]
        m_bits = bit_outcomes[outcome_idx]

        # Extract Bob's raw uncorrected state on q2
        raw_bob_amps = h_state[outcome_idx*2 : outcome_idx*2 + 2]
        raw_bob_amps = raw_bob_amps / np.linalg.norm(raw_bob_amps)
        raw_bob_state = QuantumState(raw_bob_amps, label="Bob_raw")

        # Step 6 & 7: Pauli Correction on Bob's qubit
        corrections = PauliCorrection.get_corrections(m_bits)
        output_state = PauliCorrection.apply_corrections(m_bits, raw_bob_state)
        output_state.label = "Teleported_Output"

        # Step 8: Calculate Fidelity
        fidelity = calculate_fidelity(input_state, output_state)

        return TeleportationResult(
            input_state=input_state.to_dict(),
            measurement_bits=m_bits,
            correction_operations=corrections,
            output_state=output_state.to_dict(),
            fidelity=round(fidelity, 6),
            success=fidelity >= 0.99,
            metadata={"seed": seed}
        )
