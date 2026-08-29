import hashlib
import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import QuantumDigitalSignature
from .serializers import QuantumDigitalSignatureSerializer, CreateSignatureRequestSerializer
from apps.quantum_engine.services import QuantumEngineService
from apps.organizations.models import Organization
from apps.audit.models import AuditTrailRecord
from apps.accounts.permissions import IsSigner, IsSignerOrVerifier

class QDSViewSet(viewsets.ModelViewSet):
    serializer_class = QuantumDigitalSignatureSerializer
    permission_classes = [IsSignerOrVerifier]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return QuantumDigitalSignature.objects.none()
        
        # Admin or superuser sees all across organizations
        if user.role == 'ADMIN' or user.is_superuser:
            return QuantumDigitalSignature.objects.all().order_by('-created_at')
        
        if not user.organization:
            # Non-admin user with no organization assigned only sees their own sent signatures
            return QuantumDigitalSignature.objects.filter(sender=user).order_by('-created_at')
        
        # Organization Isolation: Users see signatures sent by their org members OR addressed to their org
        return QuantumDigitalSignature.objects.filter(
            Q(sender__organization=user.organization) | Q(recipient_organization=user.organization)
        ).distinct().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Enforce Signer role check
        if request.user.role not in ['ADMIN', 'SIGNER', 'QUANTUM_OPERATOR'] and not request.user.is_superuser:
            return Response({'error': 'Only users with SIGNER or ADMIN role can create digital signatures.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateSignatureRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        payload = data['payload_content']
        digest = hashlib.sha256(payload.encode('utf-8')).hexdigest()

        # Run Quantum Teleportation key state prep
        q_result = QuantumEngineService.run_teleportation_qds(
            input_state_symbol=data['quantum_state_basis'],
            bell_type=data['bell_pair_type'],
            shots=1024
        )

        recipient_org = None
        org_id = data.get('recipient_organization_id')
        if org_id:
            recipient_org = Organization.objects.filter(id=org_id).first()

        sig_id = f"QDS-{uuid.uuid4().hex[:12].upper()}"
        session_id = f"SESS-{uuid.uuid4().hex[:12].upper()}"
        nonce = f"NONCE-{uuid.uuid4().hex[:16].upper()}"

        qds_obj = QuantumDigitalSignature.objects.create(
            signature_id=sig_id,
            sender=request.user,
            recipient_organization=recipient_org,
            message_payload=payload,
            message_digest=digest,
            payload_summary=payload[:200],
            quantum_state_basis=data['quantum_state_basis'],
            bell_pair_type=data['bell_pair_type'],
            quantum_execution_id=q_result['execution_id'],
            session_id=session_id,
            nonce=nonce,
            status='ISSUED'
        )

        AuditTrailRecord.objects.create(
            action_type='QDS_SIGNATURE_CREATED',
            user_identifier=request.user.username,
            target_resource=sig_id,
            status='SUCCESS',
            details={
                'signature_id': sig_id,
                'message_digest': digest,
                'quantum_state_basis': data['quantum_state_basis'],
                'session_id': session_id,
                'nonce': nonce,
                'organization_id': request.user.organization.id if request.user.organization else None
            }
        )

        return Response({
            'signature': QuantumDigitalSignatureSerializer(qds_obj).data,
            'quantum_teleportation_key': q_result
        }, status=status.HTTP_201_CREATED)
