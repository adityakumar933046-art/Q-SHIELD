from rest_framework.routers import DefaultRouter
from .views import QDSViewSet

router = DefaultRouter()
router.register(r'', QDSViewSet, basename='qds')

urlpatterns = router.urls
