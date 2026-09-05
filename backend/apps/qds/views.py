import hashlib
import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import QuantumDigitalSignature
from .serializers import QuantumDigitalSignatureSerializer, CreateSignatureRequestSerializer, SigningRequestSerializer, CreateSigningRequestSerializer
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
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'SIGNER', 'QUANTUM_OPERATOR'] and not request.user.is_superuser:
            return Response({'error': 'Only users with SIGNER or ADMIN role can create digital signatures.'}, status=status.HTTP_403_FORBIDDEN)

        # Enforce Step-Up Authentication for sensitive signature creation
        step_up_token_val = request.META.get('HTTP_X_STEP_UP_TOKEN') or request.data.get('step_up_token')
        if not step_up_token_val:
            return Response({'detail': 'Step-up authentication token is required to sign documents.'}, status=status.HTTP_403_FORBIDDEN)

        from apps.accounts.models import StepUpToken
        step_up_obj = StepUpToken.objects.filter(token=step_up_token_val, user=request.user).first()
        if not step_up_obj or not step_up_obj.is_valid:
            return Response({'detail': 'Invalid or expired step-up authentication token.'}, status=status.HTTP_403_FORBIDDEN)

        # Mark token as consumed
        step_up_obj.is_used = True
        step_up_obj.save()

        serializer = CreateSignatureRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        document_id = request.data.get('document_id')
        document_obj = None
        if document_id:
            from apps.documents.models import Document
            document_obj = Document.objects.filter(id=document_id, organization=request.user.organization).first()
            if not document_obj:
                return Response({'error': 'Document not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

            # REQUIRE EXPLICIT REVIEW CONFIRMATION
            if not document_obj.reviewed_at:
                return Response({
                    'error': 'Signer review confirmation required! You must explicitly review and approve the document before generating a digital signature.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Recalculate SHA-256 from exact original file bytes
            try:
                document_obj.file.open('rb')
                file_bytes = document_obj.file.read()
                document_obj.file.close()
                digest = hashlib.sha256(file_bytes).hexdigest()
                payload = document_obj.original_filename
            except Exception as ex:
                return Response({'error': f"Failed to read original document file bytes: {str(ex)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
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
        elif document_obj:
            recipient_org = document_obj.organization

        sig_id = f"QDS-{uuid.uuid4().hex[:12].upper()}"
        session_id = f"SESS-{uuid.uuid4().hex[:12].upper()}"
        nonce = f"NONCE-{uuid.uuid4().hex[:16].upper()}"

        qds_obj = QuantumDigitalSignature.objects.create(
            signature_id=sig_id,
            sender=request.user,
            recipient_organization=recipient_org,
            document=document_obj,
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

        # Assign Verifier if verifier_id supplied
        verifier_id = request.data.get('verifier_id')
        if verifier_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            verifier_user = User.objects.filter(id=verifier_id, organization=request.user.organization).first()
            if verifier_user:
                from .models import SigningRequest
                SigningRequest.objects.create(
                    request_id=f"REQ-{uuid.uuid4().hex[:8].upper()}",
                    requester=verifier_user,
                    signer=request.user,
                    document=document_obj,
                    purpose=f"Verify Document: {payload}",
                    payload_content=digest,
                    signature=qds_obj,
                    status='PENDING'
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

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=401)
        
        # 1. QDS Created
        qds_created_count = QuantumDigitalSignature.objects.filter(sender=user).count()
        
        # 2. Pending Requests
        from .models import SigningRequest
        pending_requests_count = SigningRequest.objects.filter(signer=user, status='PENDING').count()
        
        # 3. Verified
        from apps.verification.models import SignatureVerificationAttempt
        verified_count = SignatureVerificationAttempt.objects.filter(
            signature__sender=user, 
            verification_result='PASSED'
        ).count()
        
        # 4. Rejected
        rejected_count = SignatureVerificationAttempt.objects.filter(
            signature__sender=user,
            verification_result__startswith='REJECTED'
        ).count()
        
        # 5. Total Verifications
        total_verifications_count = SignatureVerificationAttempt.objects.filter(
            signature__sender=user
        ).count()

        # 6. Creation trend dataset (last 7 days)
        from django.utils import timezone
        import datetime
        trend = []
        now = timezone.now()
        for i in range(6, -1, -1):
            day = now - datetime.timedelta(days=i)
            date_str = day.strftime('%d %b') # e.g. "15 Apr"
            count = QuantumDigitalSignature.objects.filter(
                sender=user,
                created_at__date=day.date()
            ).count()
            trend.append({
                'time': date_str,
                'count': count
            })
        
        return Response({
            'qds_created': qds_created_count,
            'pending_requests': pending_requests_count,
            'verified': verified_count,
            'rejected': rejected_count,
            'total_verifications': total_verifications_count,
            'creation_trend': trend
        })

    @action(detail=False, methods=['get'], url_path='verifiers')
    def available_verifiers(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=401)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()

        if user.role in ['ADMIN', 'SUPER_ADMIN'] or user.is_superuser:
            qs = User.objects.filter(role__in=['VERIFIER', 'ADMIN', 'ORGANIZATION_ADMIN'], is_active=True)
        elif user.organization:
            qs = User.objects.filter(organization=user.organization, role__in=['VERIFIER', 'ADMIN', 'ORGANIZATION_ADMIN'], is_active=True)
        else:
            qs = User.objects.filter(role__in=['VERIFIER', 'ADMIN', 'ORGANIZATION_ADMIN'], is_active=True)

        data = [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'organization_name': u.organization.name if u.organization else 'System',
            'role': u.role
        } for u in qs]

        return Response(data)


class SigningRequestViewSet(viewsets.ModelViewSet):
    serializer_class = SigningRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from .models import SigningRequest
        if user.role == 'ADMIN' or user.is_superuser:
            return SigningRequest.objects.all().order_by('-created_at')
        return SigningRequest.objects.filter(Q(signer=user) | Q(requester=user)).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        from .models import SigningRequest
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        serializer = CreateSigningRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            signer_user = User.objects.get(id=data['signer_id'])
        except User.DoesNotExist:
            return Response({'error': 'Signer user not found'}, status=status.HTTP_404_NOT_FOUND)

        req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"

        req_obj = SigningRequest.objects.create(
            request_id=req_id,
            requester=request.user,
            signer=signer_user,
            purpose=data['purpose'],
            payload_content=data['payload_content'],
            verifiers_count=data['verifiers_count'],
            status='PENDING'
        )

        AuditTrailRecord.objects.create(
            action_type='SIGNING_REQUEST_CREATED',
            user_identifier=request.user.username,
            target_resource=req_id,
            status='SUCCESS',
            details={
                'request_id': req_id,
                'signer': signer_user.username,
                'purpose': data['purpose']
            }
        )

        return Response(SigningRequestSerializer(req_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='sign')
    def sign_request(self, request, pk=None):
        req_obj = self.get_object()
        if req_obj.status != 'PENDING':
            return Response({'error': 'This signing request is not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        if req_obj.signer != request.user and request.user.role != 'ADMIN' and not request.user.is_superuser:
            return Response({'error': 'Only the designated signer can sign this request'}, status=status.HTTP_403_FORBIDDEN)

        # Enforce Step-Up Authentication for sensitive signature execution
        step_up_token_val = request.META.get('HTTP_X_STEP_UP_TOKEN') or request.data.get('step_up_token')
        if not step_up_token_val:
            return Response({'detail': 'Step-up authentication token is required to sign documents.'}, status=status.HTTP_403_FORBIDDEN)

        from apps.accounts.models import StepUpToken
        step_up_obj = StepUpToken.objects.filter(token=step_up_token_val, user=request.user).first()
        if not step_up_obj or not step_up_obj.is_valid:
            return Response({'detail': 'Invalid or expired step-up authentication token.'}, status=status.HTTP_403_FORBIDDEN)

        # Mark token as consumed
        step_up_obj.is_used = True
        step_up_obj.save()

        # Reuse signature creation logic
        basis = request.data.get('quantum_state_basis', '|+>')
        bell_type = request.data.get('bell_pair_type', 'PHI_PLUS')

        # Run Qiskit simulator
        q_result = QuantumEngineService.run_teleportation_qds(
            input_state_symbol=basis,
            bell_type=bell_type,
            shots=1024
        )

        sig_id = f"QDS-{uuid.uuid4().hex[:12].upper()}"
        session_id = f"SESS-{uuid.uuid4().hex[:12].upper()}"
        nonce = f"NONCE-{uuid.uuid4().hex[:16].upper()}"
        digest = hashlib.sha256(req_obj.payload_content.encode('utf-8')).hexdigest()

        # Create QDS signature
        qds_obj = QuantumDigitalSignature.objects.create(
            signature_id=sig_id,
            sender=request.user,
            recipient_organization=req_obj.requester.organization,
            message_payload=req_obj.payload_content,
            message_digest=digest,
            payload_summary=req_obj.payload_content[:200],
            quantum_state_basis=basis,
            bell_pair_type=bell_type,
            quantum_execution_id=q_result['execution_id'],
            session_id=session_id,
            nonce=nonce,
            status='ISSUED'
        )

        # Update request
        req_obj.signature = qds_obj
        req_obj.status = 'COMPLETED'
        req_obj.save()

        # Log audit
        AuditTrailRecord.objects.create(
            action_type='SIGNING_REQUEST_SIGNED',
            user_identifier=request.user.username,
            target_resource=req_obj.request_id,
            status='SUCCESS',
            details={
                'request_id': req_obj.request_id,
                'signature_id': sig_id,
                'basis': basis,
                'bell_type': bell_type
            }
        )

        return Response({
            'status': 'success',
            'request': SigningRequestSerializer(req_obj).data,
            'signature': QuantumDigitalSignatureSerializer(qds_obj).data,
            'quantum_teleportation_key': q_result
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        req_obj = self.get_object()
        if req_obj.status != 'PENDING':
            return Response({'error': 'This signing request is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        if req_obj.signer != request.user and request.user.role != 'ADMIN' and not request.user.is_superuser:
            return Response({'error': 'Only the designated signer can reject this request'}, status=status.HTTP_403_FORBIDDEN)

        req_obj.status = 'REJECTED'
        req_obj.save()

        # Log audit
        AuditTrailRecord.objects.create(
            action_type='SIGNING_REQUEST_REJECTED',
            user_identifier=request.user.username,
            target_resource=req_obj.request_id,
            status='SUCCESS',
            details={
                'request_id': req_obj.request_id
            }
        )

        return Response(SigningRequestSerializer(req_obj).data)

