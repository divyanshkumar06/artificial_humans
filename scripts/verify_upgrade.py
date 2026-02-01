import requests
import json
import os

# Create a dummy test image if needed, or use an existing one
# For this test, we just need to hit the API and see the JSON structure/verdict format
# We'll expect the explanation to follow the "Verdict: ..." pattern

def test_api():
    url = "http://localhost:8000/analyze"
    
    # We need a real image file to pass the validation
    # Let's search for one or assume one exists in the uploads folder from previous steps
    # If not, we create a small dummy image
    image_path = "test_image.jpg"
    if not os.path.exists(image_path):
        from PIL import Image
        img = Image.new('RGB', (224, 224), color = (73, 109, 137))
        img.save(image_path)
    
    files = {'file': open(image_path, 'rb')}
    data = {'claim': 'This is a test claim for verification.'}
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ API Success!")
            print(f"Fake Probability: {result['technical_stats']['ai_prob']}")
            print("Explanation Preview:")
            print(result['explanation'][:200] + "...")
            
            # Check for the specific structure
            if "Verdict:" in result['explanation']:
                print("\n✅ Prompt Structure Verified: Found 'Verdict:'")
            else:
                print("\n⚠️ Prompt Structure Mismatch: 'Verdict:' not found.")
                
            if "Forensic Explanation:" in result['explanation']:
                print("✅ Prompt Structure Verified: Found 'Forensic Explanation:'")
        else:
            print(f"❌ API Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure the uvicorn server is running!")

if __name__ == "__main__":
    test_api()
