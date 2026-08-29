from django.db import models

class StatisticalAnalysisRecord(models.Model):
    record_id = models.CharField(max_length=64, unique=True)
    execution_id = models.CharField(max_length=64, blank=True, default='')
    shots = models.IntegerField(default=1024)
    qber = models.FloatField(default=0.0)
    fidelity = models.FloatField(default=1.0)
    
    # Statistical tests
    chi_square_stat = models.FloatField(default=0.0)
    chi_square_pvalue = models.FloatField(default=1.0)
    degrees_of_freedom = models.IntegerField(default=1)
    is_hypothesis_rejected = models.BooleanField(default=False)
    
    forgery_probability = models.FloatField(default=0.0)
    sprt_log_likelihood = models.FloatField(default=0.0)
    sprt_decision = models.CharField(max_length=30, default='ACCEPT_HONEST')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"StatAnalysis {self.record_id} - QBER={self.qber:.4f}, Chi2_p={self.chi_square_pvalue:.4e}"
