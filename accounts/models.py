import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
import datetime

class VGPUser(AbstractUser):
    uuid = models.CharField(max_length=50, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100, null=False, blank=False)
    mobno = models.CharField(max_length=15, null=False, blank=False)
    org = models.CharField(max_length=100, null=True, blank=True)
    idt = models.CharField(max_length=50, null=False, blank=False)
    idno = models.CharField(max_length=20, null=False, blank=False)
    deptt = models.CharField(max_length=100, null=True, blank=True)
    desig = models.CharField(max_length=100, null=True, blank=True)
    rcode = models.CharField(max_length=20, null=True, blank=True)
    gndr = models.CharField(max_length=20, null=False, blank=False)
    age = models.IntegerField(null=False, blank=False)
    
    
    def __str__(self):
        return self.username
    
        
    def to_dict(self):
        result = {}
        for field in self._meta.fields:
            value = getattr(self, field.name)
            if isinstance(value, uuid.UUID):
                result[field.name] = str(value)
            elif isinstance(value, (datetime.datetime, datetime.date)):
                result[field.name] = value.isoformat()  # Converts to string like '2025-06-13T23:59:59'
            elif hasattr(value, 'url'):  # Handle ImageFieldFile and FileField objects
                result[field.name] = value.url if value else None
            else:
                result[field.name] = value
        return result