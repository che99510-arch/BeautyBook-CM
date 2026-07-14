from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_add_payment_required'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Extend booking status field ──────────────────────────────────
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(
                max_length=30,
                choices=[
                    ('pending', 'Pending'),
                    ('confirmed', 'Confirmed'),
                    ('declined', 'Declined'),
                    ('reschedule_requested', 'Reschedule Requested'),
                    ('completed', 'Completed'),
                    ('expired', 'Expired'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
            ),
        ),

        # ── Decline fields ───────────────────────────────────────────────
        migrations.AddField(
            model_name='booking',
            name='decline_reason',
            field=models.CharField(
                max_length=30,
                choices=[
                    ('fully_booked', 'Fully booked'),
                    ('staff_unavailable', 'Staff unavailable'),
                    ('salon_closed', 'Salon closed'),
                    ('service_unavailable', 'Requested service unavailable'),
                    ('emergency_closure', 'Emergency closure'),
                    ('other', 'Other'),
                ],
                blank=True, null=True,
            ),
        ),
        migrations.AddField(
            model_name='booking',
            name='decline_message',
            field=models.TextField(blank=True, null=True),
        ),

        # ── Reschedule fields ────────────────────────────────────────────
        migrations.AddField(
            model_name='booking',
            name='reschedule_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='reschedule_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='reschedule_message',
            field=models.TextField(blank=True, null=True),
        ),

        # ── CustomerNotification model ───────────────────────────────────
        migrations.CreateModel(
            name='CustomerNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(
                    max_length=30,
                    choices=[
                        ('booking_confirmed', 'Booking Confirmed'),
                        ('booking_declined', 'Booking Declined'),
                        ('booking_reschedule', 'Reschedule Requested'),
                        ('booking_expired', 'Booking Expired'),
                        ('booking_completed', 'Booking Completed'),
                        ('booking_cancelled', 'Booking Cancelled'),
                        ('general', 'General'),
                    ],
                    default='general',
                )),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('email_sent', models.BooleanField(default=False)),
                ('whatsapp_sent', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipient', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='customer_notifications',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('booking', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='notifications',
                    to='bookings.booking',
                )),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(
            model_name='customernotification',
            index=models.Index(fields=['recipient', 'is_read'], name='bookings_cu_recipie_idx'),
        ),

        # ── SalonOwnerNotification model ─────────────────────────────────
        migrations.CreateModel(
            name='SalonOwnerNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(
                    max_length=30,
                    choices=[
                        ('new_booking', 'New Booking'),
                        ('booking_cancelled', 'Booking Cancelled by Customer'),
                        ('general', 'General'),
                    ],
                    default='general',
                )),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipient', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='salon_notifications',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('booking', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='salon_notifications',
                    to='bookings.booking',
                )),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(
            model_name='salonownernotification',
            index=models.Index(fields=['recipient', 'is_read'], name='bookings_sa_recipie_idx'),
        ),
    ]
