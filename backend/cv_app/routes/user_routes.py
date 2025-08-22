from django.urls import path
from cv_app.views.user_views import (
    CreateRecruiterView,
    UpdateUserView,
    DeleteUserView,
    LoginView,
    GetAllUsersView,
    GetCurrentUserView
)

urlpatterns = [
    path("users/login/", LoginView.as_view(), name="login"),
    path("users/create-recruiter/", CreateRecruiterView.as_view(), name="create_recruiter"),
    path("users/<str:user_id>/", UpdateUserView.as_view(), name="update_user"),
    path("users/<str:user_id>/delete/", DeleteUserView.as_view(), name="delete_user"),
    path("users/", GetAllUsersView.as_view(), name="get_all_users"),
    path("users/current/", GetCurrentUserView.as_view(), name="get_current_user"),
]
