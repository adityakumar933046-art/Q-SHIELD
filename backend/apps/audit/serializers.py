from rest_framework import serializers
from .models import AuditTrailRecord

class AuditTrailRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditTrailRecord
        fields = '__all__'
