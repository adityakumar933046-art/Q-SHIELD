import os
import json
import django
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, state_fidelity, partial_trace

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qshield.settings')
django.setup()

from apps.quantum_engine.services import QuantumEngineService
from apps.statistics_engine.services import StatisticsEngineService
from apps.threat_detection.services import ThreatDetectionService
from apps.attack_simulator.services import AttackSimulatorService

def run_reproducible_validation():
    # Set explicit random seed for 100% reproducibility
    np.random.seed(42)

    print("==================================================")
    print("Q-SHIELD PHASE 18: SCIENTIFIC REPRODUCIBILITY BENCHMARK")
    print("==================================================")

    report_data = {}

    # 1. DEPOLARIZING CHANNEL DENSITY MATRIX DENSITY CHECKS
    print("\n--- 1. DEPOLARIZING CHANNEL DENSITY MATRIX AUDIT ---")
    depolarizing_checks = []
    for eta in [0.0, 0.25, 0.50, 0.75, 1.0]:
        qc = QuantumCircuit(1)
        qc.h(0)
        sv = Statevector.from_instruction(qc)
        pure_dm = DensityMatrix(sv)
        
        identity_matrix = np.eye(2, dtype=complex) / 2.0
        noisy_data = (1.0 - eta) * pure_dm.data + eta * identity_matrix
        noisy_dm = DensityMatrix(noisy_data)

        tr_val = float(np.real(np.trace(noisy_data)))
        is_hermitian = bool(np.allclose(noisy_data, noisy_data.conj().T))
        eigvals = np.linalg.eigvals(noisy_data)
        is_psd = bool(np.all(np.real(eigvals) >= -1e-12))
        computed_fid = float(np.real(state_fidelity(noisy_dm, sv)))
        theo_fid = 1.0 - 0.5 * eta
        abs_err = abs(computed_fid - theo_fid)

        check_entry = {
            'eta': eta,
            'trace': tr_val,
            'is_hermitian': is_hermitian,
            'is_psd': is_psd,
            'theoretical_fidelity': theo_fid,
            'computed_fidelity': computed_fid,
            'abs_error': abs_err
        }
        depolarizing_checks.append(check_entry)
        print(f"eta={eta:4.2f} | Trace={tr_val:.4f} | Herm={is_hermitian} | PSD={is_psd} | Theo Fid={theo_fid:.4f} | Comp Fid={computed_fid:.4f} | Abs Err={abs_err:.6f}")

    report_data['depolarizing_channel_audit'] = depolarizing_checks

    # 2. QBER VS FIDELITY NOISE SWEEP
    print("\n--- 2. QBER VS FIDELITY NOISE SWEEP ---")
    noise_sweep = []
    for eta in [0.0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50]:
        q_res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024, attack_config={'channel_noise': eta}
        )
        stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
        threat_res = ThreatDetectionService.evaluate_threat(stat_res, {'attack_type': 'CHANNEL_MANIPULATION' if eta > 0.11 else ''})
        
        sweep_entry = {
            'noise_eta': eta,
            'fidelity': q_res['fidelity'],
            'trace_distance': q_res['trace_distance'],
            'qber_measured': q_res['qber_measured'],
            'qber_fidelity': q_res['qber_fidelity'],
            'chi2_pvalue': stat_res['chi_square']['p_value'],
            'sprt_decision': stat_res['sprt']['decision'],
            'decision': threat_res['threat_category']
        }
        noise_sweep.append(sweep_entry)
        print(f"Eta: {eta*100:4.1f}% | Fid: {q_res['fidelity']:.4f} | TrDist: {q_res['trace_distance']:.4f} | QBER Meas: {q_res['qber_measured']:.4f} | QBER Fid: {q_res['qber_fidelity']:.4f} | SPRT: {stat_res['sprt']['decision']:17s} | Decision: {threat_res['threat_category']}")

    report_data['noise_sweep'] = noise_sweep

    # 3. FORGERY PROBABILITY MODEL SCALING ACROSS QUBITS N
    print("\n--- 3. FORGERY BOUND SCALING ACROSS QUBIT LENGTHS N ---")
    qubit_lengths = [16, 32, 64, 128]
    forgery_scaling = []
    for n_q in qubit_lengths:
        p_forg = StatisticsEngineService.calculate_forgery_probability(qber=0.0, n_qubits=n_q, target_qber_threshold=0.11)
        k_max = int(np.floor(n_q * 0.11))
        scale_entry = {'n_qubits': n_q, 'k_max': k_max, 'forgery_prob_bound': p_forg}
        forgery_scaling.append(scale_entry)
        print(f"N={n_q:3d} qubits | k_max={k_max:2d} errors | P_forgery_bound={p_forg:.12e}")

    report_data['forgery_scaling'] = forgery_scaling

    # 4. REPRODUCIBLE FALSE POSITIVE / FALSE NEGATIVE BENCHMARK (2,000 RUNS)
    print("\n--- 4. BENCHMARK: 1,000 LEGITIMATE + 1,000 ATTACK RUNS ---")
    legit_runs = 1000
    fp_count = 0
    tn_count = 0

    for _ in range(legit_runs):
        q_res = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024)
        stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
        threat_res = ThreatDetectionService.evaluate_threat(stat_res)
        if threat_res['threat_detected']:
            fp_count += 1
        else:
            tn_count += 1

    attack_runs = 1000
    tp_count = 0
    fn_count = 0
    vectors = ['FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION']
    runs_per_vector = attack_runs // len(vectors)

    for v in vectors:
        for _ in range(runs_per_vector):
            res = AttackSimulatorService.execute_simulation(attack_vector=v, intensity=0.5, shots=1024, user_name='benchmark')
            if res['threat_detection']['threat_detected']:
                tp_count += 1
            else:
                fn_count += 1

    total_neg = tn_count + fp_count
    total_pos = tp_count + fn_count
    fpr = (fp_count / total_neg) * 100.0 if total_neg > 0 else 0.0
    fnr = (fn_count / total_pos) * 100.0 if total_pos > 0 else 0.0
    det_rate = (tp_count / total_pos) * 100.0 if total_pos > 0 else 0.0

    benchmark_summary = {
        'legitimate_runs': legit_runs,
        'true_negatives': tn_count,
        'false_positives': fp_count,
        'attack_runs': attack_runs,
        'true_positives': tp_count,
        'false_negatives': fn_count,
        'detection_rate_pct': round(det_rate, 4),
        'false_positive_rate_pct': round(fpr, 4),
        'false_negative_rate_pct': round(fnr, 4)
    }
    report_data['benchmark_2000_runs'] = benchmark_summary

    print(f"  Legitimate Runs  : {legit_runs} | True Negatives: {tn_count} | False Positives: {fp_count}")
    print(f"  Attack Runs      : {attack_runs} | True Positives: {tp_count} | False Negatives: {fn_count}")
    print(f"  Detection Rate   : {det_rate:.2f}%")
    print(f"  False Pos Rate   : {fpr:.2f}%")
    print(f"  False Neg Rate   : {fnr:.2f}%")

    # Save to JSON
    with open('validation_report.json', 'w') as f:
        json.dump(report_data, f, indent=2)
    print("\nSaved full machine-readable validation report to 'validation_report.json'.")

if __name__ == "__main__":
    run_reproducible_validation()
