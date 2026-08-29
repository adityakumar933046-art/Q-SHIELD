from django.db import models

class ThresholdRule(models.Model):
    rule_name = models.CharField(max_length=100, unique=True)
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('QBER', 'Quantum Bit Error Rate'),
            ('FIDELITY', 'Quantum State Fidelity'),
            ('CHI_SQUARE_P', 'Chi-Square p-value'),
            ('FORGERY_PROB', 'Forgery Probability'),
            ('TRACE_DIST', 'Trace Distance')
        ]
    )
    operator = models.CharField(
        max_length=10,
        choices=[('>', 'Greater Than'), ('<', 'Less Than'), ('>=', 'Greater/Equal'), ('<=', 'Less/Equal')]
    )
    threshold_value = models.FloatField()
    severity = models.CharField(
        max_length=20,
        choices=[('CRITICAL', 'Critical'), ('HIGH', 'High'), ('MEDIUM', 'Medium'), ('LOW', 'Low')],
        default='HIGH'
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rule_name} ({self.metric_type} {self.operator} {self.threshold_value})"


class ThreatEvaluationLog(models.Model):
    evaluation_id = models.CharField(max_length=64, unique=True)
    execution_id = models.CharField(max_length=64, blank=True, default='')
    threat_detected = models.BooleanField(default=False)
    threat_category = models.CharField(max_length=100, blank=True, default='NONE')
    severity = models.CharField(max_length=20, default='INFO')
    rule_triggered = models.CharField(max_length=100, blank=True, default='')
    
    qber_measured = models.FloatField(default=0.0)
    fidelity_measured = models.FloatField(default=1.0)
    forgery_probability = models.FloatField(default=0.0)
    chi_square_pvalue = models.FloatField(default=1.0)
    
    explanation = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ThreatEval {self.evaluation_id} - Detected={self.threat_detected} ({self.threat_category})"
