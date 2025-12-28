from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
import traceback
from django.http import JsonResponse
import pandas as pd
import datetime
from datetime import timedelta
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from accounts.models import VGPUser as User  # Assuming you have a custom user model
import json
from django.views.decorators.csrf import csrf_exempt
import uuid
from django.utils import timezone
from django.utils.timezone import localtime
from collections import defaultdict
import requests
import base64
import traceback
import logging
import openpyxl
from .models import Visit
from django.db import transaction
from django.db.models import Q
from main.forms import SignupForm
from django.db.models import DateField, BooleanField

def generate_captcha():
    """Generates a new CAPTCHA"""
    new_key = CaptchaStore.generate_key()
    return {
        "key": new_key,
        "image_url": captcha_image_url(new_key)
    }
    
def refresh_captcha(request):
    """Returns a new CAPTCHA via AJAX"""
    return JsonResponse(generate_captcha())

from django.contrib.auth.decorators import login_required
from .forms import ProfileUpdateForm

@login_required
def update_profile(request):
    """Handle profile updates with proper form validation"""
    user = request.user
    
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, instance=user)
        if form.is_valid():
            try:
                # Save the form data
                updated_user = form.save(commit=False)
                
                # Handle password change if provided
                new_password = form.cleaned_data.get('new_password')
                if new_password:
                    updated_user.set_password(new_password)
                    messages.success(request, 'Profile and password updated successfully!')
                else:
                    messages.success(request, 'Profile updated successfully!')
                
                updated_user.save()
                return redirect('update_profile')
            except Exception as e:
                messages.error(request, f'Error updating profile: {str(e)}')
        else:
            # Show form errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = ProfileUpdateForm(instance=user)
    
    context = {
        "tmplt": "update-profile.html",
        "form": form,
        "user": user,
        "usr": request.user.username,
        "title": "Visitor Gate Pass::Update Profile"
    }
    return render(request, "layoutCollege.html", context)

def custom_logout_view(request):
    logout(request)  # This clears the session and logs out the user
    messages.success(request, "You have been logged out successfully.")
    return redirect('/')  # or your desired URL name


def index(request):
    if request.user.is_authenticated:
        return redirect('/home')
    captcha = generate_captcha()
    print(captcha)
    if request.method == 'POST':
        print('Login in as User')
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_captcha = request.POST.get("captcha")  # User input
        captcha_key = request.POST.get("captcha_key")  # Hidden input key
        print('Key: ' + str(captcha_key) + ', Captcha: ' + str(user_captcha))
        try:
            stored_captcha = CaptchaStore.objects.get(hashkey=captcha_key)
            print('Stored Captcha: ' + str(stored_captcha))
            if str(stored_captcha) == user_captcha:
                stored_captcha.delete()  # Delete CAPTCHA after success
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    print("Logged In as User")
                    login(request, user)
                    return redirect('/')
                else:
                    messages.error(request, 'Invalid username or password.')
            else:
                messages.error(request, 'Captcha expired or invalid.')
        except CaptchaStore.DoesNotExist:
            messages.error(request, 'Captcha expired or invalid.')
        
    context = {
        "tmplt": "index.html", 
        "captcha": captcha,
        "usr": request.user.username,
        "title":"Visitor Gate Pass::Home"
    }
    return render(request, "layoutCollege.html", context)

@login_required
def home(request):
    if not request.user.is_authenticated:
        return redirect('/signin')
    try:
        user = User.objects.filter(username=request.user.username).first()
    except:
        user = {}
        
    visits = Visit.objects.filter(uid=user.uuid).all()
    context = {
        "tmplt": "home.html", 
        "user": user,
        "visits": visits,
        "usr": request.user.username,
        "title":"Visitor Gate Pass::Home"
    }
    return render(request, "layoutCollege.html", context)


def signin(request):
    if request.user.is_authenticated:
        return redirect('/home')
    captcha = generate_captcha()
    print(captcha)
    if request.method == 'POST':
        print('Login in as User')
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_captcha = request.POST.get("captcha")  # User input
        captcha_key = request.POST.get("captcha_key")  # Hidden input key
        print('Key: ' + str(captcha_key) + ', Captcha: ' + str(user_captcha))
        try:
            stored_captcha = CaptchaStore.objects.get(hashkey=captcha_key)
            print('Stored Captcha: ' + str(stored_captcha))
            if str(stored_captcha) == user_captcha:
                stored_captcha.delete()  # Delete CAPTCHA after success
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    print("Logged In as User")
                    login(request, user)
                    return redirect('/')
                else:
                    messages.error(request, 'Invalid username or password.')
            else:
                messages.error(request, 'Captcha expired or invalid.')
        except CaptchaStore.DoesNotExist:
            messages.error(request, 'Captcha expired or invalid.')
        
    context = {
        "tmplt": "signin.html", 
        "captcha": captcha,
        "usr": request.user.username,
        "title":"Visitor Gate Pass::SignIn"
    }
    return render(request, "layoutCollege.html", context)


