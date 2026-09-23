"""
Management command to create an admin user.

Interactive:  python manage.py create_admin
Non-interactive (env vars):
    ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret python manage.py create_admin
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create or update the admin user'

    def handle(self, *args, **kwargs):
        # Try env vars first (for automated/CI deployment without a shell)
        email    = os.environ.get('ADMIN_EMAIL', '').strip()
        password = os.environ.get('ADMIN_PASSWORD', '').strip()

        if not email or not password:
            self.stderr.write(self.style.ERROR(
                'Skipping admin creation: ADMIN_EMAIL and ADMIN_PASSWORD env vars not set.'
            ))
            return

        if not email or not password:
            self.stderr.write(self.style.ERROR('ADMIN_EMAIL and ADMIN_PASSWORD are required.'))
            return

        username = email.split('@')[0]

        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            try:
                user.profile.is_admin = True
                user.profile.save()
            except Exception:
                pass
            self.stdout.write(self.style.SUCCESS(f'✓ Updated existing user {email} to admin'))
        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=True,
                is_superuser=True,
            )
            try:
                user.profile.is_admin = True
                user.profile.save()
            except Exception:
                pass
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: {email}'))
