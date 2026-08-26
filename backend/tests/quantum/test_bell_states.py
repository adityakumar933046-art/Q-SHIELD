import numpy as np
from app.quantum.bell_states import build_bell_state, build_bell_circuit
from app.quantum.entanglement import EntanglementService


def test_bell_state_vectors():
    phi_plus = build_bell_state("PHI_PLUS")
    assert phi_plus.num_qubits == 2
    probs = phi_plus.probabilities()
    assert np.isclose(probs[0], 0.5)
    assert np.isclose(probs[3], 0.5)


def test_bell_circuit():
    qc = build_bell_circuit("PHI_PLUS")
    assert qc.num_qubits == 2


def test_entanglement_verification():
    phi_plus = build_bell_state("PHI_PLUS")
    assert EntanglementService.verify_entanglement(phi_plus) is True
