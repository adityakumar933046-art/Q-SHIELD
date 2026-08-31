import hashlib
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization
from apps.qds.models import QuantumDigitalSignature
from apps.verification.models import SignatureVerificationAttempt
from apps.incidents.models import SecurityIncident
from apps.audit.models import AuditTrailRecord
from apps.accounts.models import StepUpToken

User = get_user_model()

class EndToEndIntegrationTestCase(TestCase):
    def setUp(self):
        self.org_a = Organization.objects.create(name="Defense Command Alpha", domain="alpha.gov")
        self.org_b = Organization.objects.create(name="Defense Command Beta", domain="beta.gov")

        self.admin = User.objects.create_user(
            username="admin_user", password="AdminPassword123!", role=User.Role.ADMIN, organization=self.org_a
        )
        self.signer_alice = User.objects.create_user(
            username="alice_signer", password="SignerPassword123!", role=User.Role.SIGNER, organization=self.org_a
        )
        self.verifier_bob = User.objects.create_user(
            username="bob_verifier", password="VerifierPassword123!", role=User.Role.VERIFIER, organization=self.org_a
        )
        self.verifier_carol = User.objects.create_user(
            username="carol_verifier", password="VerifierPassword123!", role=User.Role.VERIFIER, organization=self.org_b
        )
        self.analyst_dave = User.objects.create_user(
            username="dave_analyst", password="AnalystPassword123!", role=User.Role.SECURITY_ANALYST, organization=self.org_a
        )

    def _post_qds_with_stepup(self, client, user, data):
        step_up = StepUpToken.objects.create(user=user)
        client.force_authenticate(user=user)
        return client.post('/api/qds/', data, HTTP_X_STEP_UP_TOKEN=str(step_up.token))

    def test_e2e_legitimate_signing_and_verification_pipeline(self):
        """E2E Test: Signer creates QDS -> Verifier verifies signature -> Verification passes cleanly."""
        client = APIClient()
        create_resp = self._post_qds_with_stepup(client, self.signer_alice, {
            'payload_content': 'Top Secret Operation Directive 2026',
            'quantum_state_basis': '|+>',
            'bell_pair_type': 'PHI_PLUS'
        })
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        sig_data = create_resp.data['signature']
        sig_id = sig_data['signature_id']

        # 2. Verifier verifies signature via HTTP API
        client.force_authenticate(user=self.verifier_bob)
        verify_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'Top Secret Operation Directive 2026'
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['verification_attempt']['verification_result'], 'PASSED')

        # 3. Verify audit record logged
        audit_record = AuditTrailRecord.objects.filter(target_resource=sig_id, action_type='QDS_VERIFICATION_ATTEMPT').first()
        self.assertIsNotNone(audit_record)

    def test_e2e_modified_payload_rejection(self):
        """E2E Test: Verifier provides modified payload text -> Server rejects digest mismatch."""
        client = APIClient()
        create_resp = self._post_qds_with_stepup(client, self.signer_alice, {
            'payload_content': 'Top Secret Operation Directive 2026',
            'quantum_state_basis': '|+>'
        })
        sig_id = create_resp.data['signature']['signature_id']

        client.force_authenticate(user=self.verifier_bob)
        verify_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'TAMPERED Payload Document'
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['verification_attempt']['verification_result'], 'REJECTED_DIGEST_MISMATCH')

    def test_e2e_server_side_replay_attack_prevention(self):
        """E2E Test: Second verification attempt on consumed signature is rejected as Replay Attack (HTTP 409)."""
        client = APIClient()
        create_resp = self._post_qds_with_stepup(client, self.signer_alice, {
            'payload_content': 'Replay Test Payload',
            'quantum_state_basis': '|+>'
        })
        sig_id = create_resp.data['signature']['signature_id']

        client.force_authenticate(user=self.verifier_bob)
        
        # 1st verification (Succeeds)
        resp1 = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'Replay Test Payload'
        })
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        self.assertEqual(resp1.data['verification_attempt']['verification_result'], 'PASSED')

        # 2nd verification (Replay Attack Rejected by Server)
        resp2 = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'Replay Test Payload'
        })
        self.assertEqual(resp2.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Replay Attack Detected', str(resp2.data))

    def test_e2e_unauthorized_cross_organization_verification_blocked(self):
        """E2E Test: Verifier from Org B attempts to verify Org A signature -> Blocked (HTTP 403) & Incident Created."""
        client = APIClient()
        create_resp = self._post_qds_with_stepup(client, self.signer_alice, {
            'payload_content': 'Internal Org A Payload',
            'quantum_state_basis': '|+>'
        })
        sig_id = create_resp.data['signature']['signature_id']

        client.force_authenticate(user=self.verifier_carol)
        verify_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'Internal Org A Payload'
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Access denied', str(verify_resp.data))

        # Check SecurityIncident created
        inc = SecurityIncident.objects.filter(category='UNAUTHORIZED_VERIFICATION').first()
        self.assertIsNotNone(inc)

    def test_e2e_attack_simulator_runs(self):
        """E2E Test: Security Analyst runs all 5 attack vectors via Attack Simulator API."""
        client = APIClient()
        client.force_authenticate(user=self.analyst_dave)

        vectors = ['FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION']
        for v in vectors:
            resp = client.post('/api/attack-simulator/simulate/', {
                'attack_vector': v,
                'input_state_symbol': '|+>',
                'bell_pair_type': 'PHI_PLUS',
                'shots': 1024
            })
            self.assertEqual(resp.status_code, status.HTTP_200_OK)
            self.assertIn('threat_detection', resp.data)
            self.assertTrue(resp.data['threat_detection']['threat_detected'])
