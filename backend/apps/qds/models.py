import uuid
from django.db import models
from django.conf import settings

class QuantumDigitalSignature(models.Model):
    signature_id = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_signatures'
    )
    recipient_organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Message & Classical Integrity Layer
    message_payload = models.TextField(default='', blank=True, help_text="Canonical document payload message.")
    message_digest = models.CharField(max_length=64, help_text="SHA-256 integrity hash digest.")
    payload_summary = models.TextField(blank=True, default='')
    
    # Quantum Teleportation State Metadata
    quantum_state_basis = models.CharField(max_length=20, default='|+>')
    bell_pair_type = models.CharField(max_length=20, default='PHI_PLUS')
    quantum_execution_id = models.CharField(max_length=64, blank=True, default='')
    
    # Session, Nonce & Replay Prevention
    session_id = models.CharField(max_length=64, default=uuid.uuid4)
    nonce = models.CharField(max_length=64, default=uuid.uuid4, db_index=True, help_text="Freshness cryptographic nonce.")
    is_consumed = models.BooleanField(default=False, help_text="True if signature teleportation state has been verified/consumed.")
    consumed_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=[
            ('ISSUED', 'Issued'),
            ('VERIFIED', 'Verified Secure'),
            ('COMPROMISED', 'Threat Compromised'),
            ('EXPIRED', 'Expired')
        ],
        default='ISSUED'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"QDS {self.signature_id} ({self.status}) - Nonce: {self.nonce[:8]}..."
