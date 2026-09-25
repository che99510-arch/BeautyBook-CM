"""
Management command to create or promote an admin user.

Non-interactive (env vars):
    ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret python manage.py create_admin

Promote existing user to superadmin:
    python manage.py create_admin --promote email@example.com
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create or promote an admin user to superadmin'

    def add_arguments(self, parser):
        parser.add_argument('--promote', type=str, help='Email of existing user to promote to superadmin')

    def handle(self, *args, **kwargs):
        promote_email = kwargs.get('promote')

        # Promote existing user mode
        if promote_email:
            try:
                user = User.objects.get(email=promote_email)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                user.profile.is_admin = True
                user.profile.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Promoted {promote_email} to superadmin'))
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'No user found with email {promote_email}'))
            return

        # Create/update from env vars
        email    = os.environ.get('ADMIN_EMAIL', '').strip()
        password = os.environ.get('ADMIN_PASSWORD', '').strip()

        if not email or not password:
            self.stdout.write('Skipping admin creation: ADMIN_EMAIL and ADMIN_PASSWORD not set.')
            return

        username = email.split('@')[0]
        base, i = username, 1

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
            self.stdout.write(self.style.SUCCESS(f'✓ Updated {email} to superadmin'))
        else:
            # Ensure unique username
            while User.objects.filter(username=username).exists():
                username = f'{base}{i}'
                i += 1
            user = User.objects.create_user(
                username=username, email=email, password=password,
                is_staff=True, is_superuser=True,
            )
            try:
                user.profile.is_admin = True
                user.profile.save()
            except Exception:
                pass
            self.stdout.write(self.style.SUCCESS(f'✓ Created superadmin: {email}'))
