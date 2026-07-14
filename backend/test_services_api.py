#!/usr/bin/env python
import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User
from salons.models import Salon
from rest_framework.authtoken.models import Token

# Get or create test user
user = User.objects.get(email='test@salon.com')
token = Token.objects.get_or_create(user=user)[0]

print(f"Token: {token.key}")
print(f"Testing API endpoints...\n")

# Test my_services endpoint
print("Testing GET /api/services/my_services/")
response = requests.get(
    'http://localhost:8000/api/services/my_services/',
    headers={'Authorization': f'Token {token.key}'}
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    services = response.json()
    print(f"Services count: {len(services)}")
    for service in services:
        print(f"  - {service['name']}: {service['price']} CFA ({service['category']})")
else:
    print(f"Error: {response.text}")
