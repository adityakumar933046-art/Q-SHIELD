from django.db import models

class AuditTrailRecord(models.Model):
    action_type = models.CharField(max_length=100)
    user_identifier = models.CharField(max_length=150, default='SYSTEM')
    target_resource = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=50, default='SUCCESS')
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {self.action_type} by {self.user_identifier} ({self.status})"
