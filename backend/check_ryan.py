#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User
from salons.models import Salon
from services.models import Service
from rest_framework.authtoken.models import Token

# Find ryan user
try:
    ryan = User.objects.get(username='ryan')
    print(f"Found user: {ryan.username} ({ryan.email})")
    
    # Check if ryan has a salon
    try:
        salon = Salon.objects.get(owner=ryan)
        print(f"Salon: {salon.name}")
        print(f"Salon ID: {salon.id}")
        
        # Check services for this salon
        services = Service.objects.filter(salon=salon)
        print(f"Services count: {services.count()}")
        for service in services:
            print(f"  - {service.name}: {service.price} CFA")
        
        # Check or create token
        token, created = Token.objects.get_or_create(user=ryan)
        print(f"\nToken: {token.key}")
        if created:
            print("Token was created")
        
    except Salon.DoesNotExist:
        print(f"User {ryan.username} does not own a salon")
        
except User.DoesNotExist:
    print("User 'ryan' not found")
    print("Available users:")
    for user in User.objects.all():
        print(f"  - {user.username} ({user.email})")
