from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import SecurityIncident
from .serializers import SecurityIncidentSerializer
from apps.accounts.permissions import IsAdminOrSecurityAnalyst, IsAnalystOrReadOnly

class SecurityIncidentViewSet(viewsets.ModelViewSet):
    serializer_class = SecurityIncidentSerializer
    permission_classes = [IsAnalystOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SecurityIncident.objects.none()

        if user.role in ['ADMIN', 'SECURITY_OFFICER', 'SECURITY_ANALYST'] or user.is_superuser:
            return SecurityIncident.objects.all().order_by('-created_at')

        # Non-analyst users only see incidents linked to their user account or assigned to them
        return SecurityIncident.objects.filter(assigned_to=user).order_by('-created_at')
