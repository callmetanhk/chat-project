from rest_framework import generics, status
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from common.response import success_response, error_response


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()

        return success_response(
            message="User registered successfully",
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            status=status.HTTP_201_CREATED
        )
        
class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return error_response(
                message="Username and password are required",
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if not user:
            return error_response(
                message="Invalid credentials",
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return success_response(
            message="Login successful",
            data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone": user.phone
                }
            }
        )
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            return success_response(message="Logout successful")

        except Exception:
            return error_response(
                message="Invalid token",
                status=400
            )
            
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return success_response(
            data={
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone


            }
        )

    def put(self, request):
        user = request.user
        user.full_name = request.data.get("full_name", user.full_name)
        user.phone = request.data.get("phone", user.phone)

