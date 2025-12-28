from django import forms
from accounts.models import VGPUser
from django.core.validators import EmailValidator

class SignupForm(forms.ModelForm):
    # Extra fields not in model
    email = forms.EmailField(
        max_length=150,
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Enter email address', 
            'required': True,
            'data-bv-emailaddress': "true", 
            'data-bv-emailaddress-message': "Enter a valid email address"
        }),
        validators=[EmailValidator(message="Please enter a valid email address.")],
        label='Email'
    )
    otp = forms.CharField(
        max_length=6,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control', 'placeholder': 'Enter OTP', 'required': True,
            'pattern': '^[0-9]{6}$', 'data-bv-regexp-message': 'OTP must be 6 digits'
        }),
        label='OTP'
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 'placeholder': 'Enter password', 'required': True,
            'data-bv-notempty': "true", 'data-bv-notempty-message': "Password is required"
        }),
        label='Password'
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 'placeholder': 'Confirm password', 'required': True,
            'data-bv-notempty': "true", 'data-bv-notempty-message': "Please confirm password"
        }),
        label='Confirm Password'
    )
    class Meta:
        model = VGPUser
        fields = ['name', 'mobno', 'org', 'idno', 'deptt', 'desig', 'rcode', 'gndr', 'age']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control', 'placeholder': 'Enter full name', 'required': True,
                'data-bv-notempty': "true", 'data-bv-notempty-message': "Name is required"
            }),
            'mobno': forms.TextInput(attrs={
                'class': 'form-control', 'placeholder': 'Enter mobile number', 'required': True,
                'pattern': '^[0-9]{10,15}$', 'data-bv-regexp-message': 'Enter valid mobile number'
            }),
            'org': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Organization'}),
            'idt': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ID Type', 'required': True}),
            'idno': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ID Number', 'required': True}),
            'deptt': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Department'}),
            'desig': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Designation'}),
            'rcode': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Referral Code'}),
            'gndr': forms.Select(attrs={'class': 'form-control'}, choices=[('Male', 'Male'), ('Female', 'Female')]),
            'age': forms.NumberInput(attrs={
                'class': 'form-control', 'placeholder': 'Age', 'required': True, 'min': '1', 'max': '120'
            })
        }
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', "Passwords do not match")
        
        return cleaned_data

class ProfileUpdateForm(forms.ModelForm):
    """Form for updating user profile information"""
    email = forms.EmailField(
        max_length=150,
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Enter email address', 
            'required': True,
            'data-bv-emailaddress': "true", 
            'data-bv-emailaddress-message': "Enter a valid email address"
        }),
        validators=[EmailValidator(message="Please enter a valid email address.")],
        label='Email'
    )
    
    # Optional password change fields
    current_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 'placeholder': 'Current password (leave blank if not changing)',
        }),
        required=False,
        label='Current Password'
    )
    
    new_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 'placeholder': 'New password (leave blank if not changing)',
        }),
        required=False,
        label='New Password'
    )
    
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 'placeholder': 'Confirm new password',
        }),
        required=False,
        label='Confirm New Password'
    )
    
    class Meta:
        model = VGPUser
        fields = ['name', 'mobno', 'org', 'idno', 'deptt', 'desig', 'rcode', 'gndr', 'age']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control', 'placeholder': 'Enter full name', 'required': True,
                'data-bv-notempty': "true", 'data-bv-notempty-message': "Name is required"
            }),
            'mobno': forms.TextInput(attrs={
                'class': 'form-control', 'placeholder': 'Enter mobile number', 'required': True,
                'pattern': '^[0-9]{10,15}$', 'data-bv-regexp-message': 'Enter valid mobile number'
            }),
            'org': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Organization'}),
            'idno': forms.TextInput(attrs={
                'class': 'form-control', 'placeholder': 'Last 4 digits of AADHAR', 'required': True,
                'pattern': '^[0-9]{4}$', 'data-bv-regexp-message': 'Enter last 4 digits only'
            }),
            'deptt': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Department'}),
            'desig': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Designation'}),
            'rcode': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Referral Code'}),
            'gndr': forms.Select(
                choices=[('', 'Select Gender'), ('Male', 'Male'), ('Female', 'Female')],
                attrs={'class': 'form-control', 'required': True}
            ),
            'age': forms.NumberInput(attrs={
                'class': 'form-control', 'placeholder': 'Age', 'required': True, 'min': '1', 'max': '120'
            })
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set initial values for email field
        if self.instance and self.instance.pk:
            self.fields['email'].initial = self.instance.email
    
    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get("new_password")
        confirm_password = cleaned_data.get("confirm_password")
        current_password = cleaned_data.get("current_password")

        # If user wants to change password
        if new_password or confirm_password or current_password:
            if not current_password:
                self.add_error('current_password', "Current password is required to change password")
            elif not self.instance.check_password(current_password):
                self.add_error('current_password', "Current password is incorrect")
            elif not new_password:
                self.add_error('new_password', "New password is required")
            elif not confirm_password:
                self.add_error('confirm_password', "Please confirm your new password")
            elif new_password != confirm_password:
                self.add_error('confirm_password', "New passwords do not match")
            elif len(new_password) < 8:
                self.add_error('new_password', "Password must be at least 8 characters long")
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Handle password change
        if self.cleaned_data.get('new_password'):
            user.set_password(self.cleaned_data['new_password'])
        
        # Update email
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
        return user