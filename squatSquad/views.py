from django.shortcuts import render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def index(request):
    return HttpResponse("テスト用")

def total(request):
    if request.method == "GET":
        return render(request, "squatSquad/total.html")

# sample --------------------------------------------------------------
@csrf_exempt
def reservation(request):
    if request.method == "GET":
        return render(request, "frontend/index.html")