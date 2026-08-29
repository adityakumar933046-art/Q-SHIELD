from rest_framework.routers import DefaultRouter
from .views import ThresholdRuleViewSet, ThreatEvaluationViewSet

router = DefaultRouter()
router.register(r'rules', ThresholdRuleViewSet, basename='threat-rules')
router.register(r'evaluations', ThreatEvaluationViewSet, basename='threat-evaluations')

urlpatterns = router.urls
