from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    LogoutView,
    RegisterView,
    CurrentUserView,
    UserListCreateView,
    UserDetailUpdateDeleteView,
    ForgotPasswordView,
    ResetPasswordView,
    ChangePasswordView,
    MfaSetupView,
    MfaVerifyView,
    MfaDisableView,
    MfaLoginVerifyView,
    MfaGenerateRecoveryCodesView,
    StepUpVerifyView,
    UserSessionsView,
    UserSessionsRevokeView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', UserDetailUpdateDeleteView.as_view(), name='user_detail_update_delete'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('mfa/setup/', MfaSetupView.as_view(), name='mfa_setup'),
    path('mfa/verify/', MfaVerifyView.as_view(), name='mfa_verify'),
    path('mfa/disable/', MfaDisableView.as_view(), name='mfa_disable'),
    path('mfa/login/verify/', MfaLoginVerifyView.as_view(), name='mfa_login_verify'),
    path('mfa/recovery-codes/generate/', MfaGenerateRecoveryCodesView.as_view(), name='mfa_generate_recovery_codes'),
    path('step-up/verify/', StepUpVerifyView.as_view(), name='step_up_verify'),
    path('sessions/', UserSessionsView.as_view(), name='user_sessions'),
    path('sessions/revoke/', UserSessionsRevokeView.as_view(), name='user_sessions_revoke'),
]
