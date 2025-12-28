from django.db import models
import uuid
import datetime

# Create your models here.
class Visit(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    uid = models.CharField(max_length=50)
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
    
    vsttype = models.CharField(max_length=50, null=True, blank=True)
    vstpurpose = models.TextField(null=True, blank=True)
    vstdeptt = models.CharField(max_length=100, null=True, blank=True)
    vstname = models.CharField(max_length=100, null=True, blank=True)
    vstmobno = models.CharField(max_length=15, null=True, blank=True) 
    vstemail = models.EmailField(max_length=150, null=True, blank=True)
    vstdates = models.CharField(max_length=15, null=True, blank=True) 
    vststartdt = models.DateField(max_length=15, null=True, blank=True) 
    vstenddt = models.DateField(max_length=15, null=True, blank=True) 
    vstdays = models.IntegerField(null=True, blank=True) 
    vehicle = models.CharField(max_length=10, null=True, blank=True)
    vehicleno = models.CharField(max_length=50, null=True, blank=True)
    vehicletype = models.CharField(max_length=50, null=True, blank=True)  
    drivername = models.CharField(max_length=100, null=True, blank=True)
    driveridno = models.CharField(max_length=50, null=True, blank=True) 
    
    vstcreatedon = models.DateTimeField(null=True, blank=True)
    vstupdatedon = models.DateTimeField(null=True, blank=True)
    
    vstmembers = models.TextField(null=True, blank=True)  # JSON string of members
    vstmemberscount = models.IntegerField(null=True, blank=True)
    
    vstipaddress = models.CharField(max_length=50, null=True, blank=True) 
    vstuseragent = models.CharField(max_length=150, null=True, blank=True)
    
    vststatus = models.CharField(max_length=50, null=True, blank=True)
    vstremarks = models.TextField(null=True, blank=True)
    vststatusupdby = models.CharField(max_length=100, null=True, blank=True)
    vststatusupdon = models.DateTimeField(null=True, blank=True)
    
    def to_dict(self):
        result = {}
        for field in self._meta.fields:
            value = getattr(self, field.name)
            if isinstance(value, uuid.UUID):
                result[field.name] = str(value)
            elif isinstance(value, (datetime.datetime, datetime.date)):
                result[field.name] = value.isoformat()  # Converts to string like '2025-06-13T23:59:59'
            else:
                result[field.name] = value
        return result