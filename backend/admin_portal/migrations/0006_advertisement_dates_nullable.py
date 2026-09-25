from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_portal', '0005_platformsettings_admin_signup'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advertisement',
            name='start_date',
            field=models.DateField(blank=True, null=True, help_text='Advertisement start date'),
        ),
        migrations.AlterField(
            model_name='advertisement',
            name='end_date',
            field=models.DateField(blank=True, null=True, help_text='Advertisement end date'),
        ),
    ]
