from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_portal', '0004_sitetestimonial'),
    ]

    operations = [
        migrations.AddField(
            model_name='platformsettings',
            name='allow_admin_signup',
            field=models.BooleanField(
                default=False,
                help_text='Allow new administrators to register. Only superusers can change this.',
            ),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='admin_invitation_code',
            field=models.CharField(
                blank=True,
                default='',
                max_length=64,
                help_text='Optional invitation code required for admin signup. Leave blank to disable.',
            ),
        ),
    ]
