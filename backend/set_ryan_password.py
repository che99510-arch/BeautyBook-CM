#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User

ryan = User.objects.get(username='ryan')
print(f"Ryan's password hash: {ryan.password}")
print(f"Is password set: {ryan.has_usable_password()}")

# Let's also set a known password for testing
ryan.set_password('testpass123')
ryan.save()
print("Password reset to: testpass123")
