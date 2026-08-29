from rest_framework import serializers
from .models import ThresholdRule, ThreatEvaluationLog

class ThresholdRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThresholdRule
        fields = '__all__'

class ThreatEvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatEvaluationLog
        fields = '__all__'

class EvaluateThreatRequestSerializer(serializers.Serializer):
    qber = serializers.FloatField(required=True, min_value=0.0, max_value=1.0)
    fidelity = serializers.FloatField(required=True, min_value=0.0, max_value=1.0)
    forgery_probability = serializers.FloatField(default=0.0)
    chi_square_pvalue = serializers.FloatField(default=1.0)
    execution_id = serializers.CharField(required=False, allow_blank=True, default='')
    attack_type = serializers.CharField(required=False, allow_blank=True, default='')
