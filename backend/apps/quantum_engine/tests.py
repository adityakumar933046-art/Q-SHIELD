from django.test import TestCase
from apps.quantum_engine.services import QuantumEngineService

class QuantumEngineTestCase(TestCase):
    def test_ideal_teleportation_fidelity_plus_state(self):
        """Test ideal quantum teleportation of |+> state achieves fidelity = 1.0 and QBER = 0.0"""
        res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|+>',
            bell_type='PHI_PLUS',
            shots=1024
        )
        self.assertAlmostEqual(res['fidelity'], 1.0, places=4)
        self.assertAlmostEqual(res['qber'], 0.0, places=4)
        self.assertAlmostEqual(res['trace_distance'], 0.0, places=4)
        self.assertIn('execution_id', res)

    def test_ideal_teleportation_fidelity_zero_state(self):
        """Test ideal quantum teleportation of |0> state achieves fidelity = 1.0"""
        res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|0>',
            bell_type='PHI_PLUS',
            shots=1024
        )
        self.assertAlmostEqual(res['fidelity'], 1.0, places=4)
        self.assertAlmostEqual(res['qber'], 0.0, places=4)

    def test_ideal_teleportation_fidelity_iplus_state(self):
        """Test ideal quantum teleportation of |+i> Y-basis state achieves fidelity = 1.0"""
        res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|+i>',
            bell_type='PHI_PLUS',
            shots=1024
        )
        self.assertAlmostEqual(res['fidelity'], 1.0, places=4)
        self.assertAlmostEqual(res['qber'], 0.0, places=4)

    def test_channel_noise_degradation(self):
        """Test channel noise degrades state fidelity and increases QBER and trace distance"""
        res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|0>',
            bell_type='PHI_PLUS',
            shots=1024,
            attack_config={'channel_noise': 1.0}
        )
        self.assertTrue(res['qber'] > 0.0)
        self.assertTrue(res['trace_distance'] > 0.0)

    def test_bsm_tampering_impersonation(self):
        """Test BSM classical bit tampering degrades Bob's state fidelity"""
        res = QuantumEngineService.run_teleportation_qds(
            input_state_symbol='|+>',
            bell_type='PHI_PLUS',
            shots=1024,
            attack_config={'bsm_tamper': True}
        )
        self.assertTrue(res['fidelity'] < 1.0)
        self.assertTrue(res['qber'] > 0.0)
