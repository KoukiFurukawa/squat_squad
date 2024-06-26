from django.shortcuts import render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.core.cache import cache # キャッシュ

import redis
from contextlib import contextmanager
import os
import json

# Redisクライアントの設定
redis_url = os.environ.get("REDIS_URL", default='redis://localhost:6379/')
redis_client = redis.StrictRedis.from_url(redis_url, decode_responses=True)

# if DEBUG:

@contextmanager
def redis_lock(lock_key, timeout=10):
    lock = redis_client.lock(lock_key, timeout=timeout)
    acquired = lock.acquire(blocking=True)
    try:
        yield acquired
    finally:
        if acquired:
            lock.release()

def increment_shared_variable(amount=1):
    cache_key = 'shared_variable'
    lock_key = cache_key + '_lock'
    with redis_lock(lock_key):
        value = cache.get(cache_key, 0)
        value += amount
        cache.set(cache_key, value, timeout=None)
        return value


# Create your views here.
def index(request):
    # print(increment_shared_variable(3))
    return render(request, "squatSquad/index.html")

def total(request):
    if request.method == "GET":
        return render(request, "squatSquad/total.html")

# squat --------------------------------------------------------------
@csrf_exempt
def squat(request):
    if request.method == "GET":
        return render(request, "squatSquad/index.html")

# result --------------------------------------------------------------
@csrf_exempt
def result(request):
    if request.method == "GET":
        return render(request, "squatSquad/index.html")

# sample --------------------------------------------------------------
@csrf_exempt
def reservation(request):
    if request.method == "GET":
        return render(request, "frontend/index.html")
    
def isExercising(request):
    if request.method == "GET":
        cache_key = "left_time"
        value = cache.get(cache_key, 0)
        return JsonResponse({"left_time":value})

def cheering_red(request):
    if request.method == "POST":
        amount = 1
        cache_key = "count_cheer_red"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            value = cache.get(cache_key, 0)
            value += amount
            cache.set(cache_key, value, timeout=None)
            return JsonResponse({cache_key:value})
        
def cheering_white(request):
    if request.method == "POST":
        amount = 1
        cache_key = "count_cheer_white"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            value = cache.get(cache_key, 0)
            value += amount
            cache.set(cache_key, value, timeout=None)
            return JsonResponse({cache_key:value})
        
@csrf_exempt
def calculate_score_red(request):
    if request.method == "POST":
        req_body = json.loads(request.body.decode('utf-8'))
        squat = req_body["cnt"]
        cache_key = "total_score_red"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            total_score = cache.get(cache_key, 0)
            cheer = cache.get("count_cheer_red", 0)
            score = squat * (cheer // 100 + 1)
            total_score += score
            cache.set(cache_key, total_score, timeout=None)
            return JsonResponse({"score":score, "total": total_score})

@csrf_exempt
def calculate_score_white(request):
    if request.method == "POST":
        req_body = json.loads(request.body.decode('utf-8'))
        squat = req_body["cnt"]
        cache_key = "total_score_white"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            total_score = cache.get(cache_key, 0)
            cheer = cache.get("count_cheer_white", 0)
            score = squat * (cheer // 100 + 1)
            total_score += score
            cache.set(cache_key, total_score, timeout=None)
            return JsonResponse({"score":score, "total": total_score})

@csrf_exempt
def getTotalScore(request):
    if request.method == "POST":
        data = {}
        cache_key = "total_score_red"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            data["red"] = cache.get(cache_key, 0)
        
        cache_key = "total_score_white"
        lock_key = cache_key + "_lock"
        with redis_lock(lock_key):
            data["blue"] = cache.get(cache_key, 0)
            
        return JsonResponse(data)
    else:
        print("No")
        return HttpResponse("No")

# チーム判定 ---------------------------------------------------------------------
@csrf_exempt
def divide_teams(request):
    if request.method == "GET":
        return HttpResponse("only post")
    
    elif request.method == "POST":
        req_body = json.loads(request.body.decode('utf-8'))
        name = req_body["name"]
        score = int(req_body["score"])
        cache_key_red = "red_ability"
        cache_key_white = "white_ability"
        team = ""
        
        with redis_lock(cache_key_red + "_lock"):
            red_ability = cache.get(cache_key_red, 0)
            white_ability = cache.get(cache_key_white, 0)
            if red_ability > white_ability:
                red_ability += score
                team = "赤"
            else:
                white_ability += score
                team = "青"
            cache.set(cache_key_red, red_ability, timeout=None)
            cache.set(cache_key_white,white_ability, timeout=None)
            
        with redis_lock("user_lock"):
            user_data = get_dict_from_redis("user")
            if user_data is None:
                user_data = {}
            user_data[name] = { "score" : 0, "team" : team }
            set_dict_in_redis("user", user_data)
            
        return JsonResponse({ "team" : team })
    else:
        return HttpResponse("処理されていない例外です。")
        
def set_dict_in_redis(key, dictionary):
    cache.set(key, json.dumps(dictionary), timeout=None)

def get_dict_from_redis(key):
    value = cache.get(key)
    if value is not None:
        return json.loads(value)
    return None