import os
import django
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, state_fidelity

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qshield.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from apps.qds.models import QuantumDigitalSignature
from apps.quantum_engine.services import QuantumEngineService
from apps.statistics_engine.services import StatisticsEngineService
from apps.threat_detection.services import ThreatDetectionService
from apps.attack_simulator.services import AttackSimulatorService

User = get_user_model()

def run_all_experiments():
    print("==================================================")
    print("Q-SHIELD PHASE 16: EMPIRICAL ADVERSARIAL VALIDATION")
    print("==================================================")

    # 1. BASELINE STATISTICAL TESTING ACROSS SHOT COUNTS
    print("\n--- 1. BASELINE STATISTICAL TESTING ACROSS SHOT COUNTS ---")
    shot_counts = [100, 500, 1000, 5000, 10000]
    for s in shot_counts:
        q_res = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=s)
        stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
        threat_res = ThreatDetectionService.evaluate_threat(stat_res)
        print(f"Shots: {s:5d} | Fidelity: {q_res['fidelity']:.6f} | QBER: {q_res['qber']:.6f} | Chi2 p-val: {stat_res['chi_square']['p_value']:.4f} | SPRT: {stat_res['sprt']['decision']:17s} | Forgery P: {stat_res['forgery_probability']:.8f} | Decision: {threat_res['threat_category']}")

    # 2. CHANNEL NOISE SWEEP
    print("\n--- 2. CHANNEL NOISE SWEEP ---")
    noise_levels = [0.0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50]
    for n in noise_levels:
        q_res = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024, attack_config={'channel_noise': n})
        stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
        threat_res = ThreatDetectionService.evaluate_threat(stat_res, {'attack_type': 'CHANNEL_MANIPULATION' if n > 0.11 else ''})
        print(f"Noise: {n*100:4.1f}% | Fidelity: {q_res['fidelity']:.4f} | Trace Dist: {q_res['trace_distance']:.4f} | QBER: {q_res['qber']:.4f} | Chi2 p: {stat_res['chi_square']['p_value']:.4f} | SPRT: {stat_res['sprt']['decision']:17s} | Forgery P: {stat_res['forgery_probability']:.6f} | Decision: {threat_res['threat_category']}")

    # 3. FORGERY SWEEP ACROSS GUESS ERROR RATES
    print("\n--- 3. FORGERY SWEEP ACROSS GUESS ERROR RATES ---")
    n_qubits = 64
    error_rates = [0.0, 0.05, 0.10, 0.15, 0.25, 0.40, 0.50]
    for err in error_rates:
        p_forgery = StatisticsEngineService.calculate_forgery_probability(qber=err, n_qubits=n_qubits, target_qber_threshold=0.11)
        decision = "ACCEPT_FORGERY_RISK" if p_forgery > 0.05 else "FORGERY_REJECTED"
        print(f"QBER: {err:4.2f} | Qubits: {n_qubits} | Max Acceptable Errors: {int(np.floor(n_qubits*0.11))} | Forgery Prob CDF: {p_forgery:.8f} | Decision: {decision}")

    # 4. IMPERSONATION VALIDATION
    print("\n--- 4. IMPERSONATION VALIDATION ---")
    imp_q = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024, attack_config={'bsm_tamper': True})
    imp_stat = StatisticsEngineService.analyze_quantum_execution(imp_q)
    imp_threat = ThreatDetectionService.evaluate_threat(imp_stat, {'attack_type': 'IMPERSONATION'})
    print(f"BSM Tampered: True | Fidelity: {imp_q['fidelity']:.4f} | QBER: {imp_q['qber']:.4f} | Chi2 p: {imp_stat['chi_square']['p_value']:.4f} | Decision: {imp_threat['threat_category']}")

    # 5. FIDELITY & TRACE DISTANCE DIRECT QUANTUM STATE VALIDATION
    print("\n--- 5. FIDELITY & TRACE DISTANCE DIRECT QUANTUM STATE VALIDATION ---")
    states_to_compare = [
        ('|0>', '|0>', 'Identical |0> vs |0>'),
        ('|0>', '|1>', 'Orthogonal |0> vs |1>'),
        ('|+>', '|+>', 'Identical |+> vs |+>'),
        ('|+>', '|->', 'Orthogonal |+> vs |->'),
    ]
    for s1, s2, label in states_to_compare:
        qc1 = QuantumCircuit(1)
        QuantumEngineService.prepare_pauli_state(qc1, 0, s1)
        sv1 = Statevector.from_instruction(qc1)

        qc2 = QuantumCircuit(1)
        QuantumEngineService.prepare_pauli_state(qc2, 0, s2)
        sv2 = Statevector.from_instruction(qc2)

        fid = float(np.real(state_fidelity(sv1, sv2)))
        tr_dist = float(0.5 * np.sum(np.abs(np.linalg.eigvals(sv1.to_operator().data - sv2.to_operator().data))))
        print(f"{label:28s} | Fidelity: {fid:.4f} | Trace Distance: {tr_dist:.4f}")

    # 6. FALSE POSITIVE / FALSE NEGATIVE EXPERIMENT (50 REPEATED RUNS)
    print("\n--- 6. FALSE POSITIVE / FALSE NEGATIVE EXPERIMENT (50 RUNS) ---")
    legit_runs = 50
    fp_count = 0
    fn_count = 0
    tp_count = 0
    tn_count = 0

    # 50 Legitimate Runs
    for _ in range(legit_runs):
        q_res = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024)
        stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
        threat_res = ThreatDetectionService.evaluate_threat(stat_res)
        if threat_res['threat_detected']:
            fp_count += 1
        else:
            tn_count += 1

    # 50 Simulated Attack Runs (10 of each 5 vectors)
    vectors = ['FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION']
    for v in vectors:
        for _ in range(10):
            res = AttackSimulatorService.execute_simulation(attack_vector=v, intensity=0.5, shots=1024, user_name='test')
            if res['threat_detection']['threat_detected']:
                tp_count += 1
            else:
                fn_count += 1

    total_neg = tn_count + fp_count
    total_pos = tp_count + fn_count
    fpr = (fp_count / total_neg) * 100.0 if total_neg > 0 else 0.0
    fnr = (fn_count / total_pos) * 100.0 if total_pos > 0 else 0.0
    det_rate = (tp_count / total_pos) * 100.0 if total_pos > 0 else 0.0

    print(f"  Legitimate Runs  : {legit_runs} | True Negatives: {tn_count} | False Positives: {fp_count}")
    print(f"  Attack Runs      : 50 | True Positives: {tp_count} | False Negatives: {fn_count}")
    print(f"  Detection Rate   : {det_rate:.2f}%")
    print(f"  False Pos Rate   : {fpr:.2f}%")
    print(f"  False Neg Rate   : {fnr:.2f}%")

if __name__ == "__main__":
    run_all_experiments()
