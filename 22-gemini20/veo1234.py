import requests
import json
import subprocess
import time
import base64
import os
import re
import argparse
from typing import List
from google.cloud import storage
from colorama import Style, Fore
from lib.filez import * # write_to_file
import sys

APP_VERSION = '1.5'
APP_NAME = 'Veo cURL-based video-generator'
APP_DESCRIPTION = 'Veo video generator from cURL since I still have to figure out how to do it with genai official libs'
APP_CHANGELOG = '''
20250310 v1.6 Better error handling from Veo APIs.
20250309 v1.5 Added write_to_file for broken stuff.
20250309 v1.4 Waiting4Paolo. Accepting prompt from STDIN and from file
20250309 v1.3 Waiting4Paolo. Some nice addons and fixing install for Mac.
20250308 v1.2 happy women's day, added support for GCS and it WORKS!
20250308 v1.2b Just nice skleep icon
20250307 v1.1 copied from above folder and moved to 1.1.
20250307 v1.0  Was just in above folder under experiments/
'''
# Configuration (you might want to move these to a config file)
PROJECT_ID = "veo-testing"
LOCATION_ID = "us-central1"
API_ENDPOINT = "us-central1-aiplatform.googleapis.com"
VEO_MODEL_ID = "veo-2.0-generate-001"
POLLING_INTERVAL = 5  # Seconds
MAX_POLLING_ATTEMPTS = 60  # 5 minutes max
SAVE_TO_GCS = True
VEO_GS_BUCKET = os.getenv('VEO_GS_BUCKET')

#APP_VERSION = '0.2'
#APP_NAME = 'Veo Video Generator - uses Veo to create 5sec videos based on some prompt. Also the filename is based on prompt like MJ (TODO)'

#print(f"🎥 Veo Generator v{APP_VERSION}: {Style.BRIGHT}{Fore.WHITE}At piasria!{Style.RESET_ALL} 📹")
print(f"🎥 {Fore.BLUE}{APP_NAME}{Style.RESET_ALL} v{APP_VERSION} 📹")


def get_access_token():
    """Gets an access token using gcloud."""
    try:
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error getting access token: {e}")
        raise


def generate_video(prompt: str, sample_count: int = 4, duration_seconds: int = 8, aspect_ratio: str = "16:9", fps: str = "24", person_generation: str = "allow_adult", enable_prompt_rewriting: bool = True, add_watermark: bool = True, include_rai_reason: bool = True) -> str:
    """Generates a video using the specified prompt and parameters."""
    access_token = get_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    request_data = {
        "endpoint": f"projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}",
        "instances": [{"prompt": prompt}],
        "parameters": {
            "aspectRatio": aspect_ratio,
            "sampleCount": sample_count,
            "durationSeconds": str(duration_seconds),
            "fps": fps,
            "personGeneration": person_generation,
            "enablePromptRewriting": enable_prompt_rewriting,
            "addWatermark": add_watermark,
            "includeRaiReason": include_rai_reason,
        },
    }

    url = f"https://{API_ENDPOINT}/v1/projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:predictLongRunning"
    response = requests.post(url, headers=headers, json=request_data)
    response.raise_for_status()  # Raise an exception for bad status codes

    operation_name_match = re.search(r'"name":\s*"([^"]+)"', response.text)
    if operation_name_match:
        operation_id = operation_name_match.group(1)
        print(f"OPERATION_ID: {operation_id}")
        return operation_id
    else:
        raise ValueError("Could not extract operation ID from response.")


def retrieve_video(operation_id: str) -> dict:
    """Retrieves the video generation result using the operation ID."""
    access_token = get_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    request_data = {"operationName": operation_id}
    url = f"https://{API_ENDPOINT}/v1/projects/{PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:fetchPredictOperation"
    response = requests.post(url, headers=headers, json=request_data)
    response.raise_for_status()
    return response.json()


def clean_prompt_for_filename(prompt: str) -> str:
    """Cleans the prompt to be used as part of a filename."""
    # Remove strange characters and replace spaces with underscores
    cleaned_prompt = re.sub(r"[^\w\s-]", "", prompt).replace(" ", "_")
    # Chop to max 64 characters
    return cleaned_prompt[:64]


