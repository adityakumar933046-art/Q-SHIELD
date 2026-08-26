import numpy as np
from typing import Dict, Any, Optional
from qiskit import QuantumCircuit
from app.quantum.backend import QuantumBackendAdapter, BackendType



class MeasurementOutcomeResult(dict):

    def __init__(self, shots: int, counts: Dict[str, int], probabilities: Dict[str, float], backend_name: str = "Qiskit_Aer_Simulator", hardware_readiness: Optional[Dict[str, Any]] = None):
        hw = hardware_readiness or {"hardware_ready": True, "num_qubits": 1, "circuit_depth": 1}
        d = {
            "shots": shots,
            "counts": counts,
            "probabilities": probabilities,
            "backend_name": backend_name,
            "hardware_readiness": hw
        }
        super().__init__(d)
        self.shots = shots
        self.counts = counts
        self.probabilities = probabilities
        self.backend_name = backend_name
        self.hardware_readiness = hw

    def model_dump(self) -> Dict[str, Any]:
        return dict(self)

    def dict() -> Dict[str, Any]:
        return dict(self)


class MeasurementService:
    """Executes quantum circuit measurements and computes probability distributions."""

    def __init__(self):
        self.adapter = QuantumBackendAdapter()

    def execute_measurement(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
        backend_type: BackendType = BackendType.AER_SIMULATOR,
        seed: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        res = self.adapter.execute_circuit(circuit=circuit, shots=shots, backend_type=backend_type, seed_simulator=seed)
        counts = res["counts"]

        total_shots = sum(counts.values())
        probabilities = {k: float(v / total_shots) for k, v in counts.items()}

        return {
            "shots": total_shots,
            "counts": counts,
            "probabilities": probabilities,
            "backend_name": res["backend_name"],
            "hardware_readiness": res["hardware_readiness"]
        }

    @staticmethod
    def measure_state(state: Any, shots: int = 1024, basis: str = "computational", seed: Optional[int] = None, **kwargs) -> MeasurementOutcomeResult:
        svc = MeasurementService()
        if isinstance(state, list):
            all_counts: Dict[str, int] = {}
            total_shots = 0
            for item in state:
                qc = getattr(item, "circuit", item)
                if isinstance(qc, QuantumCircuit):
                    res = svc.execute_measurement(circuit=qc, shots=shots, seed=seed)
                    for k, v in res["counts"].items():
                        all_counts[k] = all_counts.get(k, 0) + v
                    total_shots += res["shots"]
            if total_shots == 0:
                total_shots = shots
            probabilities = {k: float(v / total_shots) for k, v in all_counts.items()}
            return MeasurementOutcomeResult(shots=total_shots, counts=all_counts, probabilities=probabilities)

        qc = getattr(state, "circuit", state)
        if isinstance(qc, QuantumCircuit):
            res = svc.execute_measurement(circuit=qc, shots=shots, seed=seed)
            return MeasurementOutcomeResult(
                shots=res["shots"],
                counts=res["counts"],
                probabilities=res["probabilities"],
                backend_name=res["backend_name"],
                hardware_readiness=res["hardware_readiness"]
            )

        if hasattr(state, "amplitudes"):
            amps = getattr(state, "amplitudes")
            num_qubits = getattr(state, "num_qubits", 1)
            probs = np.abs(amps) ** 2
            probs /= np.sum(probs)
            fmt = f"0{num_qubits}b"
            if seed is not None:
                np.random.seed(seed)
            outcomes = np.random.choice(len(probs), size=shots, p=probs)
            counts: Dict[str, int] = {}
            for o in outcomes:
                bit_str = format(o, fmt)
                counts[bit_str] = counts.get(bit_str, 0) + 1
            probabilities = {k: float(v / shots) for k, v in counts.items()}
            return MeasurementOutcomeResult(shots=shots, counts=counts, probabilities=probabilities)

        return MeasurementOutcomeResult(shots=shots, counts={"0": shots}, probabilities={"0": 1.0})






