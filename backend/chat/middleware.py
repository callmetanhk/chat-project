from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async
def get_user(token):
    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token['user_id'])
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Lấy token từ query string (?token=...)
        query_params = dict(parse_qsl(scope['query_string'].decode()))
        token = query_params.get('token')

        scope['user'] = await get_user(token) if token else AnonymousUser()
        return await self.app(scope, receive, send)


# Helper function để parse query string
from urllib.parse import parse_qsl