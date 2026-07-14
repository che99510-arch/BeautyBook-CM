# Video Conversion Guide for Advertisement

## Problem
The current video `021___Flirty_Birdy_1945.avi` is in AVI format, which is not supported by modern web browsers.

## Solution Options

### Option 1: Manual Conversion (Recommended)
Use any video converter tool to convert the AVI to MP4:

1. **Online converters** (free):
   - https://convertio.co/avi-mp4/
   - https://www.onlineconverter.com/avi-to-mp4
   - https://cloudconvert.com/avi-to-mp4

2. **Desktop software**:
   - VLC Media Player (File > Convert/Save)
   - HandBrake (free, open source)
   - Any video converter software

### Option 2: Update Database Reference
After converting to MP4, you have two options:

#### Option A: Replace the file
1. Convert `021___Flirty_Birdy_1945.avi` to `021___Flirty_Birdy_1945.mp4`
2. Replace the AVI file with the MP4 file (same name)
3. No database changes needed

#### Option B: Update database reference
1. Convert to `021___Flirty_Birdy_1945.mp4`
2. Update the database to reference the new MP4 file

### Option 3: Use Django Admin
1. Go to `http://localhost:8000/admin/admin_portal/advertisement/1/change/`
2. Upload a new MP4 video file
3. Save the changes

## Current File Info
- File: `advertisements/videos/021___Flirty_Birdy_1945.avi`
- Size: ~120 MB
- Format: AVI (not web-compatible)

## Target Format
- Format: MP4 with H.264 codec
- Audio: AAC codec
- Compatible with all modern browsers

## Quick Test
After conversion, test the video by:
1. Refreshing the advertisements page
2. Clicking on the video thumbnail
3. The video should play in the modal window
