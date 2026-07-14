from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('salons', '0006_update_city_choices'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salon',
            name='city',
            field=models.CharField(
                blank=True,
                default='Douala',
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
