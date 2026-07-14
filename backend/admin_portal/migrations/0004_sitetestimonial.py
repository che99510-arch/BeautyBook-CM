from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_portal', '0003_add_payment_enabled'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteTestimonial',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Full name of the reviewer', max_length=150)),
                ('avatar', models.ImageField(blank=True, help_text='Profile photo (optional)', null=True, upload_to='testimonials/avatars/')),
                ('avatar_url', models.URLField(blank=True, default='', help_text='External avatar URL (used if no uploaded avatar)')),
                ('role', models.CharField(
                    choices=[('client', 'Client'), ('salon_owner', 'Salon Owner')],
                    default='client',
                    help_text='Whether this person is a client or salon owner',
                    max_length=20,
                )),
                ('location', models.CharField(blank=True, default='', help_text='City / location (e.g. Douala)', max_length=100)),
                ('comment', models.TextField(help_text='The testimonial text')),
                ('rating', models.IntegerField(default=5, help_text='Rating 1-5')),
                ('is_approved', models.BooleanField(default=False, help_text='Only approved testimonials appear on the public site')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Site Testimonial',
                'verbose_name_plural': 'Site Testimonials',
                'ordering': ['-created_at'],
            },
        ),
    ]
