from django.conf.urls.static import static
from django.urls import path

from chat_project import settings
from .views import StartPrivateChatView, ConversationListView, SearchUserView, MessageListView

urlpatterns = [
    path("start-chat/", StartPrivateChatView.as_view()),
    path("conversations/", ConversationListView.as_view()),
    path("search-user/", SearchUserView.as_view()),
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
]