from django.contrib.auth.decorators import login_required
from django.urls import path

from appls.authentication.views import HomeView, LogoutView, LoginView, myfirstview

# app_name = 'erp'

urlpatterns = [
    path('', LoginView.as_view(), name='login'),
    path('home/', login_required(HomeView.as_view()), name='insoft_home'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
