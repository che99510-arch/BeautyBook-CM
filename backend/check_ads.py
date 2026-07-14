#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beautybook_backend.settings')
django.setup()

from admin_portal.models import Advertisement

print("=== Advertisements in Database ===")
ads = Advertisement.objects.all()
print(f"Total ads: {ads.count()}")

for ad in ads:
    print(f"\nID: {ad.id}")
    print(f"Salon: {ad.salon.name if ad.salon else 'None'}")
    print(f"Tagline: {ad.tagline}")
    print(f"Video file: {ad.video.name if ad.video else 'None'}")
    print(f"Video URL: {ad.video_url}")
    print(f"Thumbnail file: {ad.video_thumbnail.name if ad.video_thumbnail else 'None'}")
    print(f"Thumbnail URL: {ad.thumbnail_url}")
    print(f"Status: {ad.status}")
    
    # Check if files actually exist
    if ad.video:
        video_path = ad.video.path
        print(f"Video exists: {os.path.exists(video_path)} - {video_path}")
    
    if ad.video_thumbnail:
        thumb_path = ad.video_thumbnail.path
        print(f"Thumbnail exists: {os.path.exists(thumb_path)} - {thumb_path}")

print("\n=== Media Directory Contents ===")
ads_dir = "advertisements"
if os.path.exists(ads_dir):
    print("Advertisements directory structure:")
    for root, dirs, files in os.walk(ads_dir):
        level = root.replace(ads_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f"{subindent}{file}")
else:
    print("Advertisements directory not found")
