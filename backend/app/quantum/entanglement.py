from app.quantum.states import QuantumState
from app.quantum.bell_states import build_bell_state, build_bell_circuit
from qiskit import QuantumCircuit


class EntanglementService:
    @staticmethod
    def prepare_entangled_pair(bell_type: str = "PHI_PLUS") -> QuantumState:
        """Prepare 2-qubit entangled Bell pair QuantumState."""
        return build_bell_state(bell_type)

    @staticmethod
    def prepare_entangled_circuit(bell_type: str = "PHI_PLUS") -> QuantumCircuit:
        """Prepare Qiskit circuit for Bell pair entanglement."""
        return build_bell_circuit(bell_type)

    @staticmethod
    def verify_entanglement(state: QuantumState) -> bool:
        """Verify 2-qubit state is entangled (e.g. Bell state non-separability check)."""
        if state.num_qubits != 2:
            return False
        # Calculate reduced density matrix trace or check non-zero cross terms
        probs = state.probabilities()
        # For Bell states PHI: probs at 00 and 11, PSI: probs at 01 and 10
        is_phi = (probs[0] > 0.4 and probs[3] > 0.4)
        is_psi = (probs[1] > 0.4 and probs[2] > 0.4)
        return bool(is_phi or is_psi)

