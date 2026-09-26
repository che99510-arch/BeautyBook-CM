from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_add_free_booking_until'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='avatar',
            field=models.ImageField(
                upload_to='avatars/',
                max_length=500,
                null=True,
                blank=True,
            ),
        ),
    ]
