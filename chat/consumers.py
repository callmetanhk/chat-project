import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils.timezone import now
from .models import Conversation, Message, Participant


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        # Lấy conversation_id an toàn từ kwargs
        self.conversation_id = self.scope["url_route"]["kwargs"].get("conversation_id")

        # 1. Kiểm tra Routing
        if not self.conversation_id:
            await self.close(code=4000)
            return

        self.room_group_name = f"chat_{self.conversation_id}"

        # 2. Kiểm tra Authentication (Phải có JWT Middleware ở asgi.py)
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        # 3. Kiểm tra Authorization (Quyền truy cập phòng)
        is_participant = await self.check_participant()
        if not is_participant:
            await self.close(code=4003)
            return

        # 4. Tham gia vào nhóm Chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Rời khỏi nhóm Chat khi ngắt kết nối
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_content = data.get("message", "").strip()

            if not message_content:
                return

            # Lưu tin nhắn vào Database
            msg = await self.save_message(message_content)

            # Gửi tin nhắn tới toàn bộ người trong nhóm
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": msg.content,
                    "sender": self.user.username,
                    "message_id": msg.id,
                    "created_at": msg.created_at.isoformat(),  # Format chuẩn ISO cho Frontend
                }
            )
        except Exception as e:
            print(f"Error receiving message: {e}")

    async def chat_message(self, event):
        # Gửi dữ liệu thực tế tới WebSocket của Client
        await self.send(text_data=json.dumps({
            "id": event["message_id"],
            "message": event["message"],
            "sender": event["sender"],
            "created_at": event["created_at"]
        }))

    # --- DATABASE OPERATIONS ---

    @database_sync_to_async
    def check_participant(self):
        """Kiểm tra user có quyền trong hội thoại này không"""
        return Participant.objects.filter(
            user=self.user,
            conversation_id=self.conversation_id,
            is_active=True
        ).exists()

    @database_sync_to_async
    def save_message(self, content):
        """Lưu tin nhắn và cập nhật thời gian hội thoại (Atomically)"""
        # Tạo tin nhắn mới
        msg = Message.objects.create(
            sender=self.user,
            conversation_id=self.conversation_id,
            content=content
        )

        # Cập nhật timestamp cho hội thoại để đẩy lên đầu danh sách (Last Active)
        Conversation.objects.filter(id=self.conversation_id).update(
            updated_at=now()
        )

        return msg