from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import VGPUser

@admin.register(VGPUser)
class VGPUserAdmin(UserAdmin):
    model = VGPUser
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': (
                'uuid',
                'mobno',
                'name',
                'org',
                'idt',
                'idno',
                'deptt',
                'desig',
                'rcode',
                'gndr',
                'age'
            )}),
    )
    readonly_fields = ('uuid',)