from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('home/', views.home, name='home'),
    path('home/add-update-visit/', views.add_update_visit, name='add_update_visit'),
    path('home/add-update-visit/<str:id>/', views.add_update_visit, name='add_update_visit'),
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.custom_logout_view, name='logout'),
    path("captcha/", include("captcha.urls")),  # This is required for CAPTCHA
    path("refresh_captcha/", views.refresh_captcha, name="refresh_captcha"),
    path('home/update-profile/', views.update_profile, name='update_profile'),
    
]
