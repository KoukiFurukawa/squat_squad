from django.urls import path
from .views import *

urlpatterns = [
    path("", index, name="index"),
    path("total", total, name="total"),
    path("squat/", squat, name="squat"),
    path("result", result, name="result"),
    path("isExercising", isExercising, name="isExercising"),
    path("cheering_red", cheering_red, name="cheering_red"),
    path("cheering_white", cheering_white, name="cheering_white"),
    path("calculate_score_red", calculate_score_red, name="calculate_score_red"),
    path("calculate_score_white", calculate_score_white, name="calculate_score_white"),
    path("readqr", index, name="readqr"),
    path("squat", index, name="squat"),
    path("total_score", getTotalScore, name="total_score"),
]