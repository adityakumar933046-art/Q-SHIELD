from rest_framework.routers import DefaultRouter
from .views import QuantumEngineViewSet

router = DefaultRouter()
router.register(r'', QuantumEngineViewSet, basename='quantum-engine')

urlpatterns = router.urls
