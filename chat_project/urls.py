from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.urls import path
from chat_project import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/chat/', include('chat.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)