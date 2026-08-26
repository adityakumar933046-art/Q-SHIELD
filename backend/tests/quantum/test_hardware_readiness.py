from qiskit import QuantumCircuit
from app.quantum.backend import QuantumBackendAdapter, BackendType
from app.quantum.measurement import MeasurementService


def test_backend_capabilities_detection():
    adapter = QuantumBackendAdapter()
    caps_sim = adapter.get_capabilities(BackendType.AER_SIMULATOR)
    assert caps_sim.is_simulator is True
    assert caps_sim.num_qubits == 29

    caps_hw = adapter.get_capabilities(BackendType.HARDWARE_ADAPTER)
    assert caps_hw.is_simulator is False
    assert caps_hw.num_qubits == 127


def test_hardware_readiness_validation():
    adapter = QuantumBackendAdapter()
    qc_valid = QuantumCircuit(3)
    qc_valid.h(0)
    qc_valid.cx(0, 1)

    val = adapter.validate_hardware_readiness(qc_valid, target_qubits=5)
    assert val["hardware_ready"] is True
    assert val["num_qubits"] == 3


def test_measurement_service_with_adapter():
    service = MeasurementService()
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)

    res = service.execute_measurement(qc, shots=512)
    assert res["shots"] == 512
    assert "counts" in res
    assert "probabilities" in res
    assert res["hardware_readiness"]["hardware_ready"] is True
