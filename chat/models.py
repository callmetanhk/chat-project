from django.db import models
from accounts.models import User


class Conversation(models.Model):
    TYPE_CHOICES = (
        ('PRIVATE', 'Private'),
        ('GROUP', 'Group'),
    )

    name = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)

    avatar = models.ImageField(upload_to='conversation/', null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # 🔥 dùng để sort

    def __str__(self):
        return f"{self.name or 'Conversation'} ({self.type})"

class Participant(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MEMBER', 'Member'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')

    is_active = models.BooleanField(default=True)  # 🔥 rời nhóm hay chưa
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'conversation')

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)

    content = models.TextField(blank=True)

    reply_to = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )  # 🔥 reply message

    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['conversation', '-created_at']),  # 🔥 tối ưu query
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.conversation.updated_at = self.created_at
        self.conversation.save()

class MessageStatus(models.Model):
    STATUS_CHOICES = (
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('SEEN', 'Seen'),
    )

    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('message', 'user')  # 🔥 tránh duplicate

class Attachment(models.Model):
    message = models.ForeignKey(
        Message,
        related_name="attachments",
        on_delete=models.CASCADE
    )

    file_url = models.URLField()
    file_type = models.CharField(max_length=50)  # image, file, video...

    created_at = models.DateTimeField(auto_now_add=True)

