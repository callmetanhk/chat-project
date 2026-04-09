from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    # Hiển thị ngoài list
    list_display = (
        'id',
        'username',
        'email',
        'full_name',
        'phone',
        'is_staff',
        'is_active',
    )

    # Search
    search_fields = ('username', 'email', 'full_name', 'phone')

    # Filter bên phải
    list_filter = ('is_staff', 'is_active', 'is_superuser')

    # Sắp xếp
    ordering = ('-id',)

    # Field hiển thị khi edit
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Thông tin cá nhân', {
            'fields': ('email', 'full_name', 'phone', 'avatar')
        }),
        ('Phân quyền', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Ngày tháng', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    # Field khi tạo user mới
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'full_name', 'phone', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    )