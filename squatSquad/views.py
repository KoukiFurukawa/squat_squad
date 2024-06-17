from django.shortcuts import render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.core.cache import cache # キャッシュ

import redis
from contextlib import contextmanager
import os

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
        cache.set(cache_key, value)
        return value


# Create your views here.
def index(request):
    # print(increment_shared_variable(3))
    return HttpResponse("テスト用")


# sample --------------------------------------------------------------
@csrf_exempt
def reservation(request):
    if request.method == "GET":
        return render(request, "frontend/index.html")