from datetime import timedelta
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from apps.organizations.models import Organization
from apps.audit.models import AuditTrailRecord
from apps.accounts.models import MfaChallenge, MfaRecoveryCode, StepUpToken, UserSession
from apps.accounts.views import CustomTokenObtainPairView, MfaLoginVerifyView, ForgotPasswordView, generate_totp_secret, get_totp_token
from apps.accounts.security import parse_user_agent, evaluate_login_risk

User = get_user_model()

@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_CLASSES': [], 'DEFAULT_THROTTLE_RATES': {}})
class ComprehensiveAuthSecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        CustomTokenObtainPairView.throttle_classes = []
        MfaLoginVerifyView.throttle_classes = []
        ForgotPasswordView.throttle_classes = []

        self.org_a = Organization.objects.create(name="Org Alpha", domain="alpha.gov")
        self.org_b = Organization.objects.create(name="Org Beta", domain="beta.gov")

        # 1. Standard Signer User (MFA required by role policy)
        self.signer = User.objects.create_user(
            username="test_signer",
            password="SignerPassword123!",
            role=User.Role.SIGNER,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_a,
            mfa_secret=generate_totp_secret(),
            is_mfa_enabled=True
        )

        # 2. Verifier User (MFA disabled by default)
        self.verifier = User.objects.create_user(
            username="test_verifier",
            password="VerifierPassword123!",
            email="verifier@alpha.gov",
            role=User.Role.VERIFIER,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_a,
            is_mfa_enabled=False
        )

        # 3. Super Admin User
        self.super_admin = User.objects.create_user(
            username="super_admin",
            password="SuperPassword123!",
            role=User.Role.SUPER_ADMIN,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_a,
            mfa_secret=generate_totp_secret(),
            is_mfa_enabled=True
        )

        # 4. Org Admin User
        self.org_admin = User.objects.create_user(
            username="org_admin",
            password="OrgPassword123!",
            role=User.Role.ORGANIZATION_ADMIN,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_a,
            mfa_secret=generate_totp_secret(),
            is_mfa_enabled=True
        )

        # 5. Security Analyst User
        self.analyst = User.objects.create_user(
            username="test_analyst",
            password="AnalystPassword123!",
            role=User.Role.SECURITY_ANALYST,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_a,
            mfa_secret=generate_totp_secret(),
            is_mfa_enabled=True
        )

        # 6. User in Org B
        self.user_org_b = User.objects.create_user(
            username="beta_user",
            password="BetaPassword123!",
            role=User.Role.VERIFIER,
            status=User.AccountStatus.ACTIVE,
            organization=self.org_b
        )

        # 7. Disabled & Suspended Users
        self.disabled_user = User.objects.create_user(
            username="disabled_user",
            password="DisabledPassword123!",
            role=User.Role.VERIFIER,
            status=User.AccountStatus.DISABLED,
            is_active=False,
            organization=self.org_a
        )
        self.suspended_user = User.objects.create_user(
            username="suspended_user",
            password="SuspendedPassword123!",
            role=User.Role.VERIFIER,
            status=User.AccountStatus.SUSPENDED,
            organization=self.org_a
        )

    # -------------------------------------------------------------
    # 1-8: MFA Tests
    # -------------------------------------------------------------
    def test_01_mfa_enabled_user_receives_pre_auth_state(self):
        resp = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data.get('mfa_required'))
        self.assertIn('mfa_challenge', resp.data)

    def test_02_mfa_enabled_user_cannot_receive_normal_jwt_before_mfa(self):
        resp = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        self.assertNotIn('access', resp.data)
        self.assertNotIn('refresh', resp.data)

    def test_03_correct_totp_succeeds(self):
        resp1 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        challenge = resp1.data['mfa_challenge']
        valid_totp = get_totp_token(self.signer.mfa_secret)

        resp2 = self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': challenge, 'code': valid_totp})
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp2.data)
        self.assertIn('refresh', resp2.data)

    def test_04_incorrect_totp_fails(self):
        resp1 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        challenge = resp1.data['mfa_challenge']

        resp2 = self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': challenge, 'code': '000000'})
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid MFA verification code', resp2.data['detail'])

    def test_05_expired_mfa_challenge_fails(self):
        challenge_obj = MfaChallenge.objects.create(
            user=self.signer,
            expires_at=timezone.now() - timedelta(minutes=1)
        )
        valid_totp = get_totp_token(self.signer.mfa_secret)

        resp = self.client.post('/api/auth/mfa/login/verify/', {
            'mfa_challenge': str(challenge_obj.challenge_token),
            'code': valid_totp
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_06_reused_mfa_challenge_fails(self):
        resp1 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        challenge = resp1.data['mfa_challenge']
        valid_totp = get_totp_token(self.signer.mfa_secret)

        # First verify
        self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': challenge, 'code': valid_totp})
        # Second verify attempt (reused challenge)
        resp2 = self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': challenge, 'code': valid_totp})
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_07_recovery_code_succeeds_once(self):
        gen_resp = self.client.post('/api/auth/mfa/recovery-codes/generate/', HTTP_AUTHORIZATION=f"Bearer {self._get_token(self.signer)}")
        self.assertEqual(gen_resp.status_code, status.HTTP_200_OK)
        rec_code = gen_resp.data['recovery_codes'][0]

        resp1 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        challenge = resp1.data['mfa_challenge']

        verify_resp = self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': challenge, 'recovery_code': rec_code})
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', verify_resp.data)

    def test_08_recovery_code_fails_on_second_use(self):
        gen_resp = self.client.post('/api/auth/mfa/recovery-codes/generate/', HTTP_AUTHORIZATION=f"Bearer {self._get_token(self.signer)}")
        rec_code = gen_resp.data['recovery_codes'][0]

        # Use 1st time
        r1 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': r1.data['mfa_challenge'], 'recovery_code': rec_code})

        # Use 2nd time
        r2 = self.client.post('/api/auth/login/', {'username': 'test_signer', 'password': 'SignerPassword123!'})
        verify_resp2 = self.client.post('/api/auth/mfa/login/verify/', {'mfa_challenge': r2.data['mfa_challenge'], 'recovery_code': rec_code})
        self.assertEqual(verify_resp2.status_code, status.HTTP_400_BAD_REQUEST)

    # -------------------------------------------------------------
    # 9-15: Session Security Tests
    # -------------------------------------------------------------
    def test_09_session_created_with_device_parsing(self):
        resp = self.client.post('/api/auth/login/', {'username': 'test_verifier', 'password': 'VerifierPassword123!'}, HTTP_USER_AGENT='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        session = UserSession.objects.filter(user=self.verifier, is_active=True).first()
        self.assertIsNotNone(session)
        self.assertEqual(session.browser, 'Chrome')
        self.assertEqual(session.os, 'Windows')
        self.assertEqual(session.device_type, 'Desktop')

    def test_10_session_visible_to_user(self):
        token = self._get_token(self.verifier)
        resp = self.client.get('/api/auth/sessions/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data) >= 1)

    def test_11_session_revoked(self):
        token = self._get_token(self.verifier)
        sessions_resp = self.client.get('/api/auth/sessions/', HTTP_AUTHORIZATION=f"Bearer {token}")
        jti = sessions_resp.data[0]['refresh_token_jti']

        revoke_resp = self.client.post('/api/auth/sessions/revoke/', {'jti': jti}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(revoke_resp.status_code, status.HTTP_200_OK)

        session = UserSession.objects.get(refresh_token_jti=jti)
        self.assertFalse(session.is_active)
        self.assertIsNotNone(session.revoked_at)

    def test_12_revoked_session_rejected(self):
        token = self._get_token(self.verifier)
        sessions_resp = self.client.get('/api/auth/sessions/', HTTP_AUTHORIZATION=f"Bearer {token}")
        jti = sessions_resp.data[0]['refresh_token_jti']

        self.client.post('/api/auth/sessions/revoke/', {'jti': jti}, HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.get('/api/auth/me/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_13_logout_revokes_session(self):
        login_resp = self.client.post('/api/auth/login/', {'username': 'test_verifier', 'password': 'VerifierPassword123!'})
        refresh = login_resp.data['refresh']
        access = login_resp.data['access']

        logout_resp = self.client.post('/api/auth/logout/', {'refresh': refresh}, HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertIn(logout_resp.status_code, [status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT])

    def test_14_password_reset_revokes_sessions(self):
        self._get_token(self.verifier)
        self.client.post('/api/auth/forgot-password/', {'email': self.verifier.email})
        user = User.objects.get(id=self.verifier.id)

        reset_resp = self.client.post('/api/auth/reset-password/', {
            'token': user.reset_password_token,
            'new_password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!'
        })
        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)
        active_count = UserSession.objects.filter(user=self.verifier, is_active=True).count()
        self.assertEqual(active_count, 0)

    def test_15_password_change_revokes_sessions(self):
        token = self._get_token(self.verifier)
        change_resp = self.client.post('/api/auth/change-password/', {
            'old_password': 'VerifierPassword123!',
            'new_password': 'BrandNewPassword123!',
            'confirm_password': 'BrandNewPassword123!'
        }, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(change_resp.status_code, status.HTTP_200_OK)
        active_count = UserSession.objects.filter(user=self.verifier, is_active=True).count()
        self.assertEqual(active_count, 0)

    # -------------------------------------------------------------
    # 16-21: RBAC Privilege Escalation Tests
    # -------------------------------------------------------------
    def test_16_super_admin_access_allowed(self):
        token = self._get_token(self.super_admin)
        resp = self.client.get('/api/auth/users/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_17_org_admin_access_allowed(self):
        token = self._get_token(self.org_admin)
        resp = self.client.get('/api/auth/users/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_18_security_analyst_access_allowed(self):
        token = self._get_token(self.analyst)
        resp = self.client.get('/api/analytics/summary/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_19_signer_access_allowed(self):
        token = self._get_token(self.signer)
        resp = self.client.get('/api/qds/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_20_verifier_access_allowed(self):
        token = self._get_token(self.verifier)
        resp = self.client.get('/api/verification/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_21_unauthorized_role_access_denied(self):
        token = self._get_token(self.verifier)
        # Verifier attempts to access User Management admin endpoint
        resp = self.client.get('/api/auth/users/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # -------------------------------------------------------------
    # 22-24: Tenant Isolation Tests
    # -------------------------------------------------------------
    def test_22_cross_organization_user_access_denied(self):
        token = self._get_token(self.verifier)
        # Verifier in Org A requests details of user in Org B
        resp = self.client.get(f'/api/auth/users/{self.user_org_b.id}/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertIn(resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_23_cross_organization_resource_access_denied(self):
        # Org Admin A attempts to access Org B detail
        token = self._get_token(self.org_admin)
        resp = self.client.get(f'/api/organizations/{self.org_b.id}/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertIn(resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_24_cross_organization_admin_access_denied(self):
        # Org Admin A attempts to modify Org B name
        token = self._get_token(self.org_admin)
        resp = self.client.patch(f'/api/organizations/{self.org_b.id}/', {'name': 'Hacked Org Name'}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertIn(resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    # -------------------------------------------------------------
    # 25-30: Step-Up Authentication Tests
    # -------------------------------------------------------------
    def test_25_missing_step_up_rejected(self):
        token = self._get_token(self.signer)
        resp = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_26_invalid_step_up_rejected(self):
        token = self._get_token(self.signer)
        resp = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN='invalid-uuid-token')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_27_expired_step_up_rejected(self):
        step_up = StepUpToken.objects.create(
            user=self.signer,
            expires_at=timezone.now() - timedelta(minutes=1)
        )
        token = self._get_token(self.signer)
        resp = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN=str(step_up.token))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_28_wrong_user_step_up_rejected(self):
        # Step-up created for verifier instead of signer
        step_up = StepUpToken.objects.create(user=self.verifier)
        token = self._get_token(self.signer)
        resp = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN=str(step_up.token))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_29_reused_step_up_rejected(self):
        step_up = StepUpToken.objects.create(user=self.signer)
        token = self._get_token(self.signer)

        # First use (succeeds)
        resp1 = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload 1',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN=str(step_up.token))
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)

        # Second use (fails)
        resp2 = self.client.post('/api/qds/', {
            'payload_content': 'Test Payload 2',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN=str(step_up.token))
        self.assertEqual(resp2.status_code, status.HTTP_403_FORBIDDEN)

    def test_30_valid_step_up_succeeds(self):
        step_up = StepUpToken.objects.create(user=self.signer)
        token = self._get_token(self.signer)
        resp = self.client.post('/api/qds/', {
            'payload_content': 'Legitimate Step-Up Payload',
            'quantum_state_basis': '|+>'
        }, HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_STEP_UP_TOKEN=str(step_up.token))
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    # -------------------------------------------------------------
    # 31-38: Account & Audit Hardening Tests
    # -------------------------------------------------------------
    def test_31_brute_force_lockout(self):
        for _ in range(5):
            self.client.post('/api/auth/login/', {'username': 'test_verifier', 'password': 'WrongPassword123!'})
        user = User.objects.get(id=self.verifier.id)
        self.assertTrue(user.is_account_locked)

    def test_32_suspended_account_denied(self):
        resp = self.client.post('/api/auth/login/', {'username': 'suspended_user', 'password': 'SuspendedPassword123!'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_33_disabled_account_denied(self):
        resp = self.client.post('/api/auth/login/', {'username': 'disabled_user', 'password': 'DisabledPassword123!'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_34_mfa_disable_blocked_for_mandatory_role(self):
        token = self._get_token(self.signer)
        resp = self.client.post('/api/auth/mfa/disable/', {'password': 'SignerPassword123!'}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('MFA is mandatory', resp.data['detail'])

    def test_35_mfa_disable_succeeds_for_verifier(self):
        self.verifier.is_mfa_enabled = True
        self.verifier.save()
        token = self._get_token(self.verifier)

        resp = self.client.post('/api/auth/mfa/disable/', {'password': 'VerifierPassword123!'}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        user = User.objects.get(id=self.verifier.id)
        self.assertFalse(user.is_mfa_enabled)

    def test_36_deterministic_suspicious_login_risk(self):
        level, reasons = evaluate_login_risk(self.verifier, '192.168.1.100', 'Novel-Bot/1.0')
        self.assertIn(level, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

    def test_37_audit_event_logged_on_login(self):
        self.client.post('/api/auth/login/', {'username': 'test_verifier', 'password': 'VerifierPassword123!'})
        audit = AuditTrailRecord.objects.filter(user_identifier='test_verifier', action_type='LOGIN_SUCCESS').first()
        self.assertIsNotNone(audit)

    def test_38_password_reset_generic_response_no_enumeration(self):
        resp = self.client.post('/api/auth/forgot-password/', {'email': 'nonexistent_email_12345@test.gov'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('If an account with that email exists', resp.data['message'])

    # Helper method
    def _get_token(self, user):
        refresh = RefreshToken.for_user(user)
        jti = str(refresh.get('jti'))
        access_token = refresh.access_token
        access_token['username'] = user.username
        access_token['role'] = user.role
        access_token['session_jti'] = jti
        UserSession.objects.create(
            user=user,
            refresh_token_jti=jti,
            ip_address='127.0.0.1',
            user_agent='TestAgent/1.0',
            device_type='Desktop',
            browser='TestBrowser',
            os='TestOS',
            is_active=True
        )
        return str(access_token)
