from app.quantum.states import state_plus
from app.quantum.measurement import MeasurementService
from app.quantum.backend import AerBackend
from app.quantum.bell_states import build_bell_circuit


def test_measurement_service():
    sp = state_plus()
    res = MeasurementService.measure_state(sp, shots=1000, seed=42)
    assert res.shots == 1000
    assert "0" in res.counts
    assert "1" in res.counts
    assert abs(res.probabilities["0"] - 0.5) < 0.1


def test_aer_backend_execution():
    backend = AerBackend(seed_simulator=42)
    qc = build_bell_circuit("PHI_PLUS")
    res = backend.run_circuit(qc, shots=500)
    assert res.shots == 500
    assert sum(res.counts.values()) == 500
