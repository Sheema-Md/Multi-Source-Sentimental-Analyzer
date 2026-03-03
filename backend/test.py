# Save as test_api.py in backend folder
import requests

# Test if endpoint exists
try:
    response = requests.post('http://localhost:5000/api/analyze', 
                           json={"query": "test", "sources": ["reddit"]})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")