def signup(request):
    if request.user.is_authenticated:
        return redirect('/home')
    captcha = generate_captcha()
    print(captcha)
    initial_data = {
        'idt': 'AADHAR',
    }
    if request.method == 'POST':
        print('Submitting Form!')
        form = SignupForm(request.POST)
        if form.is_valid():
            print('Form is Valid!')
            entered_otp = form.cleaned_data['otp']
            # Validate OTP here (e.g., visitare with OTP sent via SMS/Email)
            if True or entered_otp == request.session.get('sent_otp'):  # Example check
                print('OTP Verfied!')
                try:
                    user = form.save(commit=False)
                    user.username = form.cleaned_data['email']
                    user.email = form.cleaned_data['email']
                    user.set_password(form.cleaned_data['password'])
                    user.save()
                    messages.success(request, 'Your account has been created successfully! Please log in.')
                    return redirect('/signin')
                except Exception as e:
                    print('Issue is submitting Form' + str(e))
            else:
                form.add_error('otp', "Invalid OTP")
        else:
            print("Invalid Fields:")
            for field, errors in form.errors.items():
                print(f"Field: {field}, Errors: {errors}")
    else:
        form = SignupForm(initial=initial_data)   
    context = {
        "tmplt": "signup.html", 
        "captcha": captcha,
        "form": form,
        "usr": request.user.username,
        "title":"Visitor Gate Pass::Signup"
    }
    return render(request, "layoutCollege.html", context)



@login_required
def add_update_visit(request, id=None):
    if not request.user.is_authenticated:
        return redirect('/signin')
    
    
    if request.method == 'POST':
        print('Submitting Form')
        try:
            
            vstid = request.POST.get('ID', '')
            stgno = int(request.POST.get('STGNO', 0))
            print('Submitting Form' + str(vstid) + ', Stage: ' + str(stgno))
            if len(vstid)>0:
                visit = Visit.objects.get(id=vstid)
                if visit:
                    print('Updating Existing visit!')
                    for field, value in request.POST.items():
                        
                        if field=='ID' or field=='csrfmiddlewaretoken':
                            continue
                        if hasattr(visit, field):  # Check if field exists in model
                            model_field = visit._meta.get_field(field)
                            
                            if isinstance(model_field, BooleanField):
                            
                                if value is not None and str(value).strip() != "":
                                    str_val = str(value).strip().lower()
                                    if str_val in ["true", "1", "yes", "y", "True", "Yes", "Y", "on", "ON"]:
                                        value = True
                                    elif str_val in ["false", "0", "no", "n", "False", "No", "N", "off", "OFF"]:
                                        value = False
                                    else:
                                        value=None
                                else:
                                    value=None
                            
                            if isinstance(model_field, DateField):
                                
                                if value:  # Only convert if not empty
                                    try:
                                        value = datetime.datetime.strptime(value, "%d/%m/%Y").date()
                                    except ValueError:
                                        continue  # Skip if invalid date
                                else:
                                    value = None
                              
                            setattr(visit, field, value)
                    visit.vstupdatedon = datetime.datetime.now()
                    visit.save()
                    print('Updating Existing visit!')
                return redirect('/home')
            else:
                visit = Visit()
                dt = datetime.datetime.today()
                cfy = 0
                if dt.month < 4:
                    cfy = dt.year - 1
                else:
                    cfy = dt.year    
                visit.ID = uuid.uuid4()
                vstid = visit.ID
                visit.vstcreatedon = datetime.datetime.now()
                for field, value in request.POST.items():
                    if field=='ID' or field=='csrfmiddlewaretoken':
                        continue
                    
                    if hasattr(visit, field):  # Check if field exists in model
                        model_field = visit._meta.get_field(field)

                        if isinstance(model_field, BooleanField):
                            
                            if value is not None and str(value).strip() != "":
                                str_val = str(value).strip().lower()
                                if str_val in ["true", "1", "yes", "y", "True", "Yes", "Y", "on", "ON"]:
                                        value = True
                                elif str_val in ["false", "0", "no", "n", "False", "No", "N", "off", "OFF"]:
                                    value = False
                                else:
                                    continue  # Skip invalid boolean values
                            else:
                                continue  # Skip if empty

                        if isinstance(model_field, DateField):
                            if value:  # Only convert if not empty
                                try:
                                    value = datetime.datetime.strptime(value, "%d/%m/%Y").date()
                                except ValueError:
                                    continue  # Skip if invalid date
                            else:
                                value = None  # Skip setting empty date field
                        
                        print('Setting Field: ' + field + ' to Value: ' + str(value))    
                        setattr(visit, field, value)
                visit.save()
                print('A New visit!')
                
                return redirect('/home')
            
            
            
        except Exception as e:
            print('Error in submitting form!')
            print('Exception Type:', type(e).__name__)
            print('Exception Message:', str(e))
            print('Stack Trace:')
            print(traceback.format_exc())
        print('updating visit parameters' + str(vstid) + ', User: ' + request.user.username)
        
        
    
    try:
        user = User.objects.filter(username=request.user.username).first()
        if user:
            user_dict = user.to_dict()
        else:
            user_dict = {}
        visit = Visit.objects.filter(id=id).first()
    except Exception as e:
        print(f"Error serializing user data: {e}")
        user_dict = {}
        visit = {}
        
    try:
        jsntxt = '{"user": '+ json.dumps(user_dict) +', "visit": '+ json.dumps(visit.to_dict()) +'}'
    except TypeError as e:
        print(f"JSON serialization error: {e}")
        # Fallback: create a simplified user dict without problematic fields
        safe_user_dict = {}
        if user:
            safe_user_dict = {
                'id': str(user.id) if user.id else None,
                'username': user.username,
                'name': user.name,
                'email': user.email,
                'mobno': user.mobno,
                'org': user.org,
                'deptt': user.deptt,
                'desig': user.desig,
                'gndr': user.gndr,
                'age': user.age
            }
        jsntxt = '{"user": ' + json.dumps(safe_user_dict) + ', "visit": {}}'
    
    context = {
        "tmplt": "add_update_visit.html", 
        "user": user,
        "visit": visit,
        "jsontxt": jsntxt,
        "usr": request.user.username,
        "title":"Visitor Gate Pass::Add Update Visit",
    }
    return render(request, "layoutCollege.html", context)

