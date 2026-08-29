from rest_framework.routers import DefaultRouter
from .views import AuditTrailViewSet

router = DefaultRouter()
router.register(r'', AuditTrailViewSet, basename='audit')

urlpatterns = router.urls
