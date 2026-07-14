#!/usr/bin/env python
import os
import django
import requests
from datetime import date, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User
from salons.models import Salon
from services.models import Service
from bookings.models import Booking
from rest_framework.authtoken.models import Token

# use ryan user for testing
ryan = User.objects.get(username='ryan')
token = Token.objects.get(user=ryan).key

print(f"Using token: {token}\n")

# ensure there is at least one booking for the salon
salon = Salon.objects.get(owner=ryan)
service = Service.objects.filter(salon=salon).first()
if not service:
    raise RuntimeError("No service found for ryan's salon - seed data required")

if not Booking.objects.filter(salon=salon).exists():
    Booking.objects.create(
        client_name='Test Customer',
        client_email='customer@example.com',
        salon=salon,
        service=service,
        service_name=service.name,
        booking_date=date.today(),
        booking_time=time(10, 0),
        status='pending',
        price=service.price,
    )
    print("Created a sample booking")

print("Fetching salon_bookings...")
response = requests.get(
    'http://localhost:8000/api/bookings/salon_bookings/',
    headers={'Authorization': f'Token {token}'}
)
print(f"Status: {response.status_code}")
print(response.json())

if response.status_code == 200 and response.json():
    b = response.json()[0]
    booking_id = b['id']
    print(f"Confirming booking {booking_id}")
    resp2 = requests.post(
        f'http://localhost:8000/api/bookings/{booking_id}/confirm/',
        headers={'Authorization': f'Token {token}'}
    )
    print(resp2.status_code, resp2.json())

    print(f"Marking booking {booking_id} as completed")
    resp3 = requests.post(
        f'http://localhost:8000/api/bookings/{booking_id}/complete/',
        headers={'Authorization': f'Token {token}'}
    )
    print(resp3.status_code, resp3.json())

    print(f"Cancelling booking {booking_id}")
    resp4 = requests.post(
        f'http://localhost:8000/api/bookings/{booking_id}/cancel/',
        headers={'Authorization': f'Token {token}'}
    )
    print(resp4.status_code, resp4.json())
