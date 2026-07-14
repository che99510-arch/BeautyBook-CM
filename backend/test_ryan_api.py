#!/usr/bin/env python
import requests
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

ryan = User.objects.get(username='ryan')
token = Token.objects.get(user=ryan)

print(f"Testing with ryan's token: {token.key}\n")

# Test my_services endpoint with ryan's token
response = requests.get(
    'http://localhost:8000/api/services/my_services/',
    headers={'Authorization': f'Token {token.key}'}
)
print(f"GET /api/services/my_services/")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
