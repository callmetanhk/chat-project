from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.db.models import Subquery, OuterRef, Q
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from chat.models import Conversation, Participant, Message, Attachment

User = get_user_model()


class StartPrivateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        current_user = request.user

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        if current_user.email == email:
            return Response({"error": "Cannot chat with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra xem hội thoại đã tồn tại chưa
        existing_convo = Conversation.objects.filter(
            type="PRIVATE",
            participant__user=current_user
        ).filter(
            participant__user=other_user
        ).first()

        if existing_convo:
            return Response({
                "conversation_id": existing_convo.id,
                "message": "Conversation already exists"
            }, status=status.HTTP_200_OK)

        try:
            with transaction.atomic():
                conversation = Conversation.objects.create(
                    type="PRIVATE",
                    created_by=current_user
                )
                Participant.objects.bulk_create([
                    Participant(user=current_user, conversation=conversation),
                    Participant(user=other_user, conversation=conversation)
                ])

            return Response({
                "conversation_id": conversation.id,
                "message": "Conversation created"
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": "Could not create conversation"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        latest_message = Message.objects.filter(conversation=OuterRef('pk')).order_by('-created_at')

        conversations = Conversation.objects.filter(
            participant__user=user
        ).annotate(
            last_msg_content=Subquery(latest_message.values('content')[:1]),
            last_msg_sender_username=Subquery(latest_message.values('sender__username')[:1]),
            last_msg_created_at=Subquery(latest_message.values('created_at')[:1]),
        ).prefetch_related('participant_set__user').order_by('-last_msg_created_at')

        data = []
        for convo in conversations:
            other_user = None
            for p in convo.participant_set.all():
                if p.user_id != user.id:
                    other_user = p.user
                    break

            name = "Unknown"
            avatar = None
            if other_user:
                name = other_user.full_name or other_user.username
                avatar = other_user.avatar.url if other_user.avatar else None

            data.append({
                "id": convo.id,
                "name": name,
                "avatar": avatar,
                "username": other_user.username if other_user else None,
                "email": other_user.email if other_user else None,
                "lastMsg": convo.last_msg_content or "Bắt đầu cuộc trò chuyện",
                "last_msg_sender": convo.last_msg_sender_username,
                "last_msg_time": convo.last_msg_created_at.strftime("%H:%M") if convo.last_msg_created_at else None,
                "updated_at": convo.last_msg_created_at,
            })

        return Response(data)


class SearchUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.GET.get("q", "").strip()

        # Không search nếu query quá ngắn
        if len(q) < 2:
            return Response([])

        users = User.objects.filter(
            Q(email__icontains=q) | Q(full_name__icontains=q)
        ).exclude(id=request.user.id)[:10]

        return Response([
            {
                "id": u.id,
                "email": u.email,
                "name": u.full_name or u.username,
                "avatar": u.avatar.url if getattr(u, 'avatar', None) else None
            } for u in users
        ])


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        # Kiểm tra xem user có nằm trong conversation này không
        is_participant = Participant.objects.filter(
            conversation_id=conversation_id,
            user=request.user
        ).exists()

        if not is_participant:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).select_related('sender').prefetch_related('attachments').order_by("created_at")

        # Khuyên dùng DRF Serializer ở đây thay vì list comprehension
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
            } for m in messages
        ])


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        convo_id = request.data.get("conversation_id")
        content = request.data.get("content", "").strip()
        files = request.FILES.getlist("files")

        if not convo_id:
            return Response({"error": "Conversation ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not content and not files:
            return Response({"error": "Message content or files are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Đảm bảo user có quyền gửi tin vào conversation này
        if not Participant.objects.filter(conversation_id=convo_id, user=request.user).exists():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                message = Message.objects.create(
                    sender=request.user,
                    conversation_id=convo_id,
                    content=content
                )

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

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"chat_{convo_id}",
                {
                    "type": "chat_message",
                    "id": message.id,
                    "message": message.content,
                    "sender": message.sender.username,
                    "attachments": attachment_data,
                    "created_at": message.created_at.isoformat(),
                }
            )

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)