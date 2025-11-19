import google.auth
from google.auth.transport.requests import Request

try:
    credentials, project = google.auth.default()
    print(f"Credentials found for project: {project}")
    credentials.refresh(Request())
    print("Refresh successful")
    print(f"Token: {credentials.token[:10]}...")
except Exception as e:
    print(f"Error: {e}")
