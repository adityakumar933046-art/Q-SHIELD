from django.db import models

class AttackSimulationRun(models.Model):
    simulation_id = models.CharField(max_length=64, unique=True)
    attack_vector = models.CharField(
        max_length=50,
        choices=[
            ('FORGERY', 'Signature Forgery Attack'),
            ('IMPERSONATION', 'Sender Impersonation Attack'),
            ('REPLAY', 'Replay Attack'),
            ('CHANNEL_MANIPULATION', 'Quantum Channel Manipulation Attack'),
            ('UNAUTHORIZED_VERIFICATION', 'Unauthorized Verification Attempt')
        ]
    )
    intensity = models.FloatField(default=0.5)
    shots = models.IntegerField(default=1024)
    target_state = models.CharField(max_length=10, default='|+>')
    
    # Results
    qber_result = models.FloatField(default=0.0)
    fidelity_result = models.FloatField(default=1.0)
    forgery_probability = models.FloatField(default=0.0)
    is_detected = models.BooleanField(default=True)
    threat_category = models.CharField(max_length=100, default='NONE')
    incident_number = models.CharField(max_length=64, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AttackSim {self.simulation_id} [{self.attack_vector}] - Detected: {self.is_detected}"
