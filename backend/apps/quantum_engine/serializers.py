from rest_framework import serializers
from .models import QuantumExecutionLog

class QuantumExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuantumExecutionLog
        fields = '__all__'

class RunTeleportationRequestSerializer(serializers.Serializer):
    input_state_symbol = serializers.ChoiceField(
        choices=['|0>', '|1>', '|+>', '|->', '|+i>', '|-i>'],
        default='|+>'
    )
    bell_state_type = serializers.ChoiceField(
        choices=['PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS'],
        default='PHI_PLUS'
    )
    shots = serializers.IntegerField(default=1024, min_value=100, max_value=10000)
    channel_noise = serializers.FloatField(default=0.0, min_value=0.0, max_value=1.0)
    bsm_tamper = serializers.BooleanField(default=False)
    forgery = serializers.BooleanField(default=False)
    fake_state = serializers.ChoiceField(
        choices=['|0>', '|1>', '|+>', '|->', '|+i>', '|-i>'],
        default='|1>'
    )
