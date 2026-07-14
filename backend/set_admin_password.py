#!/usr/bin/env python
"""
Script to set admin password programmatically
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from django.contrib.auth.models import User

# Set admin password
admin_user = User.objects.get(username='admin')
admin_user.set_password('admin123')
admin_user.save()
print("✅ Admin password set to: admin123")
print("✅ Username: admin")
print("✅ You can now login at: http://127.0.0.1:8000/admin/")
