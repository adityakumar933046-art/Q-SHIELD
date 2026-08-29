from rest_framework.routers import DefaultRouter
from .views import SecurityIncidentViewSet

router = DefaultRouter()
router.register(r'', SecurityIncidentViewSet, basename='incidents')

urlpatterns = router.urls
