from django.db import models
from django.conf import settings

class SecurityIncident(models.Model):
    incident_number = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=255)
    category = models.CharField(
        max_length=100,
        choices=[
            ('SIGNATURE_FORGERY', 'Signature Forgery'),
            ('SENDER_IMPERSONATION', 'Sender Impersonation'),
            ('REPLAY_ATTACK', 'Replay Attack'),
            ('QUANTUM_CHANNEL_MANIPULATION', 'Quantum Channel Manipulation'),
            ('UNAUTHORIZED_VERIFICATION', 'Unauthorized Verification'),
            ('QUANTUM_ANOMALY_BREACH', 'Quantum Anomaly Breach')
        ]
    )
    severity = models.CharField(
        max_length=20,
        choices=[('CRITICAL', 'Critical'), ('HIGH', 'High'), ('MEDIUM', 'Medium'), ('LOW', 'Low')],
        default='HIGH'
    )
    status = models.CharField(
        max_length=30,
        choices=[
            ('OPEN', 'Open'),
            ('INVESTIGATING', 'Under Investigation'),
            ('MITIGATED', 'Mitigated'),
            ('RESOLVED', 'Resolved'),
            ('FALSE_POSITIVE', 'False Positive')
        ],
        default='OPEN'
    )
    qber = models.FloatField(default=0.0)
    fidelity = models.FloatField(default=1.0)
    forgery_probability = models.FloatField(default=0.0)
    description = models.TextField()
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )
    resolution_notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.incident_number}: {self.title} [{self.severity}]"
