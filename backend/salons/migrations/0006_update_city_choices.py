from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('salons', '0005_salon_open_hours_default'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salon',
            name='city',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('Bamenda', 'Bamenda'),
                    ('Buea', 'Buea'),
                    ('Douala', 'Douala'),
                    ('Yaounde', 'Yaounde'),
                    ('Bafoussam', 'Bafoussam'),
                ],
            ),
        ),
    ]
