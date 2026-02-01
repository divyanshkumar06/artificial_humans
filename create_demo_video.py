import cv2
import numpy as np

# Settings
output_file = 'demo_pulse_test.mp4'
width, height = 640, 480
fps = 30
duration_sec = 10

# Video Writer
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))

print(f"Generating {output_file}...")

for i in range(fps * duration_sec):
    # Time in seconds
    t = i / fps
    
    # Pattern: 
    # 0-3s: Black (Safe)
    # 3-6s: Random Noise (High Entopy/AI-like)
    # 6-10s: Black (Safe)
    
    if 3.0 <= t <= 6.0:
        # High Frequency Noise (Simulates Artifacts)
        frame = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    else:
        # Black Background with moving text
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Add moving circle to show it's a video
        x = int((i * 5) % width)
        cv2.circle(frame, (x, height//2), 50, (0, 255, 0), -1)
        
        cv2.putText(frame, "SAFE ZONE", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    out.write(frame)

out.release()
print("✅ Video generated successfully!")
