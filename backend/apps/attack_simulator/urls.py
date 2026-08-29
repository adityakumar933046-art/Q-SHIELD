from rest_framework.routers import DefaultRouter
from .views import AttackSimulatorViewSet

router = DefaultRouter()
router.register(r'', AttackSimulatorViewSet, basename='attack-simulator')

urlpatterns = router.urls
