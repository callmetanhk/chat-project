from django.contrib.auth import get_user_model
from chat.models import Conversation, Participant, Message
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Message, Attachment
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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

        return Response(data)

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
        ).prefetch_related('attachments').order_by("created_at")

        return Response([
            {
                "id": m.id,
                "sender": m.sender.username,
                "message": m.content,
                "created_at": m.created_at,

                "attachments": [
                    {
                        "id": att.id,
                        "file_url": request.build_absolute_uri(att.file.url),
                        "file_type": att.file_type,
                        "file_name": att.file_name
                    } for att in m.attachments.all()
                ]
            }
            for m in messages
        ])

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        convo_id = request.data.get("conversation_id")
        content = request.data.get("content", "")
        files = request.FILES.getlist("files")

        if not convo_id:
            return Response({"error": "Conversation ID is required"}, status=400)

        # 1. Lưu tin nhắn vào DB
        message = Message.objects.create(
            sender=request.user,
            conversation_id=convo_id,
            content=content
        )

        # 2. Lưu file và tạo list data
        attachment_data = []
        for f in files:
            att = Attachment.objects.create(
                message=message,
                file=f,
                file_name=f.name,
                file_type=f.content_type
            )
            attachment_data.append({
                "id": att.id,
                "file_url": request.build_absolute_uri(att.file.url),
                "file_type": att.file_type,
                "file_name": att.file_name
            })

        # 3. Gửi tín hiệu Real-time qua WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{convo_id}",
            {
                "type": "chat_message", # Gọi hàm chat_message trong consumers.py
                "id": message.id,
                "message": message.content,
                "sender": message.sender.username,
                "attachments": attachment_data, # 🔥 Gửi kèm list file ở đây
                "created_at": message.created_at.isoformat(),
            }
        )

        return Response({"status": "success"}, status=201)