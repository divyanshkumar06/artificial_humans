import traceback
import sys
import os

# Ensure root dir is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

print("🔍 Starting Debug Sequence...")

try:
    print("1. Initializing RobustnessEngine...")
    from engines.robustness import RobustnessEngine
    re = RobustnessEngine()
    print("   -> OK.")
except:
    print(f"❌ RobustnessEngine Failed:\n{traceback.format_exc()}")

try:
    print("\n2. Initializing ConsistencyEngine (CLIP)...")
    from engines.consistency import ConsistencyEngine
    ce = ConsistencyEngine()
    print("   -> OK.")
except:
    print(f"❌ ConsistencyEngine Failed:\n{traceback.format_exc()}")

try:
    print("\n3. Initializing ForensicsEngine (Deepfake ViT)...")
    from engines.forensics import ForensicsEngine
    fe = ForensicsEngine()
    print("   -> OK.")
except:
    print(f"❌ ForensicsEngine Failed:\n{traceback.format_exc()}")

print("\n🏁 Debug Sequence Complete.")
