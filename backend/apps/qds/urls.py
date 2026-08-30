from rest_framework.routers import DefaultRouter
from .views import QDSViewSet, SigningRequestViewSet

router = DefaultRouter()
router.register(r'requests', SigningRequestViewSet, basename='signing-request')
router.register(r'', QDSViewSet, basename='qds')

urlpatterns = router.urls

