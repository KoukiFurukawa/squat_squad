from django.urls import path
from .views import *

urlpatterns = [
    path("", index, name="index"),
    path("total", total, name="total"),
    path("isExercising", isExercising, name="isExercising"),
    path("cheering_red", cheering_red, name="cheering_red"),
    path("cheering_white", cheering_white, name="cheering_white"),
]