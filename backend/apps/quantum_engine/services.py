import uuid
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector, DensityMatrix, state_fidelity, partial_trace

class QuantumEngineService:
    """
    Pure Quantum Simulation Engine for Q-SHIELD.
    Provides:
    - Teleportation-based Quantum Digital Signature (QDS) key distribution simulation.
    - Bell state entanglement preparation (|Phi+>, |Phi->, |Psi+>, |Psi->).
    - Pauli eigenstate preparation (|0>, |1>, |+>, |->, |+i>, |-i>).
    - Bell State Measurements (BSM) & Teleportation recovery.
    - Depolarizing channel noise simulation & density matrix fidelity / trace distance analysis.
    - Projective measurements in X, Y, and Z bases.
    """

    BASIS_MAP = {
        'ZERO': '|0>',
        'ONE': '|1>',
        'PLUS': '|+>',
        'MINUS': '|->',
        'IPLUS': '|+i>',
        'IMINUS': '|-i>'
    }

    @staticmethod
    def prepare_pauli_state(circuit: QuantumCircuit, qubit_index: int, state_symbol: str):
        """
        Applies quantum gates to prepare a target single-qubit Pauli eigenstate.
        |0> : I (Z=+1)
        |1> : X (Z=-1)
        |+> : H (X=+1)
        |-> : X then H (X=-1)
        |+i>: H then S (Y=+1)
        |-i>: X then H then S (Y=-1)
        """
        if state_symbol in ('|0>', 'ZERO'):
            pass
        elif state_symbol in ('|1>', 'ONE'):
            circuit.x(qubit_index)
        elif state_symbol in ('|+>', 'PLUS'):
            circuit.h(qubit_index)
        elif state_symbol in ('|->', 'MINUS'):
            circuit.x(qubit_index)
            circuit.h(qubit_index)
        elif state_symbol in ('|+i>', 'IPLUS'):
            circuit.h(qubit_index)
            circuit.s(qubit_index)
        elif state_symbol in ('|-i>', 'IMINUS'):
            circuit.x(qubit_index)
            circuit.h(qubit_index)
            circuit.s(qubit_index)
        else:
            raise ValueError(f"Unsupported Pauli state symbol: {state_symbol}")

    @staticmethod
    def prepare_bell_state(circuit: QuantumCircuit, q0: int, q1: int, bell_type: str = 'PHI_PLUS'):
        """
        Prepares standard Bell entanglement pairs between two qubits.
        PHI_PLUS  (|Phi+>): (|00> + |11>) / sqrt(2)
        PHI_MINUS (|Phi->): (|00> - |11>) / sqrt(2)
        PSI_PLUS  (|Psi+>): (|01> + |10>) / sqrt(2)
        PSI_MINUS (|Psi->): (|01> - |10>) / sqrt(2)
        """
        circuit.h(q0)
        circuit.cx(q0, q1)

        if bell_type == 'PHI_MINUS':
            circuit.z(q0)
        elif bell_type == 'PSI_PLUS':
            circuit.x(q1)
        elif bell_type == 'PSI_MINUS':
            circuit.x(q1)
            circuit.z(q0)

    @classmethod
    def run_teleportation_qds(
        cls,
        input_state_symbol: str = '|+>',
        bell_type: str = 'PHI_PLUS',
        shots: int = 1024,
        attack_config: dict = None
    ) -> dict:
        """
        Simulates complete 3-qubit Quantum Teleportation protocol for QDS.
        
        Qubit 0 (Alice): Payload state to teleport |psi>
        Qubit 1 (Alice): Entangled Bell pair qubit
        Qubit 2 (Bob)  : Entangled Bell pair qubit receiving teleported state

        Attack options supported:
        - channel_noise: Depolarizing noise parameter eta in [0, 1] on quantum channel
        - bsm_tamper: Alice's BSM classical bits tampered during transmission (Impersonation)
        - forgery: Fake payload state substituted (Forgery)
        """
        attack_config = attack_config or {}
        channel_noise = max(0.0, min(float(attack_config.get('channel_noise', 0.0)), 1.0))
        bsm_tamper = attack_config.get('bsm_tamper', False)
        forgery = attack_config.get('forgery', False)
        fake_state = attack_config.get('fake_state', '|1>')

        # 1. Target ideal reference statevector
        ref_qc = QuantumCircuit(1)
        target_state_sym = fake_state if forgery else input_state_symbol
        cls.prepare_pauli_state(ref_qc, 0, input_state_symbol)
        ideal_target_sv = Statevector.from_instruction(ref_qc)

        # 2. Build Teleportation Circuit for Statevector Execution
        teleport_state_qc = QuantumCircuit(3)
        cls.prepare_pauli_state(teleport_state_qc, 0, target_state_sym)
        cls.prepare_bell_state(teleport_state_qc, 1, 2, bell_type)
        
        teleport_state_qc.cx(0, 1)
        teleport_state_qc.h(0)
        if not bsm_tamper:
            teleport_state_qc.cx(1, 2)
            teleport_state_qc.cz(0, 2)
        else:
            teleport_state_qc.x(2)  # Corrupted recovery

        full_sv = Statevector.from_instruction(teleport_state_qc)
        bob_dm_pure = partial_trace(full_sv, [0, 1])

        # 3. Model Depolarizing Channel Noise on Bob's Density Matrix
        # rho_noisy = (1 - channel_noise) * rho_pure + channel_noise * (I / 2)
        # Trace(rho_noisy) = 1.0 for all eta in [0, 1]
        if channel_noise > 0.0:
            identity_matrix = np.eye(2, dtype=complex) / 2.0
            noisy_data = (1.0 - channel_noise) * bob_dm_pure.data + channel_noise * identity_matrix
            bob_dm_density = DensityMatrix(noisy_data)
        else:
            bob_dm_density = DensityMatrix(bob_dm_pure)

        # Compute Density Matrix State Fidelity F(rho_bob, |psi_target><psi_target|)
        computed_fidelity = float(np.real(state_fidelity(bob_dm_density, ideal_target_sv)))
        trace_dist = float(0.5 * np.sum(np.abs(np.linalg.eigvals(bob_dm_density.data - ideal_target_sv.to_operator().data))))

        # 4. Projective Measurement Sampling under Channel Noise & State Mismatch
        expected_bit = '1' if input_state_symbol in ('|1>', 'ONE', '|->', 'MINUS', '|-i>', 'IMINUS') else '0'
        
        # Error probability is exact state overlap complement 1 - F
        prob_error = float(np.clip(1.0 - computed_fidelity, 0.0, 1.0))
        
        error_shots = int(np.random.binomial(shots, prob_error))
        correct_shots = shots - error_shots

        formatted_counts = {
            expected_bit: correct_shots,
            ('0' if expected_bit == '1' else '1'): error_shots
        }

        qber_measured = round(float(error_shots / shots), 6) if shots > 0 else 0.0
        qber_fidelity = round(float(1.0 - computed_fidelity), 6)

        execution_id = f"QEXEC-{uuid.uuid4().hex[:12].upper()}"

        return {
            'execution_id': execution_id,
            'shots': shots,
            'input_state_symbol': input_state_symbol,
            'bell_state_type': bell_type,
            'fidelity': round(computed_fidelity, 6),
            'trace_distance': round(trace_dist, 6),
            'measurement_counts': formatted_counts,
            'statevector_real': list(np.real(full_sv.data)),
            'statevector_imag': list(np.imag(full_sv.data)),
            'qber': qber_measured,
            'qber_measured': qber_measured,
            'qber_fidelity': qber_fidelity,
            'error_shots': error_shots,
            'attack_injected': bool(attack_config)
        }
