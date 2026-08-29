from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.organizations.models import Organization
from apps.audit.models import AuditTrailRecord

User = get_user_model()

class AuthenticationAndRBACTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org_a = Organization.objects.create(name="Org Alpha", domain="alpha.gov")
        self.org_b = Organization.objects.create(name="Org Beta", domain="beta.gov")
        
        self.admin = User.objects.create_user(
            username="test_admin",
            password="AdminPassword123!",
            role=User.Role.ADMIN,
            organization=self.org_a
        )
        self.signer = User.objects.create_user(
            username="test_signer",
            password="SignerPassword123!",
            role=User.Role.SIGNER,
            organization=self.org_a
        )
        self.analyst = User.objects.create_user(
            username="test_analyst",
            password="AnalystPassword123!",
            role=User.Role.SECURITY_ANALYST,
            organization=self.org_a
        )
        self.disabled_user = User.objects.create_user(
            username="disabled_user",
            password="DisabledPassword123!",
            role=User.Role.SIGNER,
            organization=self.org_a,
            is_active=False
        )

    def test_login_valid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'test_admin',
            'password': 'AdminPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_password(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'test_admin',
            'password': 'WrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unknown_user(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'nonexistent_user',
            'password': 'SomePassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_disabled_user(self):
        """Disabled/deactivated user cannot authenticate."""
        response = self.client.post('/api/auth/login/', {
            'username': 'disabled_user',
            'password': 'DisabledPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_public_registration_blocks_privileged_roles(self):
        """Public self-registration must NOT allow creating ADMIN or SECURITY_ANALYST roles."""
        resp_admin = self.client.post('/api/auth/register/', {
            'username': 'hacker_admin',
            'password': 'HackerPassword123!',
            'role': 'ADMIN'
        })
        self.assertEqual(resp_admin.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Public self-registration cannot request privileged roles', str(resp_admin.data))

        resp_analyst = self.client.post('/api/auth/register/', {
            'username': 'hacker_analyst',
            'password': 'HackerPassword123!',
            'role': 'SECURITY_ANALYST'
        })
        self.assertEqual(resp_analyst.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_registration_allows_normal_roles(self):
        """Public self-registration allows creating SIGNER or VERIFIER roles."""
        resp = self.client.post('/api/auth/register/', {
            'username': 'new_verifier',
            'password': 'VerifierPassword123!',
            'role': 'VERIFIER'
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['role'], 'VERIFIER')

    def test_missing_and_invalid_jwt_access(self):
        """API endpoints reject unauthenticated or invalid JWT requests with 401."""
        resp_missing = self.client.get('/api/auth/me/')
        self.assertEqual(resp_missing.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='Bearer INVALID_TOKEN_123')
        resp_invalid = self.client.get('/api/auth/me/')
        self.assertEqual(resp_invalid.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_admin_api_access(self):
        """Non-Admin user attempting Admin API receives HTTP 403 Forbidden."""
        self.client.force_authenticate(user=self.signer)
        resp = self.client.post('/api/threats/rules/', {
            'rule_name': 'Malicious Rule',
            'metric': 'QBER',
            'threshold_value': 0.99
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_and_refresh_token_revocation(self):
        """Logout endpoint blacklists the refresh token."""
        refresh = RefreshToken.for_user(self.signer)
        self.client.force_authenticate(user=self.signer)
        
        logout_resp = self.client.post('/api/auth/logout/', {'refresh': str(refresh)})
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)

        refresh_resp = self.client.post('/api/auth/refresh/', {'refresh': str(refresh)})
        self.assertEqual(refresh_resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_list_organization_scoping(self):
        """Non-Admin users only see members of their own organization."""
        other_user = User.objects.create_user(
            username="other_org_user",
            password="OtherPassword123!",
            role=User.Role.SIGNER,
            organization=self.org_b
        )
        self.client.force_authenticate(user=self.signer)
        resp = self.client.get('/api/auth/users/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        user_ids = [u['id'] for u in resp.data]
        self.assertIn(self.signer.id, user_ids)
        self.assertNotIn(other_user.id, user_ids)

    # --- ADMIN USER MANAGEMENT TESTS ---

    def test_admin_creates_signer_user(self):
        """Admin can create a SIGNER user."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'new_signer',
            'password': 'NewSignerPassword123!',
            'confirm_password': 'NewSignerPassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id,
            'first_name': 'Alice',
            'last_name': 'Signer'
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['username'], 'new_signer')
        self.assertEqual(resp.data['role'], 'SIGNER')
        self.assertNotIn('password', resp.data)

    def test_admin_creates_verifier_user(self):
        """Admin can create a VERIFIER user."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'new_verifier_user',
            'password': 'NewVerifierPassword123!',
            'confirm_password': 'NewVerifierPassword123!',
            'role': 'VERIFIER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['role'], 'VERIFIER')

    def test_admin_creates_security_analyst_user(self):
        """Admin can create a SECURITY_ANALYST user."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'new_analyst_user',
            'password': 'NewAnalystPassword123!',
            'confirm_password': 'NewAnalystPassword123!',
            'role': 'SECURITY_ANALYST',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['role'], 'SECURITY_ANALYST')

    def test_admin_creates_admin_user(self):
        """Admin can create another ADMIN user."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'second_admin',
            'password': 'SecondAdminPassword123!',
            'confirm_password': 'SecondAdminPassword123!',
            'role': 'ADMIN',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['role'], 'ADMIN')

    def test_non_admin_cannot_create_user(self):
        """Non-Admin (SIGNER) receives 403 Forbidden when attempting to create a user."""
        self.client.force_authenticate(user=self.signer)
        resp = self.client.post('/api/auth/users/', {
            'username': 'hacker_user',
            'password': 'HackerPassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_user(self):
        """Unauthenticated user receives 401 Unauthorized when attempting to create a user."""
        resp = self.client.post('/api/auth/users/', {
            'username': 'anon_user',
            'password': 'AnonPassword123!',
            'role': 'SIGNER'
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_username_rejected(self):
        """Creating a user with an existing username returns 400 Bad Request."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'test_signer',
            'password': 'DuplicatePassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', str(resp.data))

    def test_password_mismatch_rejected(self):
        """Password and confirm_password mismatch returns 400 Bad Request."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'mismatch_user',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', str(resp.data))

    def test_password_is_hashed_and_never_returned(self):
        """Passwords are stored using Django set_password() and never returned in API payloads."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'hashed_user',
            'password': 'HashedPassword123!',
            'confirm_password': 'HashedPassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('password', resp.data)
        self.assertNotIn('confirm_password', resp.data)

        created_user = User.objects.get(username='hashed_user')
        self.assertTrue(created_user.check_password('HashedPassword123!'))
        self.assertTrue(created_user.password.startswith('pbkdf2_sha256'))

    def test_admin_cannot_deactivate_last_active_admin(self):
        """Admin cannot deactivate or delete the last remaining active Admin account."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(f'/api/auth/users/{self.admin.id}/', {
            'is_active': False
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot deactivate your own active Admin account', str(resp.data))

    def test_user_creation_audit_event_logged(self):
        """User creation generates a USER_CREATED audit trail record without sensitive passwords."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post('/api/auth/users/', {
            'username': 'audited_user',
            'password': 'AuditedPassword123!',
            'confirm_password': 'AuditedPassword123!',
            'role': 'SIGNER',
            'organization': self.org_a.id
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        audit_log = AuditTrailRecord.objects.filter(action_type='USER_CREATED', target_resource='USER:audited_user').first()
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.user_identifier, self.admin.username)
        self.assertNotIn('password', str(audit_log.details))
        self.assertNotIn('AuditedPassword123!', str(audit_log.details))
