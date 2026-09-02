from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from apps.accounts.models import UserSession

class SessionSecurityMiddleware:
    """
    Middleware that enforces active session status for JWT authenticated requests.
    If a session has been revoked (is_active=False), subsequent requests are denied.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            raw_token = auth_header.split(' ')[1]
            try:
                access_token = AccessToken(raw_token)
                user_id = access_token.get('user_id')
                session_jti = access_token.get('session_jti')
                
                is_revoked = False
                if session_jti:
                    is_revoked = UserSession.objects.filter(
                        user_id=user_id,
                        refresh_token_jti=session_jti,
                        is_active=False
                    ).exists()
                else:
                    has_sessions = UserSession.objects.filter(user_id=user_id).exists()
                    has_active = UserSession.objects.filter(user_id=user_id, is_active=True).exists()
                    if has_sessions and not has_active:
                        is_revoked = True

                if is_revoked:
                    return JsonResponse(
                        {"detail": "Session has been revoked. Please log in again."},
                        status=401
                    )
            except Exception:
                pass

        return self.get_response(request)
