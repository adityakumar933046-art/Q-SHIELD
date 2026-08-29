from django.db import models

class QuantumExecutionLog(models.Model):
    execution_id = models.CharField(max_length=64, unique=True)
    protocol_type = models.CharField(max_length=50, default='QDS_TELEPORTATION')
    shots = models.IntegerField(default=1024)
    qubit_count = models.IntegerField(default=3)
    input_state_basis = models.CharField(max_length=20, default='Z')
    input_state_symbol = models.CharField(max_length=10, default='|0>')
    bell_state_type = models.CharField(max_length=20, default='PHI_PLUS')
    
    # Results
    classical_bits = models.CharField(max_length=10, blank=True, default='')
    measurement_counts = models.JSONField(default=dict)
    statevector_real = models.JSONField(default=list)
    statevector_imag = models.JSONField(default=list)
    fidelity = models.FloatField(default=1.0)
    trace_distance = models.FloatField(default=0.0)
    
    # Attack injection parameters
    channel_noise_level = models.FloatField(default=0.0)
    is_attack_injected = models.BooleanField(default=False)
    attack_type = models.CharField(max_length=50, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"QuantumExec {self.execution_id} ({self.protocol_type}) - Fidelity={self.fidelity:.4f}"
