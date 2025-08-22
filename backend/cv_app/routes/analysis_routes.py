from django.urls import path
from cv_app.views.analysis_views import get_analysis_results, get_analysis_result, get_candidate_cv

urlpatterns = [
    path('analysis-results/', get_analysis_results, name='get_analysis_results'),
    path('analysis-results/<str:analysis_id>/', get_analysis_result, name='get_analysis_result'),
    path('candidate-cv/<str:candidate_id>/', get_candidate_cv, name='get_candidate_cv'),
]
