import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    RegisterSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer
)
from .permissions import IsAdmin
from apps.audit.models import AuditTrailRecord

User = get_user_model()
logger = logging.getLogger('qshield')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            username = request.data.get('username', '')
            user = User.objects.filter(username=username).first()
            if user:
                AuditTrailRecord.objects.create(
                    user_identifier=user.username,
                    action_type='LOGIN_SUCCESS',
                    target_resource='AUTH_TOKEN',
                    details={'username': user.username, 'role': user.role}
                )
                logger.info(f"LOGIN_SUCCESS for user {user.username} ({user.role})")
        return response

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        user = request.user
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                logger.warning(f"Token blacklist on logout failed: {str(e)}")

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='LOGOUT',
            target_resource='AUTH_TOKEN',
            details={'username': user.username}
        )
        logger.info(f"LOGOUT for user {user.username}")

        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN or user.is_superuser:
            return User.objects.all().order_by('-created_at')
        if user.organization:
            return User.objects.filter(organization=user.organization).order_by('-created_at')
        return User.objects.filter(id=user.id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create Audit Trail record (NO passwords included)
        AuditTrailRecord.objects.create(
            user_identifier=request.user.username,
            action_type='USER_CREATED',
            target_resource=f'USER:{user.username}',
            details={
                'created_user': user.username,
                'role': user.role,
                'organization': user.organization.name if user.organization else None,
                'is_active': user.is_active
            }
        )
        logger.info(f"USER_CREATED: User {user.username} ({user.role}) created by Admin {request.user.username}")

        read_serializer = UserSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

class UserDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'DELETE']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return AdminUserUpdateSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        old_role = instance.role
        old_org = instance.organization
        old_active = instance.is_active

        new_active = request.data.get('is_active', old_active)
        new_role = request.data.get('role', old_role)

        # Self-Protection Rule 1: Admin cannot deactivate themselves
        if instance.id == request.user.id and str(new_active).lower() in ['false', '0']:
            return Response(
                {"detail": "Cannot deactivate your own active Admin account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Self-Protection Rule 2: Cannot deactivate or change role of last active Admin
        if old_role == User.Role.ADMIN and (str(new_active).lower() in ['false', '0'] or new_role != User.Role.ADMIN):
            active_admin_count = User.objects.filter(role=User.Role.ADMIN, is_active=True).count()
            if active_admin_count <= 1:
                return Response(
                    {"detail": "Cannot deactivate or change role of the last active Admin account."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        # Log audit events for modifications
        if old_role != updated_user.role:
            AuditTrailRecord.objects.create(
                user_identifier=request.user.username,
                action_type='ROLE_CHANGED',
                target_resource=f'USER:{updated_user.username}',
                details={'user': updated_user.username, 'old_role': old_role, 'new_role': updated_user.role}
            )

        if old_org != updated_user.organization:
            AuditTrailRecord.objects.create(
                user_identifier=request.user.username,
                action_type='ORGANIZATION_CHANGED',
                target_resource=f'USER:{updated_user.username}',
                details={
                    'user': updated_user.username,
                    'old_org': old_org.name if old_org else None,
                    'new_org': updated_user.organization.name if updated_user.organization else None
                }
            )

        if old_active != updated_user.is_active:
            action = 'USER_ACTIVATED' if updated_user.is_active else 'USER_DEACTIVATED'
            AuditTrailRecord.objects.create(
                user_identifier=request.user.username,
                action_type=action,
                target_resource=f'USER:{updated_user.username}',
                details={'user': updated_user.username, 'is_active': updated_user.is_active}
            )

        read_serializer = UserSerializer(updated_user)
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.id == request.user.id:
            return Response(
                {"detail": "Cannot delete your own active Admin account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if instance.role == User.Role.ADMIN and instance.is_active:
            active_admin_count = User.objects.filter(role=User.Role.ADMIN, is_active=True).count()
            if active_admin_count <= 1:
                return Response(
                    {"detail": "Cannot delete the last active Admin account."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Deactivate user safely
        instance.is_active = False
        instance.save()

        AuditTrailRecord.objects.create(
            user_identifier=request.user.username,
            action_type='USER_DEACTIVATED',
            target_resource=f'USER:{instance.username}',
            details={'user': instance.username, 'is_active': False}
        )

        return Response({"message": f"User {instance.username} deactivated successfully."}, status=status.HTTP_200_OK)
