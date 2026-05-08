import requests
import json
import time
import subprocess
import os

def test_backend_health():
    print("Starting backend test...")
    
    # 1. Start the server in the background
    process = subprocess.Popen(["python", "main.py"], cwd=".")
    time.sleep(5) # Wait for server to start
    
    try:
        # 2. Check root endpoint
        print("Checking root endpoint...")
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Status: {response.status_code}, Response: {response.json()}")
        
        # 3. Check agent search endpoint (simulated)
        print("Checking agent search endpoint...")
        payload = {"query": "milk", "vendor": "instacart"}
        # Note: In main.py, search_products is a GET query param in the example I wrote or POST?
        # Let's check main.py. It was @app.post("/agent/search") with query params.
        response = requests.post("http://127.0.0.1:8000/agent/search?query=milk&vendor=instacart")
        print(f"Status: {response.status_code}, Response: {response.json()}")
        
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        print("Stopping backend server...")
        process.terminate()

if __name__ == "__main__":
    test_backend_health()
