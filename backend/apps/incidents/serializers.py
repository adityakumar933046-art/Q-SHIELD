from rest_framework import serializers
from .models import SecurityIncident

class SecurityIncidentSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = SecurityIncident
        fields = '__all__'
