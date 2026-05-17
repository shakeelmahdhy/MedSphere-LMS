import urllib.request
import json

url = "http://localhost:8000/api/auth/register"
data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "learner"
}
body = json.dumps(data).encode('utf-8')
req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
