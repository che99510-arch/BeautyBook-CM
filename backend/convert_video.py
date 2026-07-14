#!/usr/bin/env python
import os
from moviepy.editor import VideoFileClip

def convert_avi_to_mp4(input_file, output_file=None):
    """Convert AVI video to MP4 format for web compatibility."""
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        return False
    
    if output_file is None:
        # Generate output filename by changing extension
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.mp4"
    
    try:
        print(f"Converting {input_file} to {output_file}...")
        
        # Load the video
        clip = VideoFileClip(input_file)
        
        # Write to MP4 format with web-compatible codec
        clip.write_videofile(
            output_file,
            codec='libx264',        # H.264 codec for web compatibility
            audio_codec='aac',      # AAC audio for web compatibility
            temp_audiofile='temp-audio.m4a',
            remove_temp=True
        )
        
        # Close the clip to free resources
        clip.close()
        
        print(f"Conversion completed successfully!")
        print(f"Output file: {output_file}")
        print(f"File size: {os.path.getsize(output_file) / (1024*1024):.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"Error during conversion: {e}")
        return False

if __name__ == "__main__":
    # Convert the specific video file
    input_video = "advertisements/videos/021___Flirty_Birdy_1945.avi"
    
    success = convert_avi_to_mp4(input_video)
    
    if success:
        print("\nConversion successful! The MP4 file can now be used in the web application.")
        print("You may need to update the database reference to point to the new MP4 file.")
    else:
        print("\nConversion failed. Please check the error messages above.")
