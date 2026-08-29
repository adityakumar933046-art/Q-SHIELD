from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['organization'] = user.organization.id if user.organization else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'organization', 'organization_name', 'department', 'is_mfa_enabled', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role', 'department', 'organization')

    def validate_role(self, value):
        """
        Prevent privilege escalation: Public registration cannot choose ADMIN or SECURITY_ANALYST.
        Must be assigned via Authorized Admin workflows.
        """
        request = self.context.get('request')
        privileged_roles = [User.Role.ADMIN, User.Role.SECURITY_ANALYST]
        
        if value in privileged_roles:
            if not request or not request.user or not request.user.is_authenticated or request.user.role != User.Role.ADMIN:
                raise serializers.ValidationError("Public self-registration cannot request privileged roles (ADMIN / SECURITY_ANALYST).")
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
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'role', 'organization', 'organization_name', 'department', 'is_active', 'created_at')
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
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'organization', 'organization_name', 'department', 'is_active', 'created_at')
        read_only_fields = ('id', 'username', 'created_at')

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
