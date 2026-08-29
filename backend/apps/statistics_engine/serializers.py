from rest_framework import serializers
from .models import StatisticalAnalysisRecord

class StatisticalAnalysisRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatisticalAnalysisRecord
        fields = '__all__'

class AnalyzeRequestSerializer(serializers.Serializer):
    observed_counts = serializers.DictField(child=serializers.IntegerField())
    shots = serializers.IntegerField(default=1024)
    fidelity = serializers.FloatField(default=1.0)
