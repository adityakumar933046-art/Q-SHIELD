from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ThresholdRule, ThreatEvaluationLog
from .serializers import ThresholdRuleSerializer, ThreatEvaluationLogSerializer, EvaluateThreatRequestSerializer
from .services import ThreatDetectionService
from apps.accounts.permissions import IsAdminOrReadOnly, IsAdminOrSecurityAnalyst, IsSecurityAnalyst

class ThresholdRuleViewSet(viewsets.ModelViewSet):
    queryset = ThresholdRule.objects.all().order_by('id')
    serializer_class = ThresholdRuleSerializer
    permission_classes = [IsAdminOrReadOnly]  # Only Admin can edit thresholds; Analysts/users read-only


class ThreatEvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = ThreatEvaluationLogSerializer
    permission_classes = [IsAdminOrSecurityAnalyst]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ThreatEvaluationLog.objects.none()

        if user.role == 'ADMIN' or user.is_superuser:
            return ThreatEvaluationLog.objects.all().order_by('-created_at')

        # Filter by org if logged in user has org
        if user.organization:
            return ThreatEvaluationLog.objects.filter(
                execution_id__icontains=user.username
            ).order_by('-created_at')
        return ThreatEvaluationLog.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='evaluate')
    def evaluate(self, request):
        serializer = EvaluateThreatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        analysis_data = {
            'qber': data['qber'],
            'fidelity': data['fidelity'],
            'forgery_probability': data.get('forgery_probability', 0.0),
            'chi_square': {'p_value': data.get('chi_square_pvalue', 1.0)},
            'execution_id': data.get('execution_id', '')
        }

        context = {
            'attack_type': data.get('attack_type', ''),
            'user': str(request.user.username)
        }

        res = ThreatDetectionService.evaluate_threat(analysis_data, context)
        return Response(res, status=status.HTTP_200_OK)
