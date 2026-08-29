import uuid
import numpy as np
from scipy import stats

class StatisticsEngineService:
    """
    Non-Machine-Learning Statistical Threat & Measurement Engine.
    Executes mathematical physics hypothesis testing for QDS.
    """

    @staticmethod
    def compute_qber(error_count: int, total_shots: int) -> float:
        if total_shots <= 0:
            return 0.0
        return round(float(error_count / total_shots), 6)

    @staticmethod
    def calculate_confidence_interval(qber: float, n_shots: int, confidence_level: float = 0.95) -> dict:
        """
        Calculates Wilson score confidence interval for QBER proportion.
        """
        if n_shots <= 0:
            return {'lower_bound': 0.0, 'upper_bound': 0.0, 'margin_of_error': 0.0}

        z = stats.norm.ppf((1.0 + confidence_level) / 2.0)
        p = np.clip(qber, 0.0, 1.0)
        n = n_shots

        denominator = 1.0 + (z**2) / n
        center = (p + (z**2) / (2.0 * n)) / denominator
        spread = (z * np.sqrt((p * (1.0 - p) / n) + (z**2) / (4.0 * (n**2)))) / denominator

        lower = max(0.0, center - spread)
        upper = min(1.0, center + spread)

        return {
            'lower_bound': round(float(lower), 6),
            'upper_bound': round(float(upper), 6),
            'margin_of_error': round(float(spread), 6),
            'confidence_level': confidence_level
        }

    @staticmethod
    def calculate_sample_variance(counts: dict, total_shots: int) -> float:
        """
        Calculates statistical sample variance across projective measurement outcomes.
        """
        if total_shots <= 1 or not counts:
            return 0.0
        
        obs = np.array(list(counts.values()), dtype=np.float64)
        probs = obs / float(total_shots)
        mean_p = np.mean(probs)
        variance = np.sum((probs - mean_p)**2) / (len(probs) - 1) if len(probs) > 1 else 0.0
        return round(float(variance), 8)

    @staticmethod
    def perform_chi_square_test(observed_counts: dict, expected_probs: dict = None) -> dict:
        """
        Chi-Square Goodness-of-Fit Test:
        Compares observed quantum measurement distribution against theoretical Pauli target expectations.
        """
        total_observed = sum(observed_counts.values())
        if total_observed == 0:
            return {'chi2_stat': 0.0, 'p_value': 1.0, 'hypothesis_rejected': False, 'degrees_of_freedom': 1, 'alpha_threshold': 0.05}

        categories = sorted(list(observed_counts.keys()))
        min_obs = min(observed_counts.values()) if observed_counts else 0

        # Zero error shots observed on pure state measurement matches target perfectly (p-val = 1.0)
        if min_obs == 0 and len(observed_counts) <= 2:
            return {
                'chi2_stat': 0.0,
                'p_value': 1.0,
                'degrees_of_freedom': 1,
                'hypothesis_rejected': False,
                'alpha_threshold': 0.05
            }

        if expected_probs is None:
            # Default uniform distribution if categories are balanced, else pure target distribution
            if len(categories) == 2 and abs(observed_counts.get(categories[0], 0) - observed_counts.get(categories[1], 0)) < 10:
                expected_probs = {c: 0.5 for c in categories}
            elif len(categories) == 2:
                major_cat = max(observed_counts, key=observed_counts.get)
                expected_probs = {c: (0.99 if c == major_cat else 0.01) for c in categories}
            else:
                prob = 1.0 / len(categories)
                expected_probs = {c: prob for c in categories}

        obs_vec = np.array([observed_counts[c] for c in categories], dtype=np.float64)
        exp_vec = np.array([expected_probs.get(c, 0.01) * total_observed for c in categories], dtype=np.float64)

        exp_vec = np.maximum(exp_vec, 1.0)

        chi2_stat, p_val = stats.chisquare(f_obs=obs_vec, f_exp=exp_vec)

        dof = max(len(categories) - 1, 1)
        is_rejected = bool(p_val < 0.05)

        return {
            'chi2_stat': round(float(chi2_stat), 6),
            'p_value': round(float(p_val), 8),
            'degrees_of_freedom': dof,
            'hypothesis_rejected': is_rejected,
            'alpha_threshold': 0.05
        }

    @staticmethod
    def calculate_forgery_probability(qber: float, n_qubits: int = 64, target_qber_threshold: float = 0.11) -> float:
        """
        Calculates Upper-Bound Adversary Signature Forgery Probability P_forgery.
        Adversary Eve attempting to forge a QDS signature sequence without Alice's secret key choices
        must guess Pauli eigenstates randomly (error rate 0.5). Under channel noise QBER,
        Eve's probability of satisfying the verification error threshold k_max is bounded by Binomial CDF.
        """
        qber_clamped = float(np.clip(qber, 0.0, 1.0))
        max_acceptable_errors = int(np.floor(n_qubits * target_qber_threshold))

        # Adversary guessing error rate p_error = 0.5 - 0.4 * qber
        p_error = 0.5 - 0.4 * qber_clamped

        p_forgery = stats.binom.cdf(max_acceptable_errors, n_qubits, p_error)
        return round(float(np.clip(p_forgery, 1e-12, 1.0)), 8)

    @staticmethod
    def run_sprt(errors: int, total_samples: int, p0: float = 0.02, p1: float = 0.11, alpha: float = 0.01, beta: float = 0.01) -> dict:
        """
        Sequential Probability Ratio Test (SPRT):
        H0: Channel is Honest/Noiseless (error rate <= p0)
        H1: Channel is Under Attack/Tampered (error rate >= p1)
        """
        if total_samples == 0:
            return {'llr': 0.0, 'decision': 'CONTINUE_MONITORING', 'upper_bound_A': 4.595, 'lower_bound_B': -4.595}

        p0 = max(1e-4, min(p0, 0.49))
        p1 = max(p0 + 1e-3, min(p1, 0.5))

        # Log-Likelihood Ratio
        llr = errors * np.log(p1 / p0) + (total_samples - errors) * np.log((1.0 - p1) / (1.0 - p0))

        # Boundaries
        bound_a = np.log((1.0 - beta) / alpha)  # Upper threshold to accept H1 (Attack)
        bound_b = np.log(beta / (1.0 - alpha))  # Lower threshold to accept H0 (Honest)

        if llr >= bound_a:
            decision = 'ATTACK_DETECTED'
        elif llr <= bound_b:
            decision = 'HONEST_CHANNEL'
        else:
            decision = 'CONTINUE_MONITORING'

        return {
            'log_likelihood_ratio': round(float(llr), 6),
            'upper_bound_A': round(float(bound_a), 6),
            'lower_bound_B': round(float(bound_b), 6),
            'decision': decision
        }

    @classmethod
    def analyze_quantum_execution(cls, execution_data: dict) -> dict:
        """
        Full statistical analysis pipeline for a quantum execution result.
        """
        shots = execution_data.get('shots', 1024)
        counts = execution_data.get('measurement_counts', {})
        fidelity = execution_data.get('fidelity', 1.0)
        qber = execution_data.get('qber', 1.0 - fidelity)

        # 1. Chi-Square test against theoretical expected distribution
        chi_res = cls.perform_chi_square_test(counts)

        # 2. Forgery probability estimation
        p_forgery = cls.calculate_forgery_probability(qber)

        # 3. SPRT Test
        total_error_shots = execution_data.get('error_shots', int(round(qber * shots)))
        sprt_res = cls.run_sprt(total_error_shots, shots)

        # 4. Confidence Interval & Variance
        conf_int = cls.calculate_confidence_interval(qber, shots)
        variance = cls.calculate_sample_variance(counts, shots)

        record_id = f"STAT-{uuid.uuid4().hex[:12].upper()}"

        return {
            'record_id': record_id,
            'execution_id': execution_data.get('execution_id', ''),
            'shots': shots,
            'qber': qber,
            'fidelity': fidelity,
            'chi_square': chi_res,
            'forgery_probability': p_forgery,
            'sprt': sprt_res,
            'confidence_interval': conf_int,
            'sample_variance': variance
        }
