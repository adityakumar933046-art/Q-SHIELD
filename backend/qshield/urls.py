from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'system': 'Q-SHIELD Threat Detection Platform',
        'version': '1.0.0-SIH26141',
        'quantum_simulation': 'Qiskit Teleportation Engine Operational',
        'detection_mode': 'Statistical Physics & Hypothesis Testing (Non-ML)'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "status": "online",
        "service": "Q-SHIELD API",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health/",
            "auth": "/api/auth/",
            "organizations": "/api/organizations/",
            "qds": "/api/qds/",
            "quantum-engine": "/api/quantum-engine/",
            "verification": "/api/verification/",
            "statistics": "/api/statistics/",
            "threats": "/api/threats/",
            "attack-simulator": "/api/attack-simulator/",
            "incidents": "/api/incidents/",
            "analytics": "/api/analytics/",
            "audit": "/api/audit/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/health/', health_check, name='health_check'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/qds/', include('apps.qds.urls')),
    path('api/quantum-engine/', include('apps.quantum_engine.urls')),
    path('api/verification/', include('apps.verification.urls')),
    path('api/statistics/', include('apps.statistics_engine.urls')),
    path('api/threats/', include('apps.threat_detection.urls')),
    path('api/attack-simulator/', include('apps.attack_simulator.urls')),
    path('api/incidents/', include('apps.incidents.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/audit/', include('apps.audit.urls')),
]
