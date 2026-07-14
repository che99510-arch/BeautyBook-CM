#!/usr/bin/env python
import requests
import json

# Step 1: Login
print("Step 1: Login with ryan@gmail.com")
login_response = requests.post(
    'http://localhost:8000/api/users/salon_login/',
    json={'email': 'ryan@gmail.com', 'password': 'testpass123'},
)
print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.json()}\n")

if login_response.status_code != 200:
    print("Login failed!")
    exit(1)

token = login_response.json()['token']
print(f"Got token: {token}\n")

# Step 2: Fetch services using the token from login
print("Step 2: Fetch services with token from login response")
services_response = requests.get(
    'http://localhost:8000/api/services/my_services/',
    headers={'Authorization': f'Token {token}'}
)
print(f"Status: {services_response.status_code}")
print(f"Response: {services_response.json()}\n")

if services_response.status_code == 200:
    services = services_response.json()
    print(f"SUCCESS: Got {len(services)} services")
    for service in services:
        print(f"  - {service['name']}: {service['price']} CFA")
else:
    print(f"ERROR: {services_response.text}")
