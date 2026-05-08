import requests
import json
import time

def test_parsing_intelligence():
    print("[TEST] Starting Professional Test: Phase 3 Pillar 1 (Intelligence Parsing)")
    
    url = "http://localhost:8000/agent/parse"
    payload = {
        "items": ["2 packs of organic chicken breasts", "1 gallon 2% milk", "dozen large brown eggs", "ripe avocados"],
        "store": "instacart"
    }
    
    try:
        start_time = time.time()
        response = requests.post(url, json=payload)
        end_time = time.time()
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Test PASSED (Time taken: {end_time - start_time:.2f}s)")
            print("\nAI Parsing Results:")
            print(json.dumps(result["specs"], indent=2))
        else:
            print(f"[FAILURE] Test FAILED (Status Code: {response.status_code})")
            print(response.text)
            
    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")

if __name__ == "__main__":
    # Wait a bit for the server to spin up
    time.sleep(3)
    test_parsing_intelligence()
