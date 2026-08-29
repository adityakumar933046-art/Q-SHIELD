from django.db import models

class AnalyticsSnapshot(models.Model):
    snapshot_time = models.DateTimeField(auto_now_add=True)
    total_signatures = models.IntegerField(default=0)
    total_verifications = models.IntegerField(default=0)
    total_incidents = models.IntegerField(default=0)
    avg_qber = models.FloatField(default=0.0)
    avg_fidelity = models.FloatField(default=1.0)
