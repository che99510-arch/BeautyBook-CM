#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from salons.models import Salon

salons = Salon.objects.all()
print(f"Total salons: {salons.count()}")
for salon in salons:
    print(f"- {salon.name} (Owner: {salon.owner.email})")
