from django.urls import path
from .views import (
    DocumentUploadView,
    DocumentListView,
    DocumentDetailView,
    DocumentDownloadView,
    DocumentConfirmReviewView
)

urlpatterns = [
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('', DocumentListView.as_view(), name='document-list'),
    path('<uuid:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('<uuid:pk>/download/', DocumentDownloadView.as_view(), name='document-download'),
    path('<uuid:pk>/confirm-review/', DocumentConfirmReviewView.as_view(), name='document-confirm-review'),
]
