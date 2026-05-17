import requests

url = "http://localhost:8000/api/auth/register"
data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "learner"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
