from django.contrib import admin

# Register your models here.
# chat/admin.py
from django.contrib import admin
from .models import Conversation, Participant, Message

# 1. Quản lý Participant ngay trong trang Conversation
class ParticipantInline(admin.TabularInline):
    model = Participant
    extra = 0  # Không hiện sẵn các dòng trống thừa
    autocomplete_fields = ['user'] # Hiển thị thanh tìm kiếm cho user nếu UserAdmin có search_fields

# 2. Cấu hình cho Conversation
@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'created_by', 'get_participants', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('id', 'participant__user__username', 'participant__user__full_name')
    inlines = [ParticipantInline]
    readonly_fields = ('created_at',)

    # Hàm hiển thị danh sách người tham gia ở cột ngoài danh sách
    def get_participants(self, obj):
        return ", ".join([p.user.username for p in obj.participant_set.all()])
    get_participants.short_description = "Participants"

# 3. Cấu hình cho Message
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'get_conversation', 'content_preview', 'created_at')
    list_filter = ('created_at', 'sender')
    search_fields = ('content', 'sender__username', 'conversation__id')
    readonly_fields = ('created_at',)

    # Hiển thị xem tin nhắn này thuộc cuộc hội thoại nào
    def get_conversation(self, obj):
        return f"Convo #{obj.conversation.id} ({obj.conversation.type})"
    get_conversation.short_description = "Conversation"

    # Xem trước nội dung tin nhắn ngắn gọn
    def content_preview(self, obj):
        if len(obj.content) > 50:
            return obj.content[:50] + "..."
        return obj.content
    content_preview.short_description = "Message Content"

# 4. Cấu hình cho Participant (Nếu muốn quản lý riêng lẻ)
@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'conversation_id', 'joined_at')
    search_fields = ('user__username', 'conversation__id')