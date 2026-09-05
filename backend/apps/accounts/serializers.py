from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from .models import UserSession

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['status'] = user.status
        token['organization'] = user.organization.id if user.organization else None
        return token

    def validate(self, attrs):
        username = attrs.get('username')
        user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()

        if user:
            # Check lockout state
            if user.lockout_until and timezone.now() < user.lockout_until:
                raise serializers.ValidationError({
                    "detail": "Account is temporarily locked due to multiple failed login attempts. Please try again later."
                })

            # Check account status
            if user.status != User.AccountStatus.ACTIVE or not user.is_active:
                if user.status == User.AccountStatus.PENDING:
                    raise serializers.ValidationError({"detail": "Account approval is pending."})
                elif user.status == User.AccountStatus.SUSPENDED:
                    raise serializers.ValidationError({"detail": "Account has been suspended."})
                elif user.status == User.AccountStatus.LOCKED:
                    raise serializers.ValidationError({"detail": "Account is locked out."})
                elif user.status == User.AccountStatus.DISABLED:
                    raise serializers.ValidationError({"detail": "Account has been disabled."})
                else:
                    raise serializers.ValidationError({"detail": "Invalid credentials or account is not active."})

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    requires_mfa = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'status', 'organization', 'organization_name', 'department', 'is_mfa_enabled', 'requires_mfa', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role', 'department', 'organization')

    def validate_role(self, value):
        request = self.context.get('request')
        privileged_roles = [User.Role.SUPER_ADMIN, User.Role.ORGANIZATION_ADMIN, User.Role.SECURITY_ANALYST, User.Role.ADMIN]
        
        if value in privileged_roles:
            if not request or not request.user or not request.user.is_authenticated or request.user.role not in [User.Role.SUPER_ADMIN, User.Role.ADMIN]:
                raise serializers.ValidationError("Public self-registration cannot request privileged roles.")
        return value

    def create(self, validated_data):
        requested_role = validated_data.get('role', User.Role.SIGNER)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=requested_role,
            status=User.AccountStatus.ACTIVE,
            department=validated_data.get('department', ''),
            organization=validated_data.get('organization', None)
        )
        return user

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8, required=False)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'role', 'status', 'organization', 'organization_name', 'department', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        confirm = attrs.get('confirm_password')
        password = attrs.get('password')
        if confirm and confirm != password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        status_val = validated_data.get('status', User.AccountStatus.ACTIVE)
        is_active_val = (status_val == User.AccountStatus.ACTIVE)
        user = User.objects.create_user(
            password=password,
            is_active=is_active_val,
            **validated_data
        )
        return user

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'status', 'organization', 'organization_name', 'department', 'is_active', 'created_at')
        read_only_fields = ('id', 'username', 'created_at')

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        status_val = validated_data.get('status', instance.status)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'status' in validated_data:
            instance.is_active = (status_val == User.AccountStatus.ACTIVE)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

class MfaSetupSerializer(serializers.Serializer):
    pass

class MfaVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)

class MfaLoginVerifySerializer(serializers.Serializer):
    mfa_challenge = serializers.CharField()
    code = serializers.CharField(required=False, allow_blank=True)
    recovery_code = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('code') and not attrs.get('recovery_code'):
            raise serializers.ValidationError({"detail": "Either a 6-digit TOTP code or a recovery code must be provided."})
        return attrs

class StepUpVerifySerializer(serializers.Serializer):
    code = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        return attrs

class MfaDisableSerializer(serializers.Serializer):
    code = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('code') and not attrs.get('password'):
            raise serializers.ValidationError({"detail": "MFA code or account password is required to disable MFA."})
        return attrs

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ('id', 'refresh_token_jti', 'ip_address', 'user_agent', 'device_type', 'browser', 'os', 'location_hint', 'revoked_at', 'revocation_reason', 'last_active', 'is_active', 'created_at')
        read_only_fields = ('id', 'refresh_token_jti', 'ip_address', 'user_agent', 'device_type', 'browser', 'os', 'location_hint', 'revoked_at', 'revocation_reason', 'last_active', 'is_active', 'created_at')
