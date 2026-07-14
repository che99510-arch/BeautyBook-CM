#!/usr/bin/env python
import os
import cv2

def convert_avi_to_mp4_opencv(input_file, output_file=None):
    """Convert AVI video to MP4 format using OpenCV."""
    
    if not os.path.exists(input_file):
        print(f"Input file not found: {input_file}")
        return False
    
    if output_file is None:
        # Generate output filename by changing extension
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.mp4"
    
    try:
        print(f"Converting {input_file} to {output_file}...")
        
        # Open the input video
        cap = cv2.VideoCapture(input_file)
        
        if not cap.isOpened():
            print("Error: Could not open input video file")
            return False
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Video info: {width}x{height}, {fps} fps, {total_frames} frames")
        
        # Define the codec and create VideoWriter object
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))
        
        # Process frames
        frame_count = 0
        while True:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            out.write(frame)
            frame_count += 1
            
            # Progress indicator
            if frame_count % 100 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
        
        # Release everything
        cap.release()
        out.release()
        
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
    
    success = convert_avi_to_mp4_opencv(input_video)
    
    if success:
        print("\nConversion successful! The MP4 file can now be used in the web application.")
    else:
        print("\nConversion failed. Please check the error messages above.")
