from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('admin_portal', '0006_advertisement_dates_nullable'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advertisement',
            name='video',
            field=models.FileField(
                upload_to='advertisements/videos/',
                max_length=500,
                validators=[django.core.validators.FileExtensionValidator(
                    allowed_extensions=['mp4', 'webm', 'mov']
                )],
                help_text='Advertisement video file',
            ),
        ),
        migrations.AlterField(
            model_name='advertisement',
            name='video_thumbnail',
            field=models.ImageField(
                upload_to='advertisements/thumbnails/',
                max_length=500,
                blank=True,
                null=True,
                help_text='Video thumbnail image',
            ),
        ),
    ]
