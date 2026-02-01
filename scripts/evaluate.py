import os
import json
import pandas as pd
import numpy as np
import cv2
import sys
# Ensure we can import from parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import analyze_post
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_curve, confusion_matrix, auc

# Configuration
DATA_DIRS = {
    "REAL": "data/cosmos/real",
    "MISMATCHED": "data/cosmos/mismatched",
    "AI_GEN": "data/challenge/ai_gen"
}

METRICS_FILE = "evaluation_metrics.json"

def add_noise(image_path):
    """Adds random noise to an image for robustness testing."""
    img = cv2.imread(image_path)
    if img is None: return None
    row, col, ch = img.shape
    mean = 0
    var = 0.1
    sigma = var**0.5
    gauss = np.random.normal(mean, sigma, (row, col, ch))
    gauss = gauss.reshape(row, col, ch)
    noisy = img + gauss * 50 # Amplify noise for visibility
    noisy_path = image_path.replace(".jpg", "_noisy.jpg")
    cv2.imwrite(noisy_path, noisy)
    return noisy_path

def evaluate_explanation_quality(explanation):
    """Heuristic check for explanation quality."""
    score = 0
    if len(explanation) > 50: score += 0.4
    if "RISK" in explanation or "SAFE" in explanation or "Likely" in explanation: score += 0.3
    if "consistency" in explanation.lower() or "ai" in explanation.lower() or "context" in explanation.lower(): score += 0.3
    return min(score, 1.0)

def run_evaluation():
    y_true = []
    y_pred = []
    y_scores = [] # For ROC
    ex_qualities = []
    robustness_passed = 0
    total_robustness_tests = 0
    
    results = []

    print("🚀 Starting Quantitative Evaluation...")

    # 1. Iterate through datasets
    for label_type, folder in DATA_DIRS.items():
        if not os.path.exists(folder):
            print(f"⚠️ Skipping missing folder: {folder}")
            continue
            
        files = [f for f in os.listdir(folder) if f.endswith(('.jpg', '.png'))]
        # Limit to 5 samples per category for speed during hackathon demo
        files = files[:5] 
        
        for filename in files:
            img_path = os.path.join(folder, filename)
            
            # Construct Claim
            txt_path = img_path.replace('.jpg', '.txt').replace('.png', '.txt')
            if os.path.exists(txt_path):
                with open(txt_path, 'r') as f:
                    claim = f.read().strip()
            else:
                claim = f"A photo of {filename}" # Fallback
            
            # Ground Truth
            is_misinfo_gt = True if label_type in ["MISMATCHED", "AI_GEN"] else False
            y_true.append(int(is_misinfo_gt))

            # --- NORMAL RUN ---
            report = analyze_post(img_path, claim)
            is_misinfo_pred = report['is_misinfo']
            y_pred.append(int(is_misinfo_pred))
            
            # ROC Probability Heuristic: max(AI Prob, 1 - Consistency)
            # This represents the probability that the system thinks it's Misinformation
            stats = report.get('technical_stats', {})
            ai_score = stats.get('ai_prob', 0)
            consist = stats.get('consistency', 1)
            misinfo_prob = max(ai_score, 1.0 - consist)
            y_scores.append(misinfo_prob)
            
            # Explanation Quality
            ex_qualities.append(evaluate_explanation_quality(report['explanation']))

            # --- ROBUSTNESS RUN (Randomly 50% change) ---
            if np.random.rand() > 0.5:
                total_robustness_tests += 1
                noisy_path = add_noise(img_path)
                if noisy_path:
                    report_noisy = analyze_post(noisy_path, claim)
                    # Robustness = Prediction shouldn't flip just because of noise
                    if report_noisy['is_misinfo'] == is_misinfo_pred:
                        robustness_passed += 1
                    try:
                        os.remove(noisy_path)
                    except: pass

            results.append({
                "File": filename,
                "Type": label_type,
                "GroundTruth": "Misinfo" if is_misinfo_gt else "Real",
                "Prediction": "Misinfo" if is_misinfo_pred else "Real",
                "Correct": is_misinfo_gt == is_misinfo_pred
            })
            print(f"Verified {filename} ({label_type}) -> {'✅' if is_misinfo_gt == is_misinfo_pred else '❌'}")

    # 2. Calculate Metrics
    if not y_true:
        return {"error": "No data found"}

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    # ROC / AUC
    try:
        fpr, tpr, thresholds = roc_curve(y_true, y_scores)
        roc_auc = auc(fpr, tpr)
        roc_data = [{"x": float(f), "y": float(t)} for f, t in zip(fpr, tpr)]
    except Exception as e:
        print(f"ROC Error: {e}")
        roc_auc = 0.5
        roc_data = [{"x": 0, "y": 0}, {"x": 1, "y": 1}]

    # Confusion Matrix
    try:
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = map(int, cm.ravel())
        confusion_data = {"tn": tn, "fp": fp, "fn": fn, "tp": tp}
    except Exception as e:
        print(e)
        confusion_data = {"tn": 0, "fp": 0, "fn": 0, "tp": 0}

    robustness_score = robustness_passed / total_robustness_tests if total_robustness_tests > 0 else 0
    avg_ex_quality = np.mean(ex_qualities) if ex_qualities else 0

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "auc_score": round(roc_auc, 4),
        "roc_curve": roc_data,
        "confusion_matrix": confusion_data,
        "robustness": round(robustness_score, 4),
        "explanation_quality": round(avg_ex_quality, 4)
    }

    # Save to file
    with open(METRICS_FILE, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print("\n📊 Evaluation Complete!")
    print(json.dumps(metrics, indent=2))
    return metrics

if __name__ == "__main__":
    run_evaluation()