def decode_and_save_videos(response_json: dict, operation_id: str, prompt: str):
    """Decodes base64-encoded videos and saves them to files."""
    if "response" not in response_json or "videos" not in response_json["response"]:
        raise ValueError("Invalid response format: 'response' or 'videos' key not found.")

    videos = response_json["response"]["videos"]
    counter = 1
    cleaned_prompt = clean_prompt_for_filename(prompt)
    for video in videos:
        if "bytesBase64Encoded" not in video:
            print(f"Warning: 'bytesBase64Encoded' not found in video data. Skipping.")
            continue

        base64_data = video["bytesBase64Encoded"]
        if not base64_data:
            print(f"Warning: Empty base64 data encountered. Skipping.")
            continue


        output_file = f"video-{cleaned_prompt}-{operation_id.split('/')[-1]}-{counter}.mp4"
        try:
            decoded_data = base64.b64decode(base64_data)
            with open(output_file, "wb") as f:
                f.write(decoded_data)
            print(f"Created: {output_file}")
        except Exception as e:
            print(f"Error decoding or saving video to {output_file}: {e}")
        counter += 1


def save_videos_to_gcs(prompt, operation_id):
    """Saves all files called video-{operation_id}-X.mp4 to GCS using the Cloud Storage library."""
    print(f"Output prompt={prompt} to GCS: {VEO_GS_BUCKET}")
    if VEO_GS_BUCKET is None:
        print(f"Warning: VEO_GS_BUCKET is not set. Skipping GCS upload.")
        return

    operation_uuid = operation_id.split('/')[-1]
    bucket_name = VEO_GS_BUCKET.replace("gs://", "")
    if "/" in bucket_name:
        bucket_name = bucket_name.split("/")[0]

    destination_folder = f"gemini20/videos/{operation_uuid}/"
    #output_folder = f"{VEO_GS_BUCKET}/gemini20/videos/{operation_uuid}/"


    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    video_files = [f for f in os.listdir(".") if f.startswith(f"video-") and operation_uuid in f and f.endswith(".mp4")]

    for video_file in video_files:
        blob = bucket.blob(os.path.join(destination_folder, video_file))
        try:
            blob.upload_from_filename(video_file)
            print(f"File {video_file} uploaded to {VEO_GS_BUCKET}/{destination_folder}/{video_file}.")
        except Exception as e:
            print(f"Error uploading {video_file} to GCS: {e}")

    # Create and upload README.md
    readme_content = f"Model: {VEO_MODEL_ID}\nOperation id: {operation_id}\n## Prompt\n{prompt}"
    readme_file = "README.md"
    with open(readme_file, "w") as f:
        f.write(readme_content)

    readme_blob = bucket.blob(os.path.join(destination_folder, readme_file))
    try:
        readme_blob.upload_from_filename(readme_file)
        print(f"File {readme_file} uploaded to {VEO_GS_BUCKET}/{destination_folder}/{readme_file}.")
    except Exception as e:
        print(f"Error uploading {readme_file} to GCS: {e}")

    os.remove(readme_file)

def get_prompt_from_source(prompt_file, argv_prompt):
    """
    Gets the prompt from either a file or command-line arguments.

    Args:
        prompt_file: Path to the prompt file or "-" for stdin.
        argv_prompt: Prompt provided through command line arguments (list of strings).

    Returns:
        The prompt as a string.
    """
    if prompt_file:
        if prompt_file == "-":
            print("Reading prompt from stdin...")
            prompt = sys.stdin.read().strip()
        else:
            try:
                with open(prompt_file, "r") as f:
                    prompt = f.read().strip()
            except FileNotFoundError:
                print(f"Error: Prompt file '{prompt_file}' not found.")
                return None
            except Exception as e:
                print(f"Error reading prompt file '{prompt_file}': {e}")
                return None
    elif argv_prompt:
      prompt = " ".join(argv_prompt)
    else:
      prompt = None

    return prompt

