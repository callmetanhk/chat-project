
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields =  ['username', 'email', 'full_name', 'phone', 'password']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            phone=validated_data['phone'],
            password=validated_data['password']
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):

    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = ['username', 'full_name', 'phone', 'email', 'avatar']

        read_only_fields = ['username', 'email']

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            # Fallback nếu không có request
            return f"http://localhost:8000{obj.avatar.url}"
        return None