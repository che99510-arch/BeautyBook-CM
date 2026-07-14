#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from salons.models import Salon
from services.models import Service

# Get test salon
try:
    salon = Salon.objects.get(name='Test Salon')
    print(f"Found salon: {salon.name}")
    
    # Delete existing services
    Service.objects.filter(salon=salon).delete()
    
    # Create sample services
    services_data = [
        {
            'name': 'Hair Braiding',
            'category': 'Hair',
            'description': 'Traditional African hair braiding - cornrows, box braids, and more',
            'duration': '3-4 hours',
            'price': 50.00,
        },
        {
            'name': 'Hair Relaxer & Styling',
            'category': 'Hair',
            'description': 'Professional hair relaxing and styling service',
            'duration': '2-3 hours',
            'price': 35.00,
        },
        {
            'name': 'Nail Art',
            'category': 'Nails',
            'description': 'Colorful and creative nail art designs',
            'duration': '1.5 hours',
            'price': 25.00,
        },
        {
            'name': 'Makeup Application',
            'category': 'Makeup',
            'description': 'Professional makeup for special events',
            'duration': '1 hour',
            'price': 40.00,
        },
        {
            'name': 'Facial Treatment',
            'category': 'Makeup',
            'description': 'Deep cleaning and rejuvenating facial',
            'duration': '1 hour',
            'price': 30.00,
        },
        {
            'name': 'Relaxation Massage',
            'category': 'Massage',
            'description': 'Full body relaxation massage',
            'duration': '1.5 hours',
            'price': 45.00,
        },
    ]
    
    for data in services_data:
        service = Service.objects.create(salon=salon, **data)
        print(f"Created: {service.name} - {service.price} CFA")
    
    print(f"\nTotal services created: {Service.objects.filter(salon=salon).count()}")
    
except Salon.DoesNotExist:
    print("Test salon not found. Please create it first.")
