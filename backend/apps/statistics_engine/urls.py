from rest_framework.routers import DefaultRouter
from .views import StatisticsEngineViewSet

router = DefaultRouter()
router.register(r'', StatisticsEngineViewSet, basename='statistics')

urlpatterns = router.urls
