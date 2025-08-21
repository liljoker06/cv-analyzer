from django.urls import path
from cv_app.views.extract_data_analysis_views import LaunchAnalysisView

urlpatterns = [
    path("extract/launch/", LaunchAnalysisView.as_view(), name="launch_analysis"),
]
