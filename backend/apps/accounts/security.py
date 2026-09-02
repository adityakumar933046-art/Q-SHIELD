import re
from django.utils import timezone
from apps.audit.models import AuditTrailRecord

def parse_user_agent(ua_string: str) -> dict:
    """
    Deterministic rule-based User-Agent parser.
    Extracts browser, OS, and device type without third-party dependencies.
    """
    if not ua_string:
        return {'browser': 'Unknown', 'os': 'Unknown', 'device_type': 'Desktop'}

    ua_lower = ua_string.lower()

    # Determine OS
    os_name = 'Unknown'
    if 'windows' in ua_lower:
        os_name = 'Windows'
    elif 'android' in ua_lower:
        os_name = 'Android'
    elif 'iphone' in ua_lower or 'ipad' in ua_lower or 'ipod' in ua_lower:
        os_name = 'iOS'
    elif 'macintosh' in ua_lower or 'mac os' in ua_lower:
        os_name = 'macOS'
    elif 'linux' in ua_lower:
        os_name = 'Linux'

    # Determine Browser
    browser_name = 'Unknown'
    if 'edg' in ua_lower or 'edge' in ua_lower:
        browser_name = 'Edge'
    elif 'chrome' in ua_lower and 'chromium' not in ua_lower:
        browser_name = 'Chrome'
    elif 'firefox' in ua_lower:
        browser_name = 'Firefox'
    elif 'safari' in ua_lower and 'chrome' not in ua_lower:
        browser_name = 'Safari'
    elif 'opera' in ua_lower or 'opr' in ua_lower:
        browser_name = 'Opera'

    # Determine Device Type
    device_type = 'Desktop'
    if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
        device_type = 'Mobile'
    elif 'tablet' in ua_lower or 'ipad' in ua_lower:
        device_type = 'Tablet'

    return {
        'browser': browser_name,
        'os': os_name,
        'device_type': device_type
    }


def evaluate_login_risk(user, ip_address: str, user_agent: str) -> tuple[str, list[str]]:
    """
    Deterministic Risk-Based Authentication Evaluation.
    Returns (risk_level, reason_list) where risk_level is 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'.
    """
    reasons = []
    risk_score = 0

    # 1. Failed attempts velocity
    if user.failed_login_attempts >= 3:
        risk_score += 30
        reasons.append(f"Multiple recent failed login attempts ({user.failed_login_attempts})")

    # 2. Novel device / user-agent check
    parsed = parse_user_agent(user_agent)
    known_devices = user.sessions.filter(is_active=True).values_list('user_agent', flat=True)
    if user_agent and known_devices.exists() and user_agent not in known_devices:
        risk_score += 25
        reasons.append(f"Unrecognized device or user-agent ({parsed['browser']} on {parsed['os']})")

    # 3. Novel IP address check
    known_ips = user.sessions.filter(is_active=True).values_list('ip_address', flat=True)
    if ip_address and known_ips.exists() and ip_address not in known_ips:
        risk_score += 15
        reasons.append(f"Unrecognized IP address ({ip_address})")

    # 4. High simultaneous active sessions
    active_sessions_count = user.sessions.filter(is_active=True).count()
    if active_sessions_count >= 5:
        risk_score += 30
        reasons.append(f"Unusually high simultaneous active sessions ({active_sessions_count})")

    # 5. Recent lockout history
    if user.lockout_until and user.lockout_until > timezone.now():
        risk_score += 50
        reasons.append("Account is currently under security lockout")

    # Determine risk level
    if risk_score >= 50:
        level = 'CRITICAL'
    elif risk_score >= 30:
        level = 'HIGH'
    elif risk_score >= 15:
        level = 'MEDIUM'
    else:
        level = 'LOW'

    # Emit audit event if risk is HIGH or CRITICAL
    if level in ['HIGH', 'CRITICAL']:
        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='SUSPICIOUS_LOGIN_ATTEMPT',
            target_resource='AUTH_SECURITY',
            details={
                'username': user.username,
                'role': user.role,
                'ip_address': ip_address,
                'risk_level': level,
                'reasons': reasons,
                'device_info': parsed
            }
        )

    return level, reasons
