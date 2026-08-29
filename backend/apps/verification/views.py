import hashlib
import uuid
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import SignatureVerificationAttempt
from .serializers import SignatureVerificationAttemptSerializer, VerifySignatureRequestSerializer
from apps.qds.models import QuantumDigitalSignature
from apps.quantum_engine.services import QuantumEngineService
from apps.statistics_engine.services import StatisticsEngineService
from apps.threat_detection.services import ThreatDetectionService
from apps.audit.models import AuditTrailRecord
from apps.accounts.permissions import IsVerifier, IsSignerOrVerifier

class VerificationViewSet(viewsets.ModelViewSet):
    serializer_class = SignatureVerificationAttemptSerializer
    permission_classes = [IsSignerOrVerifier]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SignatureVerificationAttempt.objects.none()

        # Admin sees all across organizations
        if user.role == 'ADMIN' or user.is_superuser:
            return SignatureVerificationAttempt.objects.all().order_by('-created_at')

        if not user.organization:
            return SignatureVerificationAttempt.objects.filter(verifier=user).order_by('-created_at')

        # Organization Isolation: See verifications done by org members OR for signatures belonging to user's org
        return SignatureVerificationAttempt.objects.filter(
            Q(verifier__organization=user.organization) |
            Q(signature__sender__organization=user.organization) |
            Q(signature__recipient_organization=user.organization)
        ).distinct().order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='verify-signature')
    def verify_signature(self, request):
        serializer = VerifySignatureRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user

        sig_obj = QuantumDigitalSignature.objects.filter(signature_id=data['signature_id']).first()
        if not sig_obj:
            return Response(
                {'error': f"Signature '{data['signature_id']}' not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        v_id = f"VERIFY-{uuid.uuid4().hex[:12].upper()}"

        # 1. Server-Side Organization Clearance & Unauthorized Check
        has_access = False
        if user.role == 'ADMIN' or user.is_superuser:
            has_access = True
        elif user.organization:
            if sig_obj.sender.organization_id == user.organization_id:
                has_access = True
            elif sig_obj.recipient_organization_id == user.organization_id:
                has_access = True

        if not has_access:
            # Trigger Unauthorized Threat Security Event
            threat_result = ThreatDetectionService.evaluate_threat(
                analysis_data={'qber': 0.0, 'fidelity': 1.0, 'forgery_probability': 0.0, 'chi_square': {'p_value': 1.0}, 'execution_id': sig_obj.signature_id},
                execution_context={'attack_type': 'UNAUTHORIZED_VERIFICATION', 'unauthorized_attempt': True, 'user': user.username}
            )
            attempt = SignatureVerificationAttempt.objects.create(
                verification_id=v_id,
                signature=sig_obj,
                verifier=user,
                payload_provided=data['payload_content'][:200],
                hash_match=False,
                threat_detected=True,
                threat_category='UNAUTHORIZED_VERIFICATION',
                verification_result='UNAUTHORIZED'
            )
            return Response(
                {
                    'error': 'Access denied: User organization is not authorized to verify this signature.',
                    'verification_attempt': SignatureVerificationAttemptSerializer(attempt).data,
                    'threat_evaluation': threat_result
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Server-Side Replay Detection Check
        # Check if signature has already been consumed or verified previously
        is_replay_detected = sig_obj.is_consumed or SignatureVerificationAttempt.objects.filter(
            signature=sig_obj, verification_result='PASSED'
        ).exists()

        if is_replay_detected:
            threat_result = ThreatDetectionService.evaluate_threat(
                analysis_data={'qber': 0.0, 'fidelity': 1.0, 'forgery_probability': 0.0, 'chi_square': {'p_value': 1.0}, 'execution_id': sig_obj.signature_id},
                execution_context={'attack_type': 'REPLAY_ATTACK', 'is_replay': True, 'user': user.username}
            )
            attempt = SignatureVerificationAttempt.objects.create(
                verification_id=v_id,
                signature=sig_obj,
                verifier=user,
                payload_provided=data['payload_content'][:200],
                hash_match=True,
                threat_detected=True,
                threat_category='REPLAY_ATTACK',
                verification_result='REJECTED_REPLAY_ATTACK'
            )
            return Response(
                {
                    'error': 'Replay Attack Detected: This signature state has already been consumed/verified.',
                    'verification_attempt': SignatureVerificationAttemptSerializer(attempt).data,
                    'threat_evaluation': threat_result
                },
                status=status.HTTP_409_CONFLICT
            )

        # 3. Classical Digest Hash Verification
        calc_digest = hashlib.sha256(data['payload_content'].encode('utf-8')).hexdigest()
        hash_match = bool(calc_digest == sig_obj.message_digest)

        # 4. Build Attack Context (Only from explicit simulator or noise parameter)
        attack_type = data.get('inject_attack', 'NONE')
        attack_config = {}
        if attack_type == 'FORGERY':
            attack_config['forgery'] = True
        elif attack_type == 'IMPERSONATION':
            attack_config['bsm_tamper'] = True
        elif attack_type == 'CHANNEL_MANIPULATION' or data.get('simulated_noise', 0.0) > 0.0:
            attack_config['channel_noise'] = max(data.get('simulated_noise', 0.0), 0.25 if attack_type == 'CHANNEL_MANIPULATION' else 0.0)

        # 5. Quantum Teleportation Verification Execution
        q_result = QuantumEngineService.run_teleportation_qds(
            input_state_symbol=sig_obj.quantum_state_basis,
            bell_type=sig_obj.bell_pair_type,
            shots=1024,
            attack_config=attack_config
        )

        # 6. Statistical Analysis
        stat_result = StatisticsEngineService.analyze_quantum_execution(q_result)

        # 7. Threat Evaluation
        threat_result = ThreatDetectionService.evaluate_threat(
            analysis_data=stat_result,
            execution_context={
                'attack_type': attack_type if attack_type != 'NONE' else '',
                'user': user.username
            }
        )

        # 8. Overall Result Determination
        if not hash_match:
            v_result = 'REJECTED_DIGEST_MISMATCH'
        elif threat_result['threat_detected']:
            v_result = 'REJECTED_QUANTUM_THREAT'
        else:
            v_result = 'PASSED'

        # Update QDS consumed status
        if v_result == 'PASSED':
            sig_obj.status = 'VERIFIED'
            sig_obj.is_consumed = True
            sig_obj.consumed_at = timezone.now()
        elif v_result == 'REJECTED_QUANTUM_THREAT':
            sig_obj.status = 'COMPROMISED'
        sig_obj.save()

        attempt = SignatureVerificationAttempt.objects.create(
            verification_id=v_id,
            signature=sig_obj,
            verifier=user,
            payload_provided=data['payload_content'][:200],
            hash_match=hash_match,
            quantum_fidelity=stat_result['fidelity'],
            qber=stat_result['qber'],
            forgery_probability=stat_result['forgery_probability'],
            threat_detected=threat_result['threat_detected'],
            threat_category=threat_result['threat_category'],
            verification_result=v_result
        )

        AuditTrailRecord.objects.create(
            action_type='QDS_VERIFICATION_ATTEMPT',
            user_identifier=user.username,
            target_resource=sig_obj.signature_id,
            status=v_result,
            details={
                'verification_id': v_id,
                'hash_match': hash_match,
                'qber': stat_result['qber'],
                'fidelity': stat_result['fidelity'],
                'threat_result': threat_result
            }
        )

        return Response({
            'verification_attempt': SignatureVerificationAttemptSerializer(attempt).data,
            'quantum_execution': q_result,
            'statistical_analysis': stat_result,
            'threat_evaluation': threat_result
        }, status=status.HTTP_200_OK)
