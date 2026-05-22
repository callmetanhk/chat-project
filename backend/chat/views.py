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
from common.response import success_response, error_response
from chat.models import Conversation, Participant, Message, Attachment

User = get_user_model()


class StartPrivateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        current_user = request.user

        if not email:
            return error_response(
                message="Email is required",
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_user.email == email:
            return error_response(
                message="Cannot chat with yourself",
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = User.objects.get(email=email)

        except User.DoesNotExist:
            return error_response(
                message="User not found",
                status=status.HTTP_404_NOT_FOUND
            )

        # Kiểm tra xem hội thoại 1-1 đã tồn tại chưa
        existing_convo = (
            Conversation.objects.filter(
                type="PRIVATE",
                participant__user=current_user
            )
            .filter(
                participant__user=other_user
            )
            .first()
        )

        if existing_convo:
            return success_response(
                message="Conversation already exists",
                data={
                    "conversation_id": existing_convo.id,
                },
                status=status.HTTP_200_OK
            )

        try:
            with transaction.atomic():
                conversation = Conversation.objects.create(
                    type="PRIVATE",
                    created_by=current_user
                )

                Participant.objects.bulk_create([
                    Participant(
                        user=current_user,
                        conversation=conversation
                    ),
                    Participant(
                        user=other_user,
                        conversation=conversation
                    )
                ])

            return success_response(
                message="Conversation created",
                data={
                    "conversation_id": conversation.id,
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return error_response(
                message="Could not create conversation",
                errors=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        latest_message = (
            Message.objects
            .filter(conversation=OuterRef('pk'))
            .order_by('-created_at')
        )

        conversations = (
            Conversation.objects
            .filter(participant__user=user)
            .annotate(
                last_msg_content=Subquery (
                    latest_message.values('content')[:1]
                ),

                last_msg_sender_username=Subquery(
                    latest_message.values('sender__username')[:1]
                ),

                last_msg_created_at=Subquery(
                    latest_message.values('created_at')[:1]
                ),
            )
            .prefetch_related(
                'participant_set__user'
            )
            .order_by('-updated_at')
        )

        data = []

        for convo in conversations:

            participants = convo.participant_set.all()

            # =========================
            # PRIVATE CHAT
            # =========================
            if convo.type == "PRIVATE":

                other_user = next(
                    (
                        p.user
                        for p in participants
                        if p.user_id != user.id
                    ),
                    None
                )

                name = (
                    other_user.full_name
                    or other_user.username
                ) if other_user else "Unknown"

                avatar = (
                    other_user.avatar.url
                    if other_user and other_user.avatar
                    else None
                )

                username = (
                    other_user.username
                    if other_user else None
                )

                email = (
                    other_user.email
                    if other_user else None
                )

            # =========================
            # GROUP CHAT
            # =========================
            else:

                name = convo.name or "Group Chat"

                avatar = (
                    convo.avatar.url
                    if convo.avatar
                    else None
                )

                username = None
                email = None

            data.append({
                "id": convo.id,

                "type": convo.type,

                "name": name,

                "avatar": avatar,

                "username": username,

                "email": email,

                "participants": [
                    {
                        "id": p.user.id,
                        "username": p.user.username,
                        "full_name": p.user.full_name,
                        "avatar": (
                            p.user.avatar.url
                            if p.user.avatar
                            else None
                        ),
                    }
                    for p in participants
                ],

                "lastMsg": (
                    convo.last_msg_content
                    or "Bắt đầu cuộc trò chuyện"
                ),

                "last_msg_sender":
                    convo.last_msg_sender_username,

                "last_msg_time":
                    convo.last_msg_created_at,

                "updated_at":
                    convo.updated_at,
            })

        return success_response(
            message="Conversation list fetched successfully",
            data=data,
            status=status.HTTP_200_OK
        )


class SearchUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q", "").strip()

        # Không search nếu query quá ngắn
        if len(query) < 2:
            return success_response(
                message="Query too short",
                data=[],
                status=status.HTTP_200_OK
            )

        users = (
            User.objects
            .filter(
                Q(email__icontains=query) |
                Q(full_name__icontains=query)
            )
            .exclude(id=request.user.id)[:10]
        )

        data = [
            {
                "id": user.id,
                "email": user.email,
                "name": user.full_name or user.username,
                "avatar": (
                    user.avatar.url
                    if user.avatar else None
                )
            }
            for user in users
        ]

        return success_response(
            message="Users fetched successfully",
            data=data,
            status=status.HTTP_200_OK
        )


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):

        is_participant = Participant.objects.filter(
            conversation_id=conversation_id,
            user=request.user
        ).exists()

        if not is_participant:
            return error_response(
                message="Permission denied",
                status=status.HTTP_403_FORBIDDEN
            )
        messages = (
            Message.objects
            .filter(conversation_id=conversation_id)
            .select_related(
                'sender',
                'reply_to',
                'reply_to__sender'
            )
            .prefetch_related('attachments')
            .order_by("created_at")
        )
        data = []
        for message in messages:
            attachments = []
            for attachment in message.attachments.all():
                file_url = None
                if attachment.file:
                    try:
                        file_url = request.build_absolute_uri(
                            attachment.file.url
                        )
                    except Exception:
                        file_url = None

                attachments.append({
                    "id": attachment.id,
                    "file_url": file_url,
                    "file_type": attachment.file_type,
                    "file_name": attachment.file_name,
                    "is_image":
                        attachment.file_type.startswith("image/")
                        if attachment.file_type else False
                })
            reply_data = None

            if message.reply_to:
                reply_data = {
                    "id": message.reply_to.id,
                    "message": message.reply_to.content,
                    "sender": message.reply_to.sender.username
                }
            sender_avatar = None
            if message.sender.avatar:
                try:
                    sender_avatar = request.build_absolute_uri(
                        message.sender.avatar.url
                    )
                except Exception:
                    sender_avatar = None
            data.append({
                "id": message.id,
                "message": message.content,
                "created_at":  message.created_at,
                "is_me": message.sender_id == request.user.id,
                "is_edited": message.is_edited,
                "is_deleted": message.is_deleted,
                "sender": {
                    "id": message.sender.id,
                    "username": message.sender.username,
                    "full_name": message.sender.full_name,
                    "avatar": sender_avatar
                },
                "reply_to":
                    reply_data,
                "attachments":
                    attachments
            })

        return success_response(
            message="Messages fetched successfully",
            data=data,
            status=status.HTTP_200_OK
        )


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        convo_id = request.data.get("conversation_id")
        content = request.data.get("content", "").strip()
        files = request.FILES.getlist("files")

        if not convo_id:
            return error_response(
                message="Conversation ID is required",
                status=status.HTTP_400_BAD_REQUEST
            )

        if not content and not files:
            return error_response(
                message="Message content or files are required",
                status=status.HTTP_400_BAD_REQUEST
            )

        # Đảm bảo user có quyền gửi tin vào conversation này
        is_participant = Participant.objects.filter(
            conversation_id=convo_id,
            user=request.user
        ).exists()

        if not is_participant:
            return error_response(
                message="Permission denied",
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with transaction.atomic():

                message = Message.objects.create(
                    sender=request.user,
                    conversation_id=convo_id,
                    content=content
                )

                attachment_data = []

                for file in files:

                    attachment = Attachment.objects.create(
                        message=message,
                        file=file,
                        file_name=file.name,
                        file_type=file.content_type
                    )

                    file_url = None

                    if attachment.file:
                        try:
                            file_url = request.build_absolute_uri(
                                attachment.file.url
                            )
                        except Exception:
                            file_url = None

                    attachment_data.append({
                        "id": attachment.id,
                        "file_url": file_url,
                        "file_type": attachment.file_type,
                        "file_name": attachment.file_name
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

            return success_response(
                message="Message sent successfully",
                data={
                    "message_id": message.id
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return error_response(
                message="Could not send message",
                errors=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CreateGroupChatView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        name = request.data.get("name", "").strip()
        participant_ids = request.data.getlist("participants")
        avatar = request.FILES.get("avatar")

        if not name:
            return error_response(
                message="Group name is required",
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(participant_ids) < 2:
            return error_response(
                message="At least 2 participants are required",
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            participants = User.objects.filter(
                id__in=participant_ids
            ).exclude(
                id=request.user.id
            )

            if participants.count() != len(set(participant_ids)):
                return error_response(
                    message="Some participants do not exist",
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():

                conversation = Conversation.objects.create(
                    name=name,
                    type="GROUP",
                    avatar=avatar,
                    created_by=request.user
                )

                participant_objects = [
                    Participant(
                        user=request.user,
                        conversation=conversation,
                        role="ADMIN"
                    )
                ]

                participant_objects.extend([
                    Participant(
                        user=user,
                        conversation=conversation,
                        role="MEMBER"
                    )
                    for user in participants
                ])

                Participant.objects.bulk_create(
                    participant_objects
                )

            avatar_url = None

            if conversation.avatar:
                try:
                    avatar_url = request.build_absolute_uri(
                        conversation.avatar.url
                    )
                except Exception:
                    avatar_url = None

            return success_response(
                message="Group chat created successfully",
                data={
                    "conversation_id": conversation.id,
                    "name": conversation.name,
                    "avatar": avatar_url,
                    "type": conversation.type,
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return error_response(
                message="Could not create group chat",
                errors=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )