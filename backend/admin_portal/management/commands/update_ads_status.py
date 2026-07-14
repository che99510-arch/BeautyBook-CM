from django.core.management.base import BaseCommand
from admin_portal.tasks import update_advertisement_status


class Command(BaseCommand):
    help = 'Update advertisement statuses based on start/end dates'

    def handle(self, *args, **options):
        result = update_advertisement_status()
        self.stdout.write(self.style.SUCCESS(
            f'Advertisement statuses updated: '
            f'{result["activated"]} activated, '
            f'{result["expired"]} expired, '
            f'{result["scheduled"]} scheduled.'
        ))
