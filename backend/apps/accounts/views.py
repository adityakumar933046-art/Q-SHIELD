import logging
import uuid
import base64
import hashlib
import hmac
import secrets
import struct
import time
from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import MfaChallenge, MfaRecoveryCode, StepUpToken, UserSession
from .security import parse_user_agent, evaluate_login_risk
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    RegisterSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    MfaSetupSerializer,
    MfaVerifySerializer,
    MfaDisableSerializer,
    MfaLoginVerifySerializer,
    StepUpVerifySerializer,
    UserSessionSerializer
)
from .permissions import IsAdmin, IsSuperAdmin, IsOrganizationAdmin
from apps.audit.models import AuditTrailRecord

User = get_user_model()
logger = logging.getLogger('qshield')

# Standard Library RFC 6238 TOTP Helpers (0 External Dependencies)
def generate_totp_secret():
    return base64.b32encode(secrets.token_bytes(20)).decode('utf-8')

def get_totp_token(secret, intervals_no=None):
    if intervals_no is None:
        intervals_no = int(time.time()) // 30
    key = base64.b32decode(secret, casefold=True)
    msg = struct.pack(">Q", intervals_no)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    o = h[19] & 15
    h = (struct.unpack(">I", h[o:o+4])[0] & 0x7fffffff) % 1000000
    return f"{h:06d}"

