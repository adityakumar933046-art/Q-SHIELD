from django.test import TestCase
from apps.statistics_engine.services import StatisticsEngineService

class StatisticsEngineTestCase(TestCase):
    def test_chi_square_uniform_distribution(self):
        counts = {'0': 512, '1': 512}
        res = StatisticsEngineService.perform_chi_square_test(counts)
        self.assertFalse(res['hypothesis_rejected'])
        self.assertAlmostEqual(res['chi2_stat'], 0.0, places=4)

    def test_chi_square_anomalous_distribution(self):
        counts = {'0': 1000, '1': 24}
        res = StatisticsEngineService.perform_chi_square_test(counts)
        self.assertTrue(res['hypothesis_rejected'])
        self.assertTrue(res['p_value'] < 0.05)

    def test_forgery_probability_calculation_noiseless(self):
        forgery_p = StatisticsEngineService.calculate_forgery_probability(qber=0.0, n_qubits=64)
        self.assertTrue(forgery_p < 1e-4)

    def test_forgery_probability_high_qber_fails_forgery(self):
        """When QBER is high (0.45), Eve's probability of successful forgery is near zero because verifier rejects errors."""
        forgery_p = StatisticsEngineService.calculate_forgery_probability(qber=0.45, n_qubits=64)
        self.assertTrue(forgery_p < 1e-4)

    def test_sprt_honest_channel(self):
        # 10 errors out of 1000 samples (QBER = 0.01 <= p0=0.02)
        res = StatisticsEngineService.run_sprt(errors=10, total_samples=1000)
        self.assertEqual(res['decision'], 'HONEST_CHANNEL')

    def test_sprt_attack_detection(self):
        # 200 errors out of 1000 samples (QBER = 0.20 > p1=0.11)
        res = StatisticsEngineService.run_sprt(errors=200, total_samples=1000)
        self.assertEqual(res['decision'], 'ATTACK_DETECTED')

    def test_confidence_interval_calculation(self):
        res = StatisticsEngineService.calculate_confidence_interval(qber=0.05, n_shots=1000)
        self.assertTrue(res['lower_bound'] < 0.05)
        self.assertTrue(res['upper_bound'] > 0.05)