def main():
    """Main function to orchestrate the video generation, retrieval, and decoding."""
    parser = argparse.ArgumentParser(
        description=f"{APP_NAME} - {APP_DESCRIPTION}",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "-v",
        "--version",
        action="version",
        version=f"%(prog)s {APP_VERSION}",
    )
    parser.add_argument(
        "--promptfile",
        help="""Path to a file containing the video generation prompt.
        Use '-' to read from stdin. If provided, command line prompt is ignored.""",
        default=None
    )
    parser.add_argument(
        "prompt",
        nargs="*",
        help="""Prompt for video generation.
        Examples:
        - "Shrek wakes up in Milan, the view from Shrek to the Castello Sforzesco out of the window"
        - "A cat playing the piano in a jazz club, cinematic lighting"
        - "A futuristic city at night, neon lights, flying cars"
        - "A beautiful landscape with mountains and a lake, time-lapse"
        - "A robot dancing in a disco, 80s style"
        - "A dragon flying over a medieval castle, epic music"
        - "A group of people laughing and having fun at a party"
        - "A dog surfing on a wave, slow motion"
        - "A person walking in a forest, autumn colors"
        - "A spaceship landing on Mars, science fiction"
        - "A cinematic shot captures a fluffy Cockapoo, perched atop a vibrant pink flamingo float, in a sun-drenched Los Angeles swimming pool. The crystal-clear water sparkles under the bright California sun, reflecting the playful scene. The Cockapoo's fur, a soft blend of white and apricot, is highlighted by the golden sunlight, its floppy ears gently swaying in the breeze. Its happy expression and wagging tail convey pure joy and summer bliss. The vibrant pink flamingo adds a whimsical touch, creating a picture-perfect image of carefree fun in the LA sunshine
        - "A cinematic shot captures a fluffy Cockapoo, perched atop a vibrant pink flamingo float, in a sun-drenched Zurich See beach. The crystal-clear water sparkles under the bright Swiss sun, reflecting the playful scene. The Cockapoo's fur, a soft blend of white and apricot, is highlighted by the golden sunlight, its floppy ears gently swaying in the breeze. Its happy expression and wagging tail convey pure joy and summer bliss. The vibrant pink flamingo adds a whimsical touch, creating a picture-perfect image of carefree fun in the swiss sunshine"
        - 'Dramatic rotating view of a Panettone on a table. On top, a writing appears: "Panettone is on the table"'
        """,
    )

    args = parser.parse_args()

    prompt = get_prompt_from_source(args.promptfile, args.prompt)
    if prompt is None:
        if not args.promptfile:
            parser.print_help()
        return
    print(f"Generating video with prompt: '{prompt}'")

    try:
        operation_id = generate_video(prompt)
    except Exception as e:
        print(f"Error during video generation: {e}")
        return

    print("💤 Polling for video generation completion...")
    polling_attempts = 0
    while polling_attempts < MAX_POLLING_ATTEMPTS:
        try:
            response_json = retrieve_video(operation_id)
            if response_json.get("done"):
                print("🎥 Video generation complete.")

                decode_and_save_videos(response_json, operation_id, prompt)
                print("🎥 OK Done processing videos.")
                if SAVE_TO_GCS:
                    #print(f"Let's now save to a GCP bucket: {}")
                    # find files by matching operation_id..
                    save_videos_to_gcs(prompt, operation_id)
                return
            else:
                print(f"💤 Video generation not yet complete. Attempt {polling_attempts+1}/{MAX_POLLING_ATTEMPTS}... 💤 Sleeping {POLLING_INTERVAL}s")
                polling_attempts += 1
                time.sleep(POLLING_INTERVAL)
        except Exception as e:
            print(f"Error during video retrieval: {e}. Maybe check error: cat veo_error.json | jq .error ")
            if response_json and "error" in response_json:
                print(f"JSON Error from Veo APIs: {Fore.RED}{response_json['error']}{Style.RESET_ALL}", file=sys.stderr)
                write_to_file('veo_error.json', response_json)
            return

    print(f"Error: Max polling attempts ({MAX_POLLING_ATTEMPTS}) reached. Video generation may have failed or is taking too long.")


if __name__ == "__main__":
    main()
