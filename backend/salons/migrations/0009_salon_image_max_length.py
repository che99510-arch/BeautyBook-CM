from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('salons', '0008_remove_salon_name_unique'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salon',
            name='image',
            field=models.ImageField(
                upload_to='salon_images/',
                max_length=500,
                null=True,
                blank=True,
            ),
        ),
        migrations.AlterField(
            model_name='salon',
            name='cover_image',
            field=models.ImageField(
                upload_to='salon_covers/',
                max_length=500,
                null=True,
                blank=True,
            ),
        ),
    ]
