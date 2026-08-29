from django.urls import path
from .views import SecurityAnalyticsDashboardView

urlpatterns = [
    path('summary/', SecurityAnalyticsDashboardView.as_view(), name='analytics-summary'),
]
