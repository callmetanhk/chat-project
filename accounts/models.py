from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    avatar = models.ImageField(upload_to='avatar/', null= True, blank= True)
    
    REQUIRED_FIELDS = ['email', 'full_name', 'phone']
    
    def __str__(self):
        return self.username