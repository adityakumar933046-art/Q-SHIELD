from rest_framework import viewsets, permissions
from .models import AuditTrailRecord
from .serializers import AuditTrailRecordSerializer

class AuditTrailViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditTrailRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AuditTrailRecord.objects.none()

        if user.role in ['ADMIN', 'SECURITY_OFFICER', 'SECURITY_ANALYST', 'AUDITOR'] or user.is_superuser:
            return AuditTrailRecord.objects.all().order_by('-created_at')

        # Non-analyst users only see audit records linked to their username
        return AuditTrailRecord.objects.filter(user_identifier=user.username).order_by('-created_at')
