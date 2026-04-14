from django.urls import path
from .views import StartPrivateChatView, ConversationListView, SearchUserView, MessageListView, SendMessageView

urlpatterns = [
    path("start-chat/", StartPrivateChatView.as_view()),
    path("conversations/", ConversationListView.as_view()),
    path("search-user/", SearchUserView.as_view()),
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
    path("send-message/", SendMessageView.as_view()),
]