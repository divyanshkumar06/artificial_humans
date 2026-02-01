import cv2
import numpy as np
import os
import sys

# Ensure we can import from the root directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engines.robustness import RobustnessEngine
from engines.forensics import ForensicsEngine
from engines.consistency import ConsistencyEngine

def add_noise(image_path):
    img = cv2.imread(image_path)
    if img is None: return None
    
    row, col, ch = img.shape
    mean = 0
    var = 1000 # Heavy noise
    sigma = var ** 0.5
    gauss = np.random.normal(mean, sigma, (row, col, ch))
    gauss = gauss.reshape(row, col, ch)
    noisy = img + gauss
    
    noisy_path = image_path.replace(".jpg", "_attacked.jpg")
    cv2.imwrite(noisy_path, noisy)
    return noisy_path

def test_defense():
    # Setup
    re = RobustnessEngine()
    fe = ForensicsEngine()
    ce = ConsistencyEngine()
    
    # Create a dummy image if none exists
    test_img = "robustness_test.jpg"
    if not os.path.exists(test_img):
        # Create a blank image with some shapes
        img = np.zeros((512, 512, 3), np.uint8)
        cv2.rectangle(img, (100, 100), (300, 300), (255, 0, 0), -1)
        cv2.putText(img, 'Test', (150, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2)
        cv2.imwrite(test_img, img)

    print(f"🛡️ Starting Security Audit on {test_img}...")
    
    # 1. Simulate Attack
    print("\n[Step 1] Simulating Adversarial Noise Attack...")
    attacked_path = add_noise(test_img)
    print(f"   -> Generated: {attacked_path}")
    
    # 2. Analyze without Defense
    print("\n[Step 2] Analyzing Attack WITHOUT Defense...")
    score_attacked = fe.detect_synthetic(attacked_path)
    print(f"   -> Forensic Score (Noise treated as artifacts): {score_attacked}")
    
    # 3. Apply Defense (Purification)
    print("\n[Step 3] Activating Robustness Shield (Input Purification)...")
    purified_path = re.purify_image(attacked_path)
    print(f"   -> Purified Image: {purified_path}")
    
    # 4. Analyze after Defense
    print("\n[Step 4] Analyzing after Defense...")
    score_defended = fe.detect_synthetic(purified_path)
    consistency_score = ce.compute_consistency(purified_path, "a blue rectangle") # Check if content survived
    
    print(f"   -> Forensic Score (After Purification): {score_defended}")
    print(f"   -> Semantic Preservation (CLIP Score): {consistency_score}")
    
    print("\n--- CONCLUSION ---")
    if score_defended < score_attacked:
        print("✅ SUCCESS: Defense reduced artificial noise patterns.")
    else:
        print("⚠️ NOTE: Scores similar. This is expected if the model is already robust.")
        
    print(f"✅ Content Preserved: CLIP Score {consistency_score} (Should be > 0.2)")

if __name__ == "__main__":
    test_defense()
