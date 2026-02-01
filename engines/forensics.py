import cv2
import numpy as np
from engines.deepfake_logic import DeepfakeDetector

class ForensicsEngine:
    def __init__(self):
        # Initialize the new Deepfake Detector (Hugging Face ViT)
        self.ai_detector = DeepfakeDetector()

    def get_frequency_score(self, image_path):
        """Math Sensor: Detects high-frequency patterns (FFT)"""
        img = cv2.imread(image_path, 0)
        if img is None: return 0.0
        
        # FFT Analysis
        dft = np.fft.fft2(img)
        dft_shift = np.fft.fftshift(dft)
        mag_spec = 20 * np.log(np.abs(dft_shift) + 1)
        
        # Normalize and return a score between 0 and 1
        # Using the higher denominator 210.0 we discussed for robustness
        score = np.mean(mag_spec) / 210.0
        return min(max(float(score), 0.0), 1.0)

    def detect_synthetic(self, image_path):
        """Unified Sensor: Fuses Math and Deep Learning signals"""
        sig_fft = self.get_frequency_score(image_path) 
        
        # Get Deep Learning Score from the new Transformer Logic
        # We need to load image with PIL for the transformer
        try:
            from PIL import Image
            pil_img = Image.open(image_path)
            ai_result = self.ai_detector.detect_deepfake(pil_img)
            sig_dl = ai_result.get('fake_probability', 0.0)
        except Exception as e:
            print(f"DL Inference skipped: {e}")
            sig_dl = 0.0
        
        # Weighted Fusion (Deliverable #6: Robustness)
        # Trusting DL more (80%) now that we have a real model
        final_prob = (sig_fft * 0.2) + (sig_dl * 0.8)
        
        return round(final_prob, 4)