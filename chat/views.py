from django.contrib.auth import get_user_model
from chat.models import Conversation, Participant, Message
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Message

User = get_user_model()


class StartPrivateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            other_user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        current_user = request.user

        if current_user == other_user:
            return Response({"error": "Cannot chat with yourself"}, status=400)

        # check đã có conversation chưa
        conversations = Conversation.objects.filter(type="PRIVATE")

        for convo in conversations:
            participants = convo.participant_set.all()
            if participants.count() == 2 and \
               set([p.user_id for p in participants]) == set([current_user.id, other_user.id]):
                return Response({
                    "conversation_id": convo.id,
                    "message": "Conversation already exists"
                })

        # 🔥 create new conversation
        conversation = Conversation.objects.create(
            type="PRIVATE",
            created_by=current_user
        )

        Participant.objects.create(user=current_user, conversation=conversation)
        Participant.objects.create(user=other_user, conversation=conversation)

        return Response({
            "conversation_id": conversation.id,
            "message": "Conversation created"
        })


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Lấy danh sách conversation mà user tham gia
        conversations = Conversation.objects.filter(participant__user=user)

        data = []
        for convo in conversations:
            other = Participant.objects.filter(
                conversation=convo
            ).exclude(user=user).first()

            last_msg = Message.objects.filter(conversation=convo).order_by('-created_at').first()

            res_item = {
                "id": convo.id,
                "name": other.user.full_name if other and other.user.full_name else (other.user.username if other else "Unknown"),
                "avatar": other.user.avatar.url if other and other.user.avatar else None,
                "username": other.user.username if other else None,
                "email": other.user.email if other else None,
                "lastMsg": last_msg.content if last_msg else "Bắt đầu cuộc trò chuyện",
                "last_msg_sender": last_msg.sender.username if last_msg else None,
                "last_msg_time": last_msg.created_at.strftime("%H:%M") if last_msg else None,
            }
            data.append(res_item)

        # Tùy chọn: Sắp xếp danh sách chat theo tin nhắn mới nhất lên đầu
        # data.sort(key=lambda x: x['last_msg_time'] or '', reverse=True)

        return Response(data)
# views.py
class SearchUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.GET.get("q", "")

        users = User.objects.filter(email__icontains=q).exclude(id=request.user.id)[:10]

        return Response([
            {
                "id": u.id,
                "email": u.email,
                "name": u.full_name,
                "avatar": u.avatar.url if u.avatar else None
            } for u in users
        ])

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).order_by("created_at")

        return Response([
            {
                "id": m.id,
                "sender": m.sender.username,
                "message": m.content,
                "created_at": m.created_at,
            }
            for m in messages
        ])