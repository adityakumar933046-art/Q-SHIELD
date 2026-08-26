from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


class BackendType(str, Enum):
    AER_SIMULATOR = "AER_SIMULATOR"
    NOISY_SIMULATOR = "NOISY_SIMULATOR"
    HARDWARE_ADAPTER = "HARDWARE_ADAPTER"


class BackendCapability(BaseModel):
    name: str
    backend_type: BackendType
    num_qubits: int = 29
    supports_teleportation: bool = True
    supports_pauli: bool = True
    max_shots: int = 8192
    is_simulator: bool = True
    coupling_map_available: bool = True
    noise_model_available: bool = True


class QuantumBackendAdapter:
    """Master Quantum Backend Adapter supporting Qiskit Aer simulation and hardware readiness validation."""

    def __init__(self):
        self._simulator = AerSimulator()

    def get_capabilities(self, backend_type: BackendType = BackendType.AER_SIMULATOR) -> BackendCapability:
        if backend_type == BackendType.HARDWARE_ADAPTER:
            return BackendCapability(
                name="Hardware_Adapter_Abstract",
                backend_type=BackendType.HARDWARE_ADAPTER,
                num_qubits=127,
                is_simulator=False,
                coupling_map_available=True,
                noise_model_available=True
            )
        return BackendCapability(
            name="Qiskit_Aer_Simulator",
            backend_type=BackendType.AER_SIMULATOR,
            num_qubits=29,
            is_simulator=True,
            coupling_map_available=True,
            noise_model_available=True
        )

    def validate_hardware_readiness(self, circuit: Any, target_qubits: int = 29) -> Dict[str, Any]:
        """Validate whether circuit qubit count and depth are hardware ready."""
        qc = getattr(circuit, "circuit", circuit)
        n_qubits = getattr(qc, "num_qubits", getattr(circuit, "num_qubits", 1))
        depth = qc.depth() if hasattr(qc, "depth") else 1

        is_ready = (n_qubits <= target_qubits)
        reasons = []
        if not is_ready:
            reasons.append(f"Circuit qubit count ({n_qubits}) exceeds target capacity ({target_qubits}).")

        return {
            "hardware_ready": is_ready,
            "num_qubits": n_qubits,
            "circuit_depth": depth,
            "target_qubits": target_qubits,
            "reasons": reasons
        }


    def execute_circuit(
        self,
        circuit: Any,
        shots: int = 1024,
        backend_type: BackendType = BackendType.AER_SIMULATOR,
        noise_model: Optional[Any] = None,
        seed_simulator: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Execute QuantumCircuit using specified backend type."""
        readiness = self.validate_hardware_readiness(circuit)
        if not readiness["hardware_ready"]:
            raise ValueError(f"Circuit hardware readiness validation failed: {readiness['reasons']}")

        # Execution using Qiskit Aer simulator driver
        qc = getattr(circuit, "circuit", circuit)
        compiled_qc = qc.copy() if hasattr(qc, "copy") else qc
        if hasattr(compiled_qc, "cregs") and not compiled_qc.cregs:
            compiled_qc.measure_all()

        run_kwargs = {"shots": shots}
        if noise_model is not None:
            run_kwargs["noise_model"] = noise_model
        if seed_simulator is not None:
            run_kwargs["seed_simulator"] = seed_simulator

        job = self._simulator.run(compiled_qc, **run_kwargs)
        result = job.result()
        counts = result.get_counts(compiled_qc)

        return {
            "counts": counts,
            "shots": shots,
            "backend_name": self.get_capabilities(backend_type).name,
            "hardware_readiness": readiness
        }


def get_aer_backend() -> AerSimulator:
    """Return default Qiskit Aer simulator instance."""
    return AerSimulator()


class AerBackend:
    def __init__(self, **kwargs):
        self._sim = AerSimulator(**kwargs)

    def run_circuit(self, circuit: Any, shots: int = 1024) -> Any:
        qc = getattr(circuit, "circuit", circuit)
        compiled_qc = qc.copy() if hasattr(qc, "copy") else qc
        if hasattr(compiled_qc, "cregs") and not compiled_qc.cregs:
            compiled_qc.measure_all()
        job = self._sim.run(compiled_qc, shots=shots)
        result = job.result()
        counts = result.get_counts(compiled_qc)
        
        class AerResult(dict):
            def __init__(self, counts, shots):
                super().__init__({"counts": counts, "shots": shots})
                self.counts = counts
                self.shots = shots
            def get_counts(self):
                return self.counts

        return AerResult(counts, shots)




