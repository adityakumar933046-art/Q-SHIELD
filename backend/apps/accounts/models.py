import uuid
import hashlib
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN', 'Organization Admin'
        SECURITY_ANALYST = 'SECURITY_ANALYST', 'Security Analyst'
        SIGNER = 'SIGNER', 'Signer'
        VERIFIER = 'VERIFIER', 'Verifier'
        ADMIN = 'ADMIN', 'Administrator'  # Legacy alias for backwards compatibility

    class AccountStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        LOCKED = 'LOCKED', 'Locked Out'
        DISABLED = 'DISABLED', 'Disabled'

    role = models.CharField(max_length=30, choices=Role.choices, default=Role.SIGNER)
    status = models.CharField(max_length=20, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    department = models.CharField(max_length=100, blank=True, default='')
    failed_login_attempts = models.IntegerField(default=0)
    lockout_until = models.DateTimeField(null=True, blank=True)
    mfa_secret = models.CharField(max_length=64, blank=True, default='')
    is_mfa_enabled = models.BooleanField(default=False)
    mfa_disabled_at = models.DateTimeField(null=True, blank=True)
    reset_password_token = models.CharField(max_length=128, blank=True, default='')
    reset_password_token_expires = models.DateTimeField(null=True, blank=True)
    last_password_change = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def requires_mfa(self):
        return bool(self.is_mfa_enabled and self.mfa_secret)

    @property
    def is_account_locked(self):
        if self.status == self.AccountStatus.LOCKED or (self.lockout_until and timezone.now() < self.lockout_until):
            return True
        return False

    @property
    def is_usable_account(self):
        return self.is_active and self.status == self.AccountStatus.ACTIVE and not self.is_account_locked

    def __str__(self):
        return f"{self.username} ({self.role})"


class MfaChallenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mfa_challenges')
    challenge_token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class MfaRecoveryCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recovery_codes')
    code_hash = models.CharField(max_length=128)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def hash_code(cls, raw_code):
        return hashlib.sha256(raw_code.strip().upper().encode('utf-8')).hexdigest()

    def check_code(self, raw_code):
        return self.code_hash == self.hash_code(raw_code)


class StepUpToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='step_up_tokens')
    token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    refresh_token_jti = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    device_type = models.CharField(max_length=50, default='Desktop')
    browser = models.CharField(max_length=50, default='Unknown')
    os = models.CharField(max_length=50, default='Unknown')
    location_hint = models.CharField(max_length=100, blank=True, default='Local Subnet')
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.CharField(max_length=100, blank=True, default='')
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.refresh_token_jti[:8]} - {self.user.username} ({self.browser} on {self.os})"
