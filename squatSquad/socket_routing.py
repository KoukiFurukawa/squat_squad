from django.urls import path
from .consumers import MyConsumer

websocket_urlpatterns = [
    path('ws/consumer', MyConsumer.as_asgi(), name="consumer" ),
]