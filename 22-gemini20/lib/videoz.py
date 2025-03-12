
from .authz import get_access_token
import requests
import os
import base64
import sys
import re
import time
from colorama import Style, Fore
import colorama
from google.cloud import storage

from lib.filez import write_to_file

# Veo Constants
LOCATION_ID = "us-central1"
API_ENDPOINT = "us-central1-aiplatform.googleapis.com"
VEO_MODEL_ID = "veo-2.0-generate-001"
VEO_PROJECT_ID = "veo-testing"

DFLT_POLLING_INTERVAL = 5  # Seconds
DFLT_MAX_POLLING_ATTEMPTS = 60  # 5 minutes max
DEFAULT_OUTPUT_FOLDER ="out/videos/"



def async_trigger_video_generation(prompt: str, sample_count: int = 4, duration_seconds: int = 8, aspect_ratio: str = "16:9", fps: str = "24", person_generation: str = "allow_adult", enable_prompt_rewriting: bool = True, add_watermark: bool = True, include_rai_reason: bool = True, image_file: str = None) -> str:
    """Generates a video using the specified prompt and parameters.

    Returns an operation id.
    """
    print(f"async_trigger_video_generation: image+file={image_file}")
    access_token = get_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    single_instance = {"prompt": prompt}

    if image_file:
        print("🎉 Oh wow - image given to us 🎉 {image_file}")
        print(f"async_trigger_video_generation: image_file={Fore.BLUE}{image_file}{Style.RESET_ALL}")

        with open(image_file, "rb") as f:
            image_data = f.read()
        encoded_image = base64.b64encode(image_data).decode("utf-8")
        single_instance["image"] = {
                "bytesBase64Encoded": encoded_image,
                "mimeType": "image/png", # TODO(ricc)L: detect MIME or filename.
        }
    #else:
        #print("🎉 DEBUG - no image given.")
        #exit(1)

    request_data = {
        "endpoint": f"projects/{VEO_PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}",
        "instances": [single_instance],
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


    # dump the request_data into a "veo_request.json":
    write_to_file('veo_request.json', request_data)


    url = f"https://{API_ENDPOINT}/v1/projects/{VEO_PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:predictLongRunning"
    response = requests.post(url, headers=headers, json=request_data)
    response.raise_for_status()  # Raise an exception for bad status codes

    operation_name_match = re.search(r'"name":\s*"([^"]+)"', response.text)
    if operation_name_match:
        operation_id = operation_name_match.group(1)
        print(f"Veo 🎥  OPERATION_ID: {operation_id} (you can get videos in 1min given this id..)")
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
    url = f"https://{API_ENDPOINT}/v1/projects/{VEO_PROJECT_ID}/locations/{LOCATION_ID}/publishers/google/models/{VEO_MODEL_ID}:fetchPredictOperation"
    response = requests.post(url, headers=headers, json=request_data)
    response.raise_for_status()
    return response.json()

def clean_prompt_for_filename_old(prompt: str) -> str:
    """Cleans the prompt to be used as part of a filename."""
    # Remove strange characters and replace spaces with underscores
    # Also remove \n and stuff..
    #prompt = re.sub(r'[^a-zA-Z0-9_]', '', prompt) # copied from images...
    cleaned_prompt = re.sub(r"[^\w\s-]", "", prompt).replace(" ", "_")
    # Chop to max 64 characters -> 96 now.
    return cleaned_prompt[:96]
#import re

def clean_prompt_for_filename(prompt: str) -> str:
    """Cleans the prompt to be used as part of a filename."""
    # Remove strange characters, newline characters, and replace spaces with underscores
    # Keep only alphanumeric characters and underscores
    cleaned_prompt = re.sub(r"[^\w]", "_", prompt)
    # Remove multiple consecutive underscores
    cleaned_prompt = re.sub(r"_{2,}", "_", cleaned_prompt)
    # Remove leading and trailing underscores
    cleaned_prompt = cleaned_prompt.strip("_")
    # Chop to max 96 characters
    return cleaned_prompt[:96]



def decode_and_save_videos(response_json: dict, operation_id: str, prompt: str, output_folder: str = DEFAULT_OUTPUT_FOLDER):
    """Decodes base64-encoded videos and saves them to files."""
    if "response" not in response_json or "videos" not in response_json["response"]:
        raise ValueError("Invalid response format: 'response' or 'videos' key not found.")
    # Create output_folder if doesnt exist
    os.makedirs(output_folder, exist_ok=True)

    video_files = []
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
            full_filename = os.path.join(output_folder, output_file)
            decoded_data = base64.b64decode(base64_data)
            with open(full_filename, "wb") as f:
                f.write(decoded_data)
            print(f"Created: {full_filename}")
            video_files.append(full_filename)
        except Exception as e:
            print(f"Error decoding or saving video to {output_file}: {e}")
        counter += 1
    return video_files


def save_videos_to_gcs(prompt, operation_id, veo_gs_bucket=None): #
    """Saves all files called video-{operation_id}-X.mp4 to GCS using the Cloud Storage library."""
    print(f"Output prompt={prompt} to GCS: {veo_gs_bucket}")
    if veo_gs_bucket is None:
        print(f"Warning: veo_gs_bucket is not set. Skipping GCS upload.")
        return

    operation_uuid = operation_id.split('/')[-1]
    bucket_name = veo_gs_bucket.replace("gs://", "")
    if "/" in bucket_name:
        bucket_name = bucket_name.split("/")[0]

    destination_folder = f"gemini20/videos/{operation_uuid}/"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    video_files = [f for f in os.listdir(".") if f.startswith(f"video-") and operation_uuid in f and f.endswith(".mp4")]

    final_destinations = []

    for video_file in video_files:
        final_destination = f"{veo_gs_bucket}/{destination_folder}/{video_file}" # file dest
        blob = bucket.blob(os.path.join(destination_folder, video_file))
        try:
            blob.upload_from_filename(video_file)
            print(f"File {video_file} uploaded to {veo_gs_bucket}/{destination_folder}/{video_file}.")
            final_destinations.append(final_destination)
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
        print(f"📔 README uploaded to {veo_gs_bucket}/{destination_folder}/{readme_file}.")
        final_destinations.append(os.path.join(destination_folder, readme_file))
    except Exception as e:
        print(f"Error uploading {readme_file} to GCS: {e}")

    # Deletes local copy of README
    os.remove(readme_file)
    return { "gcs_folder" : destination_folder, "files" : final_destinations }


def veo_generate_and_poll(prompt, veo_gs_bucket=None, polling_interval=DFLT_POLLING_INTERVAL, max_polling_attempts=DFLT_MAX_POLLING_ATTEMPTS, save_to_gcs=True, operation_id=None, output_folder=None, image_file=None):
    '''Given a video prompt, it calls the API and polls it every 5 seconds until it's done.

    Note: if Op is None, calls the API. If not none, it means we know it was already called and we're just doing the polling and get videos and do the ambaradan from base564 into files.

    return a dictionary with relevant data.

    TODO: implement a DELETE adfterwards. for now good to keep.

    '''
    video_files = []

    if output_folder is None:
        output_folder = "./"
    #os.chdir(output_folder)


    print(f"veo_generate_and_poll(veo_gs_bucket={Fore.BLUE}{veo_gs_bucket}{Style.RESET_ALL}) called. Prompt: {Fore.YELLOW}{prompt}{Style.RESET_ALL}")
    #print(f"veo_generate_and_poll(image_file={Fore.BLUE}{image_file}{Style.RESET_ALL})")
    # Phaes 1: async gen video and get op it

    try:
        if operation_id is None:
            operation_id = async_trigger_video_generation(prompt, image_file=image_file)
        else:
            print(f"Operation given as arg ({operation_id}). Wow! Skipping generation then.")
    except Exception as e:
        print(f"Error during video generation: {e}")
        return video_files

    # Phaes 2: poll from op id...

    print("💤 Polling for video generation completion...")
    polling_attempts = 0
    while polling_attempts < max_polling_attempts:
        try:
            response_json = retrieve_video(operation_id)
            if response_json.get("done"):
                print("🎥 Video generation complete.")

                video_files = decode_and_save_videos(response_json, operation_id, prompt, output_folder)
                print(f"🎥 OK Done processing videos. video_files={video_files}")
                if save_to_gcs:
                        folder_and_files = save_videos_to_gcs(prompt, operation_id, veo_gs_bucket)
                return { "local_files" : video_files, "gcs_stuff" : folder_and_files , "operation_id": operation_id}

            else:
                print(f"💤 Video generation not yet complete. Attempt {polling_attempts+1}/{max_polling_attempts}... 💤 Sleeping {polling_interval}s")
                polling_attempts += 1
                time.sleep(polling_interval)
                #return video_files
        except Exception as e:
            print(f"Error during video retrieval: {e}. Maybe check error: cat veo_error.json | jq .error ")
            if response_json and "error" in response_json:
                print(f"JSON Error from Veo APIs: {Fore.RED}{response_json['error']}{Style.RESET_ALL}", file=sys.stderr)
                write_to_file('veo_error.json', response_json)
            return video_files

    error = f"Error: Max polling attempts ({max_polling_attempts}) reached. Video generation may have failed or is taking too long."
    print(error)
    return { "error": error, "operation_id": operation_id, video_files: video_files }



                    # find files by matching operation_id..
#                    try:
#                   except Exception as e:
#                       print(f"Error during GCS saving: {e}. No biggie.")
