from django.db import models
from django.conf import settings

class SignatureVerificationAttempt(models.Model):
    verification_id = models.CharField(max_length=64, unique=True)
    signature = models.ForeignKey(
        'qds.QuantumDigitalSignature',
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    verifier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    payload_provided = models.TextField()
    hash_match = models.BooleanField(default=True)
    
    quantum_fidelity = models.FloatField(default=1.0)
    qber = models.FloatField(default=0.0)
    forgery_probability = models.FloatField(default=0.0)
    
    threat_detected = models.BooleanField(default=False)
    threat_category = models.CharField(max_length=100, blank=True, default='NONE')
    verification_result = models.CharField(
        max_length=50,
        choices=[
            ('PASSED', 'Verification Passed'),
            ('REJECTED_DIGEST_MISMATCH', 'Rejected: Digest Mismatch'),
            ('REJECTED_QUANTUM_THREAT', 'Rejected: Quantum Threat Breach'),
            ('REJECTED_REPLAY_ATTACK', 'Rejected: Replay Attack Detected'),
            ('UNAUTHORIZED', 'Rejected: Unauthorized Attempt')
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verify {self.verification_id} - {self.verification_result}"
