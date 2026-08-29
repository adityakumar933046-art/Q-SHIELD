from django.test import TestCase
from apps.threat_detection.services import ThreatDetectionService
from apps.attack_simulator.services import AttackSimulatorService
from django.contrib.auth import get_user_model

User = get_user_model()

class ThreatDetectionTestCase(TestCase):
    def test_secure_eval(self):
        analysis_data = {
            'qber': 0.02,
            'fidelity': 0.98,
            'forgery_probability': 0.001,
            'chi_square': {'p_value': 0.85},
            'sprt': {'decision': 'HONEST_CHANNEL'}
        }
        res = ThreatDetectionService.evaluate_threat(analysis_data)
        self.assertFalse(res['threat_detected'])

    def test_qber_breach_detection(self):
        analysis_data = {
            'qber': 0.25,  # Exceeds 0.11
            'fidelity': 0.75,
            'forgery_probability': 0.15,
            'chi_square': {'p_value': 0.001},
            'sprt': {'decision': 'ATTACK_DETECTED'}
        }
        res = ThreatDetectionService.evaluate_threat(analysis_data)
        self.assertTrue(res['threat_detected'])
        self.assertIsNotNone(res['incident_id'])

    def test_attack_simulator_all_vectors(self):
        """Test attack simulator executes all 5 attack vectors and triggers threat detection."""
        vectors = ['FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION']
        for v in vectors:
            res = AttackSimulatorService.execute_simulation(attack_vector=v, intensity=0.5, shots=1024, user_name='test_analyst')
            self.assertTrue(res['threat_detection']['threat_detected'])
            self.assertIn(v, res['threat_detection']['threat_category'])
