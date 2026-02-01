from transformers import pipeline
from PIL import Image
import os

def check_model():
    print("⏳ Loading Model...")
    pipe = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    
    # Create a dummy image or use one if available
    img_path = "test_ai.jpg"
    if not os.path.exists(img_path):
        Image.new('RGB', (512, 512), color='red').save(img_path)
    
    print("🔍 analyzing image...")
    results = pipe(img_path)
    
    print("\n--- RAW MODEL OUTPUT ---")
    print(results)
    
    print("\n--- LOGIC CHECK ---")
    fake_score = 0.0
    for p in results:
        label = p['label'].lower()
        print(f"Checking label: '{label}' with score {p['score']}")
        if 'fake' in label or 'ai' in label:
            print("  -> Matches 'fake'/'ai' keyword!")
            fake_score = p['score']
    
    print(f"Final Calculated Score: {fake_score}")

if __name__ == "__main__":
    check_model()
