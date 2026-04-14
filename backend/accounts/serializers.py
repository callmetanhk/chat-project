
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


from .models import User

class UserProfileSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.avatar:

            request = self.context.get('request')
            if request:
                ret['avatar'] = request.build_absolute_uri(instance.avatar.url)
            else:
                ret['avatar'] = f"http://localhost:8000{instance.avatar.url}"
        return ret

    class Meta:
        model = User
        fields = ['full_name', 'phone', 'email', 'avatar']
        # read_only_fields = ['email']