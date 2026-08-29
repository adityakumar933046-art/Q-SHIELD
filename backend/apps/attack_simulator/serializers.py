from rest_framework import serializers
from .models import AttackSimulationRun

class AttackSimulationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttackSimulationRun
        fields = '__all__'

class RunAttackSimulationRequestSerializer(serializers.Serializer):
    attack_vector = serializers.ChoiceField(
        choices=['FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION']
    )
    intensity = serializers.FloatField(default=0.5, min_value=0.1, max_value=1.0)
    shots = serializers.IntegerField(default=1024, min_value=100, max_value=10000)
