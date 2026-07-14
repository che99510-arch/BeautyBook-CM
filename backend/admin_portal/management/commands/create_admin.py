"""
Management command to create an admin user.
Usage: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create an admin user'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('\n=== Create Admin User ===\n'))
        
        # Get admin credentials
        email = input('Admin email: ').strip()
        username = email.split('@')[0]
        password = input('Admin password: ').strip()
        
        # Check if user exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.profile.is_admin = True
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'\n✓ Updated existing user {email} to admin\n'))
        else:
            # Create new admin user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=True,
                is_superuser=True
            )
            user.profile.is_admin = True
            user.profile.save()
            self.stdout.write(self.style.SUCCESS(f'\n✓ Created new admin user: {email}\n'))
        
        self.stdout.write(self.style.SUCCESS('=== Admin User Ready ===\n'))
        self.stdout.write(self.style.WARNING('Login at: http://localhost:8000/admin/\n'))