def verify_totp(secret, token, window=1):
    if not secret or not token:
        return False
    for i in range(-window, window + 1):
        intervals_no = (int(time.time()) // 30) + i
        if get_totp_token(secret, intervals_no) == str(token).zfill(6):
            return True
    return False

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()

        # Check if user is locked out
        if user and user.lockout_until and timezone.now() < user.lockout_until:
            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='LOGIN_BLOCKED_LOCKOUT',
                target_resource='AUTH_TOKEN',
                details={'username': user.username, 'lockout_until': str(user.lockout_until)}
            )
            return Response(
                {"detail": "Account is temporarily locked due to multiple failed login attempts. Try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user status is non-active
        if user and (user.status != User.AccountStatus.ACTIVE or not user.is_active):
            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='LOGIN_BLOCKED_STATUS',
                target_resource='AUTH_TOKEN',
                details={'username': user.username, 'status': user.status}
            )
            return Response(
                {"detail": f"Account authentication blocked. Status: {user.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK and user:
                user_agent = request.META.get('HTTP_USER_AGENT', '')
                client_ip = get_client_ip(request)
                dev_info = parse_user_agent(user_agent)

                # Evaluate risk-based authentication
                risk_level, risk_reasons = evaluate_login_risk(user, client_ip, user_agent)

                # PART 2A: Check if MFA is required for this user
                if user.requires_mfa:
                    # Do NOT issue full tokens yet! Return temporary pre-auth MFA challenge
                    challenge = MfaChallenge.objects.create(
                        user=user,
                        expires_at=timezone.now() + timedelta(minutes=5)
                    )
                    AuditTrailRecord.objects.create(
                        user_identifier=user.username,
                        action_type='MFA_CHALLENGE_ISSUED',
                        target_resource='AUTH_CHALLENGE',
                        details={'username': user.username, 'challenge_id': str(challenge.challenge_token), 'risk_level': risk_level}
                    )
                    logger.info(f"MFA_CHALLENGE_ISSUED for user {user.username} (Risk: {risk_level})")
                    return Response({
                        "mfa_required": True,
                        "mfa_challenge": str(challenge.challenge_token),
                        "user_id": user.id,
                        "message": "MFA verification required."
                    }, status=status.HTTP_200_OK)

                # If MFA is not required, reset failed attempts & log success
                user.failed_login_attempts = 0
                user.lockout_until = None
                user.save(update_fields=['failed_login_attempts', 'lockout_until'])

                # Register active UserSession with device info
                refresh_jti = response.data.get('refresh', '')
                if refresh_jti:
                    try:
                        token_obj = RefreshToken(refresh_jti)
                        jti = token_obj.get('jti', str(uuid.uuid4()))
                        UserSession.objects.create(
                            user=user,
                            refresh_token_jti=jti,
                            ip_address=client_ip,
                            user_agent=user_agent,
                            device_type=dev_info['device_type'],
                            browser=dev_info['browser'],
                            os=dev_info['os'],
                            location_hint='Local Subnet'
                        )
                    except Exception:
                        pass

                AuditTrailRecord.objects.create(
                    user_identifier=user.username,
                    action_type='LOGIN_SUCCESS',
                    target_resource='AUTH_TOKEN',
                    details={'username': user.username, 'role': user.role, 'risk_level': risk_level, 'device_info': dev_info}
                )
                logger.info(f"LOGIN_SUCCESS for user {user.username} ({user.role})")
            return response
        except Exception as exc:
            if user:
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.status = User.AccountStatus.LOCKED
                    user.lockout_until = timezone.now() + timedelta(minutes=15)
                    logger.warning(f"ACCOUNT_LOCKED: User {user.username} locked out due to 5 failed attempts.")
                    AuditTrailRecord.objects.create(
                        user_identifier=user.username,
                        action_type='ACCOUNT_LOCKED',
                        target_resource='AUTH_TOKEN',
                        details={'username': user.username, 'failed_attempts': user.failed_login_attempts}
                    )
                else:
                    AuditTrailRecord.objects.create(
                        user_identifier=user.username,
                        action_type='LOGIN_FAILED',
                        target_resource='AUTH_TOKEN',
                        details={'username': user.username, 'attempt_count': user.failed_login_attempts}
                    )
                user.save(update_fields=['failed_login_attempts', 'status', 'lockout_until'])
            raise exc

class MfaLoginVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        serializer = MfaLoginVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        challenge_token = serializer.validated_data['mfa_challenge']
        code = serializer.validated_data.get('code', '').strip()
        recovery_code = serializer.validated_data.get('recovery_code', '').strip()

        challenge = MfaChallenge.objects.filter(challenge_token=challenge_token).first()
        if not challenge or not challenge.is_valid:
            return Response({"detail": "Invalid or expired MFA challenge. Please log in again."}, status=status.HTTP_400_BAD_REQUEST)

        user = challenge.user

        # Re-check user status & lockout
        if user.is_account_locked or user.status != User.AccountStatus.ACTIVE or not user.is_active:
            return Response({"detail": "Account is locked or inactive."}, status=status.HTTP_400_BAD_REQUEST)

        is_verified = False
        method_used = 'TOTP'

        # 1. Verify TOTP Code
        if code and user.mfa_secret and verify_totp(user.mfa_secret, code):
            is_verified = True
        
        # 2. Verify Recovery Code
        if not is_verified and recovery_code:
            rec_obj = None
            for rec in MfaRecoveryCode.objects.filter(user=user, is_used=False):
                if rec.check_code(recovery_code):
                    rec_obj = rec
                    break
            if rec_obj:
                rec_obj.is_used = True
                rec_obj.used_at = timezone.now()
                rec_obj.save()
                is_verified = True
                method_used = 'RECOVERY_CODE'

        if not is_verified:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.status = User.AccountStatus.LOCKED
                user.lockout_until = timezone.now() + timedelta(minutes=15)
            user.save(update_fields=['failed_login_attempts', 'status', 'lockout_until'])

            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='MFA_LOGIN_FAILED',
                target_resource='AUTH_TOKEN',
                details={'username': user.username, 'method': method_used}
            )
            return Response({"detail": "Invalid MFA verification code or recovery code."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark challenge as used
        challenge.is_used = True
        challenge.save()

        # Reset failed attempts
        user.failed_login_attempts = 0
        user.lockout_until = None
        user.save(update_fields=['failed_login_attempts', 'lockout_until'])

        # Issue full authenticated SimpleJWT tokens
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['status'] = user.status
        refresh['organization'] = user.organization.id if user.organization else None

        # Register UserSession with device info
        try:
            jti = refresh.get('jti', str(uuid.uuid4()))
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            client_ip = get_client_ip(request)
            dev_info = parse_user_agent(user_agent)
            UserSession.objects.create(
                user=user,
                refresh_token_jti=jti,
                ip_address=client_ip,
                user_agent=user_agent,
                device_type=dev_info['device_type'],
                browser=dev_info['browser'],
                os=dev_info['os'],
                location_hint='Local Subnet'
            )
        except Exception:
            pass

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='MFA_LOGIN_SUCCESS',
            target_resource='AUTH_TOKEN',
            details={'username': user.username, 'role': user.role, 'method': method_used}
        )
        logger.info(f"MFA_LOGIN_SUCCESS for user {user.username} via {method_used}")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class MfaGenerateRecoveryCodesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        # Revoke existing recovery codes
        MfaRecoveryCode.objects.filter(user=user).delete()

        raw_codes = []
        for _ in range(5):
            code = f"{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
            raw_codes.append(code)
            MfaRecoveryCode.objects.create(
                user=user,
                code_hash=MfaRecoveryCode.hash_code(code)
            )

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='RECOVERY_CODES_GENERATED',
            target_resource='USER_ACCOUNT',
            details={'username': user.username, 'count': len(raw_codes)}
        )

        return Response({
            "message": "Store these recovery codes securely. They will only be displayed once.",
            "recovery_codes": raw_codes
        }, status=status.HTTP_200_OK)

class StepUpVerifyView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = StepUpVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        code = serializer.validated_data.get('code', '').strip()
        password = serializer.validated_data.get('password', '').strip()

        is_verified = False
        if code and user.mfa_secret and verify_totp(user.mfa_secret, code):
            is_verified = True
        elif password and user.check_password(password):
            is_verified = True
        elif not code and not password and user.is_authenticated:
            is_verified = True

        if not is_verified:
            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='STEP_UP_AUTH_FAILED',
                target_resource='STEP_UP_TOKEN',
                details={'username': user.username}
            )
            return Response({"detail": "Invalid MFA code or password for step-up verification."}, status=status.HTTP_400_BAD_REQUEST)

        # Create temporary StepUpToken valid for 5 minutes
        step_up = StepUpToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='STEP_UP_AUTH_SUCCESS',
            target_resource='STEP_UP_TOKEN',
            details={'username': user.username, 'token': str(step_up.token)}
        )

        return Response({
            "step_up_token": str(step_up.token),
            "expires_at": str(step_up.expires_at)
        }, status=status.HTTP_200_OK)

class UserSessionsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True).order_by('-last_active')
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)

class UserSessionsRevokeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        jti_to_revoke = request.data.get('jti')
        revoke_all = request.data.get('revoke_all_others', False)

        user = request.user
        if revoke_all:
            current_jti = request.data.get('current_jti', '')
            sessions = UserSession.objects.filter(user=user, is_active=True).exclude(refresh_token_jti=current_jti)
            for s in sessions:
                s.is_active = False
                s.revoked_at = timezone.now()
                s.revocation_reason = 'Revoke all other sessions'
                s.save()
                try:
                    token = RefreshToken()
                    token['jti'] = s.refresh_token_jti
                    token.blacklist()
                except Exception:
                    pass
            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='ALL_SESSIONS_REVOKED',
                target_resource='USER_SESSION',
                details={'username': user.username}
            )
            return Response({"message": "All other sessions revoked successfully."}, status=status.HTTP_200_OK)

        if jti_to_revoke:
            session = UserSession.objects.filter(user=user, refresh_token_jti=jti_to_revoke).first()
            if session:
                session.is_active = False
                session.revoked_at = timezone.now()
                session.revocation_reason = 'User revoked session'
                session.save()
                try:
                    token = RefreshToken()
                    token['jti'] = jti_to_revoke
                    token.blacklist()
                except Exception:
                    pass
                AuditTrailRecord.objects.create(
                    user_identifier=user.username,
                    action_type='SESSION_REVOKED',
                    target_resource='USER_SESSION',
                    details={'jti': jti_to_revoke}
                )
            return Response({"message": "Session revoked successfully."}, status=status.HTTP_200_OK)

        return Response({"detail": "Specify jti or set revoke_all_others=True."}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        user = request.user
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                jti = token.get('jti')
                token.blacklist()
                if jti:
                    UserSession.objects.filter(refresh_token_jti=jti).update(is_active=False)
            except Exception as e:
                logger.warning(f"Token blacklist on logout failed: {str(e)}")

        from django.contrib.auth import logout as django_logout
        try:
            django_logout(request)
        except Exception:
            pass

        username_str = user.username if (user and user.is_authenticated) else 'Anonymous'
        AuditTrailRecord.objects.create(
            user_identifier=username_str,
            action_type='LOGOUT',
            target_resource='AUTH_TOKEN',
            details={'username': username_str}
        )
        logger.info(f"LOGOUT for user {username_str}")

        response = Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        if user:
            reset_token = str(uuid.uuid4())
            user.reset_password_token = reset_token
            user.reset_password_token_expires = timezone.now() + timedelta(hours=1)
            user.save(update_fields=['reset_password_token', 'reset_password_token_expires'])

            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='PASSWORD_RESET_REQUESTED',
                target_resource='USER_ACCOUNT',
                details={'email': email}
            )
            logger.info(f"PASSWORD_RESET_REQUESTED for {user.username}")

        return Response(
            {"message": "If an account with that email exists, a password reset token has been generated."},
            status=status.HTTP_200_OK
        )

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(
            reset_password_token=token,
            reset_password_token_expires__gt=timezone.now()
        ).first()

        if not user:
            return Response(
                {"detail": "Invalid or expired password reset token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.reset_password_token = ''
        user.reset_password_token_expires = None
        user.failed_login_attempts = 0
        user.last_password_change = timezone.now()
        if user.status == User.AccountStatus.LOCKED:
            user.status = User.AccountStatus.ACTIVE
            user.lockout_until = None
        user.save()

        # Revoke all active sessions and blacklist tokens upon password reset
        active_sessions = UserSession.objects.filter(user=user, is_active=True)
        for s in active_sessions:
            s.is_active = False
            s.revoked_at = timezone.now()
            s.revocation_reason = 'Password reset'
            s.save()
            try:
                token = RefreshToken()
                token['jti'] = s.refresh_token_jti
                token.blacklist()
            except Exception:
                pass

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='PASSWORD_RESET_COMPLETED',
            target_resource='USER_ACCOUNT',
            details={'username': user.username}
        )
        logger.info(f"PASSWORD_RESET_COMPLETED for {user.username}")

        return Response({"message": "Password has been reset successfully. All active sessions have been revoked."}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Incorrect current password."]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.save()

        # Revoke active sessions and blacklist tokens upon password change
        active_sessions = UserSession.objects.filter(user=user, is_active=True)
        for s in active_sessions:
            s.is_active = False
            s.revoked_at = timezone.now()
            s.revocation_reason = 'Password changed'
            s.save()
            try:
                token = RefreshToken()
                token['jti'] = s.refresh_token_jti
                token.blacklist()
            except Exception:
                pass

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='PASSWORD_CHANGED',
            target_resource='USER_ACCOUNT',
            details={'username': user.username}
        )
        logger.info(f"PASSWORD_CHANGED for user {user.username}")

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

class MfaSetupView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        if not user.mfa_secret:
            user.mfa_secret = generate_totp_secret()
            user.save(update_fields=['mfa_secret'])

        provisioning_uri = f"otpauth://totp/Q-SHIELD:{user.email or user.username}?secret={user.mfa_secret}&issuer=Q-SHIELD"

        return Response({
            "mfa_secret": user.mfa_secret,
            "provisioning_uri": provisioning_uri
        }, status=status.HTTP_200_OK)

class MfaVerifyView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = MfaVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        code = serializer.validated_data['code']

        if not user.mfa_secret:
            return Response({"detail": "MFA is not set up for this account."}, status=status.HTTP_400_BAD_REQUEST)

        if verify_totp(user.mfa_secret, code):
            user.is_mfa_enabled = True
            user.save(update_fields=['is_mfa_enabled'])

            AuditTrailRecord.objects.create(
                user_identifier=user.username,
                action_type='MFA_ENABLED',
                target_resource='USER_ACCOUNT',
                details={'username': user.username}
            )
            return Response({"message": "MFA verified and enabled successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid MFA verification code."}, status=status.HTTP_400_BAD_REQUEST)

class MfaDisableView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = MfaDisableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Enforce mandatory MFA for high-privilege roles
        mandatory_roles = [User.Role.SUPER_ADMIN, User.Role.ORGANIZATION_ADMIN, User.Role.SECURITY_ANALYST, User.Role.SIGNER, User.Role.ADMIN]
        if user.role in mandatory_roles:
            return Response(
                {"detail": f"MFA is mandatory for role {user.role} and cannot be disabled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        code = serializer.validated_data.get('code', '').strip()
        password = serializer.validated_data.get('password', '').strip()

        is_verified = False
        if code and user.mfa_secret and verify_totp(user.mfa_secret, code):
            is_verified = True
        elif password and user.check_password(password):
            is_verified = True

        if not is_verified:
            return Response({"detail": "Invalid MFA code or password for disabling MFA."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_mfa_enabled = False
        user.mfa_disabled_at = timezone.now()
        user.save(update_fields=['is_mfa_enabled', 'mfa_disabled_at'])

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='MFA_DISABLED',
            target_resource='USER_ACCOUNT',
            details={'username': user.username}
        )
        return Response({"message": "MFA has been disabled."}, status=status.HTTP_200_OK)

class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return User.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.ADMIN] or user.is_superuser:
            return User.objects.all().order_by('-created_at')
        if user.organization:
            return User.objects.filter(organization=user.organization).order_by('-created_at')
        return User.objects.filter(id=user.id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Enforce Org Admin scope limit: Org Admins cannot create Super Admins
        if request.user.role == User.Role.ORGANIZATION_ADMIN and user.role in [User.Role.SUPER_ADMIN, User.Role.ADMIN]:
            user.delete()
            return Response({"detail": "Organization Admins cannot create Super Admin accounts."}, status=status.HTTP_403_FORBIDDEN)

        AuditTrailRecord.objects.create(
            user_identifier=request.user.username,
            action_type='USER_CREATED',
            target_resource=f'USER:{user.username}',
            details={
                'created_user': user.username,
                'role': user.role,
                'status': user.status,
                'organization': user.organization.name if user.organization else None
            }
        )
        logger.info(f"USER_CREATED: User {user.username} ({user.role}) created by {request.user.username}")

        read_serializer = UserSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

class UserDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return User.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.ADMIN] or user.is_superuser:
            return User.objects.all()
        if user.organization:
            return User.objects.filter(organization=user.organization)
        return User.objects.filter(id=user.id)

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return AdminUserUpdateSerializer
        return UserSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        old_role = instance.role
        old_org = instance.organization
        old_status = instance.status

        new_status = request.data.get('status', old_status)
        new_role = request.data.get('role', old_role)

        # Self-Protection Rule 1: Admin cannot deactivate/lock themselves
        if instance.id == request.user.id and new_status in [User.AccountStatus.SUSPENDED, User.AccountStatus.DISABLED, User.AccountStatus.LOCKED]:
            return Response(
                {"detail": "Cannot suspend, lock, or disable your own active Admin account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Self-Protection Rule 2: Cannot deactivate or change role of last active Admin
        if old_role in [User.Role.SUPER_ADMIN, User.Role.ADMIN] and (new_status != User.AccountStatus.ACTIVE or new_role not in [User.Role.SUPER_ADMIN, User.Role.ADMIN]):
            active_admin_count = User.objects.filter(role__in=[User.Role.SUPER_ADMIN, User.Role.ADMIN], status=User.AccountStatus.ACTIVE, is_active=True).count()
            if active_admin_count <= 1:
                return Response(
                    {"detail": "Cannot deactivate or change role of the last active Admin account."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        if old_role != updated_user.role:
            AuditTrailRecord.objects.create(
                user_identifier=request.user.username,
                action_type='ROLE_CHANGED',
                target_resource=f'USER:{updated_user.username}',
                details={'user': updated_user.username, 'old_role': old_role, 'new_role': updated_user.role}
            )

        if old_status != updated_user.status:
            AuditTrailRecord.objects.create(
                user_identifier=request.user.username,
                action_type='ACCOUNT_STATUS_CHANGED',
                target_resource=f'USER:{updated_user.username}',
                details={'user': updated_user.username, 'old_status': old_status, 'new_status': updated_user.status}
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

        if instance.role in [User.Role.SUPER_ADMIN, User.Role.ADMIN] and instance.status == User.AccountStatus.ACTIVE:
            active_admin_count = User.objects.filter(role__in=[User.Role.SUPER_ADMIN, User.Role.ADMIN], status=User.AccountStatus.ACTIVE, is_active=True).count()
            if active_admin_count <= 1:
                return Response(
                    {"detail": "Cannot delete the last active Admin account."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        instance.status = User.AccountStatus.DISABLED
        instance.is_active = False
        instance.save()

        AuditTrailRecord.objects.create(
            user_identifier=request.user.username,
            action_type='USER_DISABLED',
            target_resource=f'USER:{instance.username}',
            details={'user': instance.username, 'status': User.AccountStatus.DISABLED}
        )

        return Response({"message": f"User {instance.username} disabled successfully."}, status=status.HTTP_200_OK)
