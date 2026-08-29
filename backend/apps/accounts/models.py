from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        SIGNER = 'SIGNER', 'Signer'
        VERIFIER = 'VERIFIER', 'Verifier'
        SECURITY_ANALYST = 'SECURITY_ANALYST', 'Security Analyst'

    role = models.CharField(max_length=30, choices=Role.choices, default=Role.SIGNER)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    department = models.CharField(max_length=100, blank=True, default='')
    is_mfa_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
