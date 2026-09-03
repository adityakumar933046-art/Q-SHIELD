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
            ('CONTAINED', 'Contained'),
            ('RESOLVED', 'Resolved'),
            ('FALSE_POSITIVE', 'False Positive'),
            ('CLOSED', 'Closed')
        ],
        default='OPEN'
    )
    classification = models.CharField(
        max_length=30,
        choices=[
            ('CONFIRMED_THREAT', 'Confirmed Threat'),
            ('FALSE_POSITIVE', 'False Positive'),
            ('INCONCLUSIVE', 'Inconclusive')
        ],
        default='INCONCLUSIVE'
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_incidents'
    )
    related_signature = models.ForeignKey(
        'qds.QuantumDigitalSignature',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_incidents'
    )
    source_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triggered_incidents'
    )
    detection_source = models.CharField(max_length=100, default='QDS Verification Engine')
    qber = models.FloatField(default=0.0)
    fidelity = models.FloatField(default=1.0)
    forgery_probability = models.FloatField(default=0.0)
    description = models.TextField()
    evidence_data = models.JSONField(default=dict, blank=True)
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


class InvestigationNote(models.Model):
    incident = models.ForeignKey(
        SecurityIncident,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.author} on {self.incident.incident_number}"
