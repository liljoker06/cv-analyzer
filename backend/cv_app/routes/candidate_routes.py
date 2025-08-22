from django.urls import path
from cv_app.views.candidate_views import get_candidates, get_candidate

urlpatterns = [
    path('candidates/', get_candidates, name='get_candidates'),
    path('candidates/<str:candidate_id>/', get_candidate, name='get_candidate'),
]
