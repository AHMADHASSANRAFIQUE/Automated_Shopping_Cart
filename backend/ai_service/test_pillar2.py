import requests
import json
import time

def test_full_automation():
    print("[TEST] Starting Professional Test: Phase 3 Pillar 2 (Full Automation Flow)")
    
    url = "http://localhost:8000/agent/checkout"
    payload = {
        "items": ["1 gallon of milk", "dozen eggs"],
        "store": "instacart"
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Automation Triggered: {result['message']}")
            print("\nWatch the browser window to see the AI in action...")
        else:
            print(f"[FAILURE] Test FAILED (Status Code: {response.status_code})")
            print(response.text)
            
    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")

if __name__ == "__main__":
    test_full_automation()
