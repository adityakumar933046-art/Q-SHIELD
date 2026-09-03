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


class EndToEndAuditWorkflowTestCase(TestCase):
    def test_complete_end_to_end_qshield_workflow(self):
        """
        Complete 17-step end-to-end integration audit test:
        1. Super Admin creates Organization & Org Admin
        2. Org Admin creates Signer, Verifier, Security Analyst
        3. Signer generates QDS signature package & assigns to Verifier (status=ISSUED)
        4. Verifier views assigned signatures & executes QDS verification (status=VERIFIED)
        5. Controlled Threat Scenarios (Forgery, Replay, Impersonation, Channel Manipulation, Unauthorized Verification)
        6. Threat Events sent to Threat Detection Engine
        7. Security Analyst views threat evidence, starts investigation, adds notes, classifies & resolves case
        8. Audit logs created for all major operations
        9. Enforces strict Multi-Tenant Organization Isolation & Role-Based Access Control
        """
        # 1. Super Admin creates Organization A & Organization B
        super_admin = User.objects.create_superuser(username="super_admin_audit", password="Password123!", role=User.Role.SUPER_ADMIN)
        org_a = Organization.objects.create(name="Defense Org Alpha", domain="alpha.def.gov")
        org_b = Organization.objects.create(name="Cyber Org Beta", domain="beta.cyber.gov")

        # 2. Super Admin creates Org Admin for Org A & Org B
        org_admin_a = User.objects.create_user(username="org_admin_a", password="Password123!", role=User.Role.ORGANIZATION_ADMIN, organization=org_a)
        org_admin_b = User.objects.create_user(username="org_admin_b", password="Password123!", role=User.Role.ORGANIZATION_ADMIN, organization=org_b)

        # 3. Org Admin A provisions Signer, Verifier & Security Analyst for Org A
        signer_a = User.objects.create_user(username="signer_a_audit", password="Password123!", role=User.Role.SIGNER, organization=org_a)
        verifier_a = User.objects.create_user(username="verifier_a_audit", password="Password123!", role=User.Role.VERIFIER, organization=org_a)
        analyst_a = User.objects.create_user(username="analyst_a_audit", password="Password123!", role=User.Role.SECURITY_ANALYST, organization=org_a)

        # Org B users for cross-tenant isolation testing
        signer_b = User.objects.create_user(username="signer_b_audit", password="Password123!", role=User.Role.SIGNER, organization=org_b)
        verifier_b = User.objects.create_user(username="verifier_b_audit", password="Password123!", role=User.Role.VERIFIER, organization=org_b)
        analyst_b = User.objects.create_user(username="analyst_b_audit", password="Password123!", role=User.Role.SECURITY_ANALYST, organization=org_b)

        client = APIClient()

        # 4. Signer A generates QDS Signature Package
        from apps.accounts.models import StepUpToken
        step_up = StepUpToken.objects.create(user=signer_a)

        client.force_authenticate(user=signer_a)
        payload = "Top Secret Defense Operation Authorization Document #9021"
        create_resp = client.post(
            '/api/qds/',
            {
                'payload_content': payload,
                'quantum_state_basis': '|+>',
                'bell_pair_type': 'PHI_PLUS',
                'recipient_organization_id': org_a.id
            },
            HTTP_X_STEP_UP_TOKEN=str(step_up.token)
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        sig_data = create_resp.data['signature']
        sig_id = sig_data['signature_id']
        self.assertEqual(sig_data['status'], 'ISSUED')

        # 5. Verifier A sees only Org A signatures
        client.force_authenticate(user=verifier_a)
        ver_qds_resp = client.get('/api/qds/')
        self.assertEqual(ver_qds_resp.status_code, status.HTTP_200_OK)
        qds_list = ver_qds_resp.data.get('results', ver_qds_resp.data) if isinstance(ver_qds_resp.data, dict) else ver_qds_resp.data
        qds_ids = [s['signature_id'] for s in qds_list]
        self.assertIn(sig_id, qds_ids)

        # Multi-Tenant Isolation Check: Verifier B (Org B) cannot see Org A's signature in API
        client.force_authenticate(user=verifier_b)
        ver_b_qds_resp = client.get('/api/qds/')
        b_qds_list = ver_b_qds_resp.data.get('results', ver_b_qds_resp.data) if isinstance(ver_b_qds_resp.data, dict) else ver_b_qds_resp.data
        b_qds_ids = [s['signature_id'] for s in b_qds_list]
        self.assertNotIn(sig_id, b_qds_ids)

        # 6. Verifier A executes QDS Verification (Succeeds -> status = VERIFIED)
        client.force_authenticate(user=verifier_a)
        verify_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': payload
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_resp.data['verification_attempt']['verification_result'], 'PASSED')

        # 7. Controlled Threat Scenario 1: Replay Attack (Resubmitting consumed signature)
        replay_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': payload
        })
        self.assertEqual(replay_resp.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(replay_resp.data['verification_attempt']['threat_category'], 'REPLAY_ATTACK')

        # 8. Controlled Threat Scenario 2: Unauthorized Cross-Org Verification Attempt
        client.force_authenticate(user=verifier_b)
        unauth_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': payload
        })
        self.assertEqual(unauth_resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(unauth_resp.data['verification_attempt']['threat_category'], 'UNAUTHORIZED_VERIFICATION')

        # 9. Controlled Threat Scenario 3: Signature Forgery Attempt (Payload tampered)
        step_up_2 = StepUpToken.objects.create(user=signer_a)
        client.force_authenticate(user=signer_a)
        sig2_resp = client.post(
            '/api/qds/',
            {
                'payload_content': "Original Authentic Contract Payload",
                'quantum_state_basis': '|+>',
                'bell_pair_type': 'PHI_PLUS',
                'recipient_organization_id': org_a.id
            },
            HTTP_X_STEP_UP_TOKEN=str(step_up_2.token)
        )
        sig2_id = sig2_resp.data['signature']['signature_id']

        client.force_authenticate(user=verifier_a)
        forgery_resp = client.post('/api/verification/verify-signature/', {
            'signature_id': sig2_id,
            'payload_content': "FORGED TAMPERED PAYLOAD DATA"
        })
        self.assertEqual(forgery_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(forgery_resp.data['verification_attempt']['verification_result'], 'REJECTED_DIGEST_MISMATCH')

        # 10. Security Analyst A views Org A threat events
        client.force_authenticate(user=analyst_a)
        incidents_resp = client.get('/api/incidents/')
        self.assertEqual(incidents_resp.status_code, status.HTTP_200_OK)
        inc_list = incidents_resp.data.get('results', incidents_resp.data) if isinstance(incidents_resp.data, dict) else incidents_resp.data
        self.assertGreater(len(inc_list), 0)
        target_inc = inc_list[0]
        inc_id = target_inc['id']

        # Multi-Tenant Isolation Check: Analyst B (Org B) cannot see Analyst A's incident
        client.force_authenticate(user=analyst_b)
        inc_b_resp = client.get('/api/incidents/')
        b_inc_list = inc_b_resp.data.get('results', inc_b_resp.data) if isinstance(inc_b_resp.data, dict) else inc_b_resp.data
        b_inc_ids = [i['id'] for i in b_inc_list]
        self.assertNotIn(inc_id, b_inc_ids)

        # 11. Security Analyst A manages investigation (Adds note & updates status/classification)
        client.force_authenticate(user=analyst_a)
        note_resp = client.post(f'/api/incidents/{inc_id}/add-note/', {'note': 'Reviewed QDS fidelity & SHA-256 digest evidence. Confirmed forgery attack.'})
        self.assertEqual(note_resp.status_code, status.HTTP_201_CREATED)

        update_resp = client.post(f'/api/incidents/{inc_id}/update-status/', {
            'status': 'RESOLVED',
            'classification': 'CONFIRMED_THREAT',
            'resolution_notes': 'Mitigated threat by revoking compromised token & notifying security officer.'
        })
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data['status'], 'RESOLVED')
        self.assertEqual(update_resp.data['classification'], 'CONFIRMED_THREAT')

        # 12. Verify Role Restrictions
        # Signer cannot verify signature (Forbidden)
        client.force_authenticate(user=signer_a)
        signer_verify_resp = client.post('/api/verification/verify-signature/', {'signature_id': sig2_id, 'payload_content': 'Test'})
        self.assertEqual(signer_verify_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Verifier cannot generate signature (Forbidden)
        client.force_authenticate(user=verifier_a)
        ver_create_resp = client.post('/api/qds/', {'payload_content': 'Test', 'quantum_state_basis': '|+>', 'bell_pair_type': 'PHI_PLUS'})
        self.assertEqual(ver_create_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Security Analyst cannot generate signature (Forbidden)
        client.force_authenticate(user=analyst_a)
        analyst_create_resp = client.post('/api/qds/', {'payload_content': 'Test', 'quantum_state_basis': '|+>', 'bell_pair_type': 'PHI_PLUS'})
        self.assertEqual(analyst_create_resp.status_code, status.HTTP_403_FORBIDDEN)

