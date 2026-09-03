import datetime
from django.utils import timezone
from django.db.models import Count, Q, Avg
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SecurityIncident, InvestigationNote
from .serializers import SecurityIncidentSerializer, InvestigationNoteSerializer
from apps.audit.models import AuditTrailRecord
from apps.accounts.permissions import IsAdminOrSecurityAnalyst, IsAnalystOrReadOnly

class SecurityIncidentViewSet(viewsets.ModelViewSet):
    serializer_class = SecurityIncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SecurityIncident.objects.none()

        # Admin or SuperAdmin sees all across organizations
        if user.role in ['ADMIN', 'SUPER_ADMIN'] or user.is_superuser:
            return SecurityIncident.objects.all().order_by('-created_at')

        # Organization Isolation: Security Analyst only sees incidents belonging to their assigned organization
        if user.organization:
            return SecurityIncident.objects.filter(
                Q(organization=user.organization) | Q(assigned_to=user)
            ).distinct().order_by('-created_at')

        return SecurityIncident.objects.filter(assigned_to=user).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        incident = self.get_object()
        note_text = request.data.get('note', '').strip()
        if not note_text:
            return Response({'error': 'Note content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        note_obj = InvestigationNote.objects.create(
            incident=incident,
            author=request.user,
            note=note_text
        )

        AuditTrailRecord.objects.create(
            action_type='INVESTIGATION_NOTE_ADDED',
            user_identifier=request.user.username,
            target_resource=incident.incident_number,
            status='SUCCESS',
            details={
                'incident_number': incident.incident_number,
                'note_id': note_obj.id,
                'author': request.user.username
            }
        )

        return Response(InvestigationNoteSerializer(note_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        incident = self.get_object()
        new_status = request.data.get('status')
        new_classification = request.data.get('classification')
        resolution_notes = request.data.get('resolution_notes')

        valid_statuses = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE', 'CLOSED']
        valid_classifications = ['CONFIRMED_THREAT', 'FALSE_POSITIVE', 'INCONCLUSIVE']

        if new_status:
            if new_status not in valid_statuses:
                return Response({'error': f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)
            incident.status = new_status

        if new_classification:
            if new_classification not in valid_classifications:
                return Response({'error': f"Invalid classification '{new_classification}'."}, status=status.HTTP_400_BAD_REQUEST)
            incident.classification = new_classification

        if resolution_notes is not None:
            incident.resolution_notes = resolution_notes

        # Assign analyst if not assigned
        if not incident.assigned_to:
            incident.assigned_to = request.user

        incident.save()

        AuditTrailRecord.objects.create(
            action_type='INVESTIGATION_STATUS_UPDATED',
            user_identifier=request.user.username,
            target_resource=incident.incident_number,
            status='SUCCESS',
            details={
                'incident_number': incident.incident_number,
                'new_status': incident.status,
                'classification': incident.classification,
                'updated_by': request.user.username
            }
        )

        return Response(SecurityIncidentSerializer(incident).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        qs = self.get_queryset()
        now = timezone.now()

        total_threats = qs.count()
        open_threats = qs.filter(status__in=['OPEN', 'INVESTIGATING']).count()
        critical_threats = qs.filter(severity='CRITICAL').count()
        high_severity_threats = qs.filter(severity='HIGH').count()
        resolved_threats = qs.filter(status__in=['RESOLVED', 'CLOSED', 'CONTAINED']).count()
        threats_today = qs.filter(created_at__date=now.date()).count()

        # Deterministic Security Health Summary State Calculation
        critical_open = qs.filter(severity='CRITICAL', status__in=['OPEN', 'INVESTIGATING']).count()
        high_open = qs.filter(severity='HIGH', status__in=['OPEN', 'INVESTIGATING']).count()
        medium_open = qs.filter(severity='MEDIUM', status__in=['OPEN', 'INVESTIGATING']).count()

        if critical_open > 0:
            health_status = 'CRITICAL'
        elif high_open > 3:
            health_status = 'HIGH_RISK'
        elif medium_open > 0 or high_open > 0:
            health_status = 'ATTENTION_REQUIRED'
        else:
            health_status = 'SECURE'

        # Distributions
        category_distribution = list(qs.values('category').annotate(count=Count('id')))
        severity_distribution = list(qs.values('severity').annotate(count=Count('id')))
        status_distribution = list(qs.values('status').annotate(count=Count('id')))

        # 7-day trend
        trend = []
        for i in range(6, -1, -1):
            day = now - datetime.timedelta(days=i)
            date_str = day.strftime('%d %b')
            count = qs.filter(created_at__date=day.date()).count()
            trend.append({'time': date_str, 'count': count})

        # Verification metrics aggregation
        from apps.verification.models import SignatureVerificationAttempt
        if user.role in ['ADMIN', 'SUPER_ADMIN'] or user.is_superuser:
            v_qs = SignatureVerificationAttempt.objects.all()
        elif user.organization:
            v_qs = SignatureVerificationAttempt.objects.filter(verifier__organization=user.organization)
        else:
            v_qs = SignatureVerificationAttempt.objects.none()

        total_verifications = v_qs.count()
        successful_v = v_qs.filter(verification_result='PASSED').count()
        failed_v = v_qs.exclude(verification_result='PASSED').count()
        
        v_metrics = v_qs.aggregate(
            avg_qber=Avg('qber'),
            avg_fidelity=Avg('quantum_fidelity')
        )

        return Response({
            'total_threat_events': total_threats,
            'open_threats': open_threats,
            'critical_threats': critical_threats,
            'high_severity_threats': high_severity_threats,
            'resolved_threats': resolved_threats,
            'threats_today': threats_today,
            'security_health_status': health_status,
            'category_distribution': category_distribution,
            'severity_distribution': severity_distribution,
            'status_distribution': status_distribution,
            'trend': trend,
            'verification_metrics': {
                'total_verifications': total_verifications,
                'successful_verifications': successful_v,
                'failed_verifications': failed_v,
                'avg_qber': v_metrics['avg_qber'] or 0.0,
                'avg_fidelity': v_metrics['avg_fidelity'] or 1.0,
                'avg_match_rate': v_metrics['avg_fidelity'] or 1.0,
            }
        }, status=status.HTTP_200_OK)
