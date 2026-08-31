import hashlib
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization
from apps.qds.models import QuantumDigitalSignature
from apps.threat_detection.models import ThresholdRule

User = get_user_model()

class QDSSecurityTestCase(TestCase):
    def setUp(self):
        self.org_a = Organization.objects.create(name="Org Alpha", domain="alpha.gov")
        self.org_b = Organization.objects.create(name="Org Beta", domain="beta.gov")

        self.signer_a = User.objects.create_user(
            username="signer_a", password="Password123!", role=User.Role.SIGNER, organization=self.org_a
        )
        self.verifier_a = User.objects.create_user(
            username="verifier_a", password="Password123!", role=User.Role.VERIFIER, organization=self.org_a
        )
        self.verifier_b = User.objects.create_user(
            username="verifier_b", password="Password123!", role=User.Role.VERIFIER, organization=self.org_b
        )
        self.analyst_a = User.objects.create_user(
            username="analyst_a", password="Password123!", role=User.Role.SECURITY_ANALYST, organization=self.org_a
        )
        self.admin_a = User.objects.create_user(
            username="admin_a", password="Password123!", role=User.Role.ADMIN, organization=self.org_a
        )

        self.rule = ThresholdRule.objects.create(
            rule_name="QBER Test Rule", metric_type="QBER", operator=">", threshold_value=0.11, severity="CRITICAL"
        )

    def test_organization_isolation_on_signatures(self):
        """Org A user cannot see Org B signatures via API."""
        sig_b = QuantumDigitalSignature.objects.create(
            sender=User.objects.create_user(username="signer_b", password="Password123!", role=User.Role.SIGNER, organization=self.org_b),
            message_payload="Confidential Org B Document",
            message_digest=hashlib.sha256(b"Confidential Org B Document").hexdigest(),
            quantum_state_basis="|+>"
        )

        client = APIClient()
        client.force_authenticate(user=self.signer_a)
        response = client.get('/api/qds/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        sig_ids = [s['signature_id'] for s in results]
        self.assertNotIn(sig_b.signature_id, sig_ids)

    def test_unauthorized_cross_organization_verification_denied(self):
        """Verifier from Org B cannot verify Org A signature if not designated recipient."""
        payload = "Secret Directive"
        sig_a = QuantumDigitalSignature.objects.create(
            sender=self.signer_a,
            recipient_organization=self.org_a,
            message_payload=payload,
            message_digest=hashlib.sha256(payload.encode('utf-8')).hexdigest(),
            quantum_state_basis="|+>"
        )

        client = APIClient()
        client.force_authenticate(user=self.verifier_b)
        response = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_a.signature_id,
            'payload_content': payload
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Access denied', str(response.data))

    def test_server_side_replay_attack_detection(self):
        """First verification succeeds; second attempt on consumed state is rejected as Replay Attack."""
        payload = "Secret Directive"
        sig_a = QuantumDigitalSignature.objects.create(
            sender=self.signer_a,
            recipient_organization=self.org_a,
            message_payload=payload,
            message_digest=hashlib.sha256(payload.encode('utf-8')).hexdigest(),
            quantum_state_basis="|+>"
        )

        client = APIClient()
        client.force_authenticate(user=self.verifier_a)
        
        # 1st Verification (Succeeds)
        resp1 = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_a.signature_id,
            'payload_content': payload
        })
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        self.assertEqual(resp1.data['verification_attempt']['verification_result'], 'PASSED')

        # 2nd Verification (Server Replay Detection Triggered)
        resp2 = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_a.signature_id,
            'payload_content': payload
        })
        self.assertEqual(resp2.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Replay Attack Detected', str(resp2.data))

    def test_threshold_rule_modification_protection(self):
        """Only ADMIN can modify threshold rules; Analyst or Verifier is denied write access."""
        client = APIClient()
        
        # Analyst attempts PUT (Forbidden)
        client.force_authenticate(user=self.analyst_a)
        resp_analyst = client.patch(f'/api/threats/rules/{self.rule.id}/', {'threshold_value': 0.05})
        self.assertEqual(resp_analyst.status_code, status.HTTP_403_FORBIDDEN)

        # Admin attempts PUT (Allowed)
        client.force_authenticate(user=self.admin_a)
        resp_admin = client.patch(f'/api/threats/rules/{self.rule.id}/', {'threshold_value': 0.05})
        self.assertEqual(resp_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_admin.data['threshold_value'], 0.05)

    def test_signing_request_requires_step_up_token(self):
        """Signing a request requires valid step-up token."""
        from apps.qds.models import SigningRequest
        from apps.accounts.models import StepUpToken

        req = SigningRequest.objects.create(
            request_id="REQ-TEST1",
            requester=self.verifier_a,
            signer=self.signer_a,
            purpose="Test Signing Request",
            payload_content="Sensitive Payload Content",
            status="PENDING"
        )

        client = APIClient()
        client.force_authenticate(user=self.signer_a)

        # Attempt sign without step-up token (Forbidden)
        resp_no_token = client.post(f'/api/qds/requests/{req.id}/sign/', {})
        self.assertEqual(resp_no_token.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt sign with valid step-up token (Allowed)
        step_up = StepUpToken.objects.create(user=self.signer_a)
        resp_with_token = client.post(
            f'/api/qds/requests/{req.id}/sign/',
            {},
            HTTP_X_STEP_UP_TOKEN=str(step_up.token)
        )
        self.assertEqual(resp_with_token.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_with_token.data['status'], 'success')
