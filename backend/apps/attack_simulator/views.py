from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AttackSimulationRun
from .serializers import AttackSimulationRunSerializer, RunAttackSimulationRequestSerializer
from .services import AttackSimulatorService
from apps.accounts.permissions import IsAdminOrSecurityAnalyst

class AttackSimulatorViewSet(viewsets.ModelViewSet):
    queryset = AttackSimulationRun.objects.all().order_by('-created_at')
    serializer_class = AttackSimulationRunSerializer
    permission_classes = [IsAdminOrSecurityAnalyst]  # Only Admin or Security Analyst can run attack simulations

    @action(detail=False, methods=['post'], url_path='simulate')
    def simulate(self, request):
        serializer = RunAttackSimulationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = AttackSimulatorService.execute_simulation(
            attack_vector=data['attack_vector'],
            intensity=data['intensity'],
            shots=data['shots'],
            user_name=request.user.username
        )

        return Response(result, status=status.HTTP_200_OK)
