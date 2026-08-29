from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import StatisticalAnalysisRecord
from .serializers import StatisticalAnalysisRecordSerializer, AnalyzeRequestSerializer
from .services import StatisticsEngineService

class StatisticsEngineViewSet(viewsets.ModelViewSet):
    queryset = StatisticalAnalysisRecord.objects.all().order_by('-created_at')
    serializer_class = StatisticalAnalysisRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='analyze')
    def analyze(self, request):
        serializer = AnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        counts = data['observed_counts']
        shots = data['shots']
        fidelity = data['fidelity']
        qber = 1.0 - fidelity

        execution_data = {
            'shots': shots,
            'measurement_counts': counts,
            'fidelity': fidelity,
            'qber': qber,
            'execution_id': 'MANUAL-ANALYTICS'
        }

        analysis = StatisticsEngineService.analyze_quantum_execution(execution_data)

        # Save record to DB
        record = StatisticalAnalysisRecord.objects.create(
            record_id=analysis['record_id'],
            execution_id=analysis['execution_id'],
            shots=shots,
            qber=qber,
            fidelity=fidelity,
            chi_square_stat=analysis['chi_square']['chi2_stat'],
            chi_square_pvalue=analysis['chi_square']['p_value'],
            degrees_of_freedom=analysis['chi_square']['degrees_of_freedom'],
            is_hypothesis_rejected=analysis['chi_square']['hypothesis_rejected'],
            forgery_probability=analysis['forgery_probability'],
            sprt_log_likelihood=analysis['sprt']['log_likelihood_ratio'],
            sprt_decision=analysis['sprt']['decision']
        )

        return Response(analysis, status=status.HTTP_200_OK)
