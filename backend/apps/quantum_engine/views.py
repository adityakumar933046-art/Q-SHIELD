from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QuantumExecutionLog
from .serializers import QuantumExecutionLogSerializer, RunTeleportationRequestSerializer
from .services import QuantumEngineService

class QuantumEngineViewSet(viewsets.ModelViewSet):
    queryset = QuantumExecutionLog.objects.all().order_by('-created_at')
    serializer_class = QuantumExecutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='run-teleportation')
    def run_teleportation(self, request):
        serializer = RunTeleportationRequestSerializer(data=request.data)
        serializer.is_validate_or_400 = serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        attack_config = {}
        if data.get('channel_noise', 0.0) > 0.0:
            attack_config['channel_noise'] = data['channel_noise']
        if data.get('bsm_tamper', False):
            attack_config['bsm_tamper'] = True
        if data.get('forgery', False):
            attack_config['forgery'] = True
            attack_config['fake_state'] = data.get('fake_state', '|1>')

        result = QuantumEngineService.run_teleportation_qds(
            input_state_symbol=data['input_state_symbol'],
            bell_type=data['bell_state_type'],
            shots=data['shots'],
            attack_config=attack_config
        )

        # Log to DB
        log = QuantumExecutionLog.objects.create(
            execution_id=result['execution_id'],
            shots=result['shots'],
            input_state_symbol=result['input_state_symbol'],
            bell_state_type=result['bell_state_type'],
            measurement_counts=result['measurement_counts'],
            statevector_real=result['statevector_real'],
            statevector_imag=result['statevector_imag'],
            fidelity=result['fidelity'],
            trace_distance=result['trace_distance'],
            channel_noise_level=data.get('channel_noise', 0.0),
            is_attack_injected=result['attack_injected']
        )

        return Response(result, status=status.HTTP_201_CREATED)
