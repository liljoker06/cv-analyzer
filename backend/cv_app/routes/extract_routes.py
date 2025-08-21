from django.urls import path
from cv_app.views.extract_data_analysis_views import parse_uploaded_cv

urlpatterns = [
    path('parse-cv/', parse_uploaded_cv, name='parse_uploaded_cv'),
]
