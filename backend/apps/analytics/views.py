from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from apps.qds.models import QuantumDigitalSignature
from apps.verification.models import SignatureVerificationAttempt
from apps.incidents.models import SecurityIncident
from apps.quantum_engine.models import QuantumExecutionLog

class SecurityAnalyticsDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Org filtering if non-admin
        if user.role == 'ADMIN' or user.is_superuser or not user.organization:
            sigs_qs = QuantumDigitalSignature.objects.all()
            verif_qs = SignatureVerificationAttempt.objects.all()
            inc_qs = SecurityIncident.objects.all()
        else:
            sigs_qs = QuantumDigitalSignature.objects.filter(
                Q(sender__organization=user.organization) | Q(recipient_organization=user.organization)
            )
            verif_qs = SignatureVerificationAttempt.objects.filter(
                Q(verifier__organization=user.organization) | Q(signature__sender__organization=user.organization)
            )
            inc_qs = SecurityIncident.objects.filter(
                Q(assigned_to__organization=user.organization)
            )

        total_sigs = sigs_qs.count()
        sigs_issued = sigs_qs.filter(status='ISSUED').count()
        sigs_verified = sigs_qs.filter(status='VERIFIED').count()
        sigs_compromised = sigs_qs.filter(status='COMPROMISED').count()

        total_verifications = verif_qs.count()

        incidents_total = inc_qs.count()
        incidents_open = inc_qs.filter(status='OPEN').count()
        incidents_critical = inc_qs.filter(severity='CRITICAL').count()

        avg_qber = QuantumExecutionLog.objects.aggregate(Avg('fidelity'))['fidelity__avg']
        qber_val = round(1.0 - (avg_qber if avg_qber is not None else 1.0), 4)
        fidelity_val = round(avg_qber if avg_qber is not None else 1.0, 4)

        # QBER Timeline points (last 10 executions)
        logs = QuantumExecutionLog.objects.order_by('-created_at')[:10]
        qber_timeline = []
        for l in reversed(list(logs)):
            qber_timeline.append({
                'time': l.created_at.strftime('%H:%M:%S'),
                'qber': round(1.0 - l.fidelity, 4),
                'fidelity': round(l.fidelity, 4),
                'threshold': 0.11
            })

        # Category Breakdown
        threat_cats = inc_qs.values('category').annotate(count=Count('id'))

        return Response({
            'signatures': {
                'total': total_sigs,
                'issued': sigs_issued,
                'verified': sigs_verified,
                'compromised': sigs_compromised
            },
            'verifications': {
                'total': total_verifications
            },
            'incidents': {
                'total': incidents_total,
                'open': incidents_open,
                'critical': incidents_critical
            },
            'quantum_telemetry': {
                'system_avg_qber': qber_val,
                'system_avg_fidelity': fidelity_val,
                'qber_threshold': 0.11,
                'fidelity_threshold': 0.85
            },
            'qber_timeline': qber_timeline,
            'threat_category_breakdown': threat_cats
        }, status=status.HTTP_200_OK)
