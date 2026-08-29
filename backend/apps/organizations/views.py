from rest_framework import viewsets, permissions
from .models import Organization
from .serializers import OrganizationSerializer
from apps.accounts.permissions import IsAdminOrReadOnly

class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAdminOrReadOnly]  # Only Admin can create/edit orgs; others read-only

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Organization.objects.none()

        if user.role == 'ADMIN' or user.is_superuser:
            return Organization.objects.all().order_by('-created_at')

        # Non-admin users only see their own organization
        if user.organization:
            return Organization.objects.filter(id=user.organization.id)
        return Organization.objects.all().order_by('-created_at')
