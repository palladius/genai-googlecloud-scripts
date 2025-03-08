'''
Use veo1234 instead on parent folder :)
'''
# import requests
# import json
# import subprocess
# import time
# import base64
# import os
# import re
# from typing import List

# APP_VERSION='1.0'
# APP_NAME = 'Veo cURL-based video-generator'
# APP_DESCRIPTION = 'Veo video generator from cURL since I still have to figure out how to do it with genai official libs'

# # Configuration (you might want to move these to a config file)
# PROJECT_ID = "veo-testing"
# LOCATION_ID = "us-central1"
# API_ENDPOINT = "us-central1-aiplatform.googleapis.com"
# VEO_MODEL_ID = "veo-2.0-generate-001"
# POLLING_INTERVAL = 5  # Seconds
# MAX_POLLING_ATTEMPTS = 60 # 5 minutes max

# def get_access_token():
#     """Gets an access token using gcloud."""
#     try:
#         result = subprocess.run(
#             ["gcloud", "auth", "print-access-token"],
#             capture_output=True,
#             text=True,
#             check=True,
#         )
#         return result.stdout.strip()
#     except subprocess.CalledProcessError as e:
#         print(f"Error getting access token: {e}")
#         raise

# def generate_video(prompt: str, sample_count: int = 4, duration_seconds: int = 8, aspect_ratio: str = "16:9", fps: str = "24", person_generation: str = "allow_adult", enable_prompt_rewriting: bool = True, add_watermark: bool = True, include_rai_reason: bool = True) -> str:
#     """Generates a video using the specified prompt and parameters."""
#     access_token = get_access_token()
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {access_token}",
#     }
#     request_data = {
#         "endpoint": f"projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}",
#         "instances": [{"prompt": prompt}],
#         "parameters": {
#             "aspectRatio": aspect_ratio,
#             "sampleCount": sample_count,
#             "durationSeconds": str(duration_seconds),
#             "fps": fps,
#             "personGeneration": person_generation,
#             "enablePromptRewriting": enable_prompt_rewriting,
#             "addWatermark": add_watermark,
#             "includeRaiReason": include_rai_reason,
#         },
#     }

#     url = f"https://{API_ENDPOINT}/v1/projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:predictLongRunning"
#     response = requests.post(url, headers=headers, json=request_data)
#     response.raise_for_status()  # Raise an exception for bad status codes

#     operation_name_match = re.search(r'"name":\s*"([^"]+)"', response.text)
#     if operation_name_match:
#         operation_id = operation_name_match.group(1)
#         print(f"OPERATION_ID: {operation_id}")
#         return operation_id
#     else:
#         raise ValueError("Could not extract operation ID from response.")

# def retrieve_video(operation_id: str) -> dict:
#     """Retrieves the video generation result using the operation ID."""
#     access_token = get_access_token()
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {access_token}",
#     }
#     request_data = {"operationName": operation_id}
#     url = f"https://{API_ENDPOINT}/v1/projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:fetchPredictOperation"
#     response = requests.post(url, headers=headers, json=request_data)
#     response.raise_for_status()
#     return response.json()

# def clean_prompt_for_filename(prompt: str) -> str:
#     """Cleans the prompt to be used as part of a filename."""
#     # Remove strange characters and replace spaces with underscores
#     cleaned_prompt = re.sub(r"[^\w\s-]", "", prompt).replace(" ", "_")
#     # Chop to max 64 characters
#     return cleaned_prompt[:64]

# def decode_and_save_videos(response_json: dict, operation_id: str, prompt: str):
#     """Decodes base64-encoded videos and saves them to files."""
#     if "response" not in response_json or "videos" not in response_json["response"]:
#         raise ValueError("Invalid response format: 'response' or 'videos' key not found.")

#     videos = response_json["response"]["videos"]
#     counter = 1
#     cleaned_prompt = clean_prompt_for_filename(prompt)
#     for video in videos:
#         if "bytesBase64Encoded" not in video:
#             print(f"Warning: 'bytesBase64Encoded' not found in video data. Skipping.")
#             continue

#         base64_data = video["bytesBase64Encoded"]
#         if not base64_data:
#             print(f"Warning: Empty base64 data encountered. Skipping.")
#             continue

#         output_file = f"video-{cleaned_prompt}-{operation_id.split('/')[-1]}-{counter}.mp4"
#         try:
#             decoded_data = base64.b64decode(base64_data)
#             with open(output_file, "wb") as f:
#                 f.write(decoded_data)
#             print(f"Created: {output_file}")
#         except Exception as e:
#             print(f"Error decoding or saving video to {output_file}: {e}")
#         counter += 1

# def main():
#     """Main function to orchestrate the video generation, retrieval, and decoding."""
#     prompt = "Shrek wakes up in Milan, the view from Shrek to the Castello Sforzesco out of the window"
#     print(f"Generating video with prompt: '{prompt}'")

#     try:
#         operation_id = generate_video(prompt)
#     except Exception as e:
#         print(f"Error during video generation: {e}")
#         return

#     print("Polling for video generation completion...")
#     polling_attempts = 0
#     while polling_attempts < MAX_POLLING_ATTEMPTS:
#         try:
#             response_json = retrieve_video(operation_id)
#             if response_json.get("done"):
#                 print("Video generation complete.")
#                 decode_and_save_videos(response_json, operation_id, prompt)
#                 print("Done processing videos.")
#                 return
#             else:
#                 print(f"Video generation not yet complete. Attempt {polling_attempts+1}/{MAX_POLLING_ATTEMPTS}...")
#                 polling_attempts += 1
#                 time.sleep(POLLING_INTERVAL)
#         except Exception as e:
#             print(f"Error during video retrieval: {e}")
#             return

#     print(f"Error: Max polling attempts ({MAX_POLLING_ATTEMPTS}) reached. Video generation may have failed or is taking too long.")

# if __name__ == "__main__":
#     main()
