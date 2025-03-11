# app.py
import streamlit as st
import yaml
import os, sys
import json
from colorama import Fore, Style
from PIL import Image
import shutil
import base64
import glob
import pprint

from lib.videoz import veo_generate_and_poll

CLEANUP_GENERATED_FILES = False
APP_VERSION = '1.2'
APP_HISTORY = '''
20250310 v1.2 Added Prompting page
20250310 v1.1 Added Mosaic
20250310 v1.0 Created streamlit app with Gemini cloud code.
'''

# Import the classify_prompt function from classificator.py
# Add the directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from classificator import classify_prompt

# Import the image generation function from imagen.py
from imagen import generate_images

# Import the video generation function from veo.py
#from veo import main as generate_video

# Define Google logo colors
GOOGLE_COLORS = {
    "blue": "#4285F4",
    "red": "#EA4335",
    "yellow": "#FBBC05",
    "green": "#34A853",
}

HISTORY_FILE = "history.json"
OUTPUT_IMAGES_FOLDER = 'streamlit/generated_images/'
OUTPUT_VIDEOS_FOLDER = 'streamlit/generated_videos/'

# Load sample prompts from YAML
def load_sample_prompts(filepath="etc/prompts.yaml"):
    """Loads sample prompts from a YAML file."""
    try:
        with open(filepath, "r") as f:
            data = yaml.safe_load(f)
            return data["prompts"]
    except FileNotFoundError:
        st.error(f"Error: Prompts file '{filepath}' not found.")
        return []
    except Exception as e:
        st.error(f"Error loading prompts: {e}")
        return []

# Function to get the color based on the class
def get_color_for_class(classification):
    """Returns a Google logo color based on the classification."""
    if classification == "image_prompt":
        return GOOGLE_COLORS["blue"]
    elif classification == "video_prompt":
        return GOOGLE_COLORS["red"]
    elif classification == "code":
        return GOOGLE_COLORS["yellow"]
    elif classification == "url":
        return GOOGLE_COLORS["green"]
    elif classification == "chat":
        return GOOGLE_COLORS["blue"]
    elif classification == "summary":
        return GOOGLE_COLORS["red"]
    else:
        return "#000000"  # Default to black

def load_history():
    """Loads the history from the history file."""
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_history(history):
    """Saves the history to the history file."""
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def cleanup_generated_files(out_folder):
    """Removes the generated image files."""
    for filename in glob.glob(os.path.join(out_folder, "generated_image_*.png")):
        try:
            os.remove(filename)
        except FileNotFoundError:
            pass

def delete_media(history, media_file):
    """Deletes a media item from history and the file system."""
    for item in history:
        if "image_files" in item and media_file in item["image_files"]:
            try:
                os.remove(media_file)
                item["image_files"].remove(media_file)
                if not item["image_files"]:
                    history.remove(item)
                save_history(history)
                st.rerun()
            except FileNotFoundError:
                pass
            break

def display_mosaic_view(history):
    """Displays the mosaic view."""
    st.header("Mosaic View")
    all_media = []
    for item in history:
        if item["classification"] == "image_prompt":
            for image_file in item["image_files"]:
                all_media.append({"type": "image", "file": image_file, "prompt": item["prompt"]})
        elif item["classification"] == "video_prompt":
            if "video_files" in item:
                for video_file in item["video_files"]:
                    all_media.append({"type": "video", "file": video_file, "prompt": item["prompt"]})

    if all_media:
        cols = st.columns(4)
        for i, media in enumerate(all_media):
            with cols[i % 4]:
                if media["type"] == "image":
                    try:
                        image = Image.open(media["file"])
                        st.image(image, caption=f"Prompt: {media['prompt']}", use_container_width=True)
                        if st.button(f"Open media", key=f"open-{media['file']}"):
                            st.session_state.selected_media = media
                            st.session_state.current_view = "media"
                            st.rerun()
                        if st.button(f"Delete", key=f"delete-{media['file']}"):
                            delete_media(history, media["file"])
                    except FileNotFoundError:
                        st.write(f"Image {media['file']} not found.")
                elif media["type"] == "video":
                    try:
                        st.video(media["file"])
                        if st.button(f"Open media", key=f"open-{media['file']}"):
                            st.session_state.selected_media = media
                            st.session_state.current_view = "media"
                            st.rerun()
                        if st.button(f"Delete", key=f"delete-{media['file']}"):
                            delete_media(history, media["file"])
                    except FileNotFoundError:
                        st.write(f"Video {media['file']} not found.")
    else:
        st.write("No images or videos in history.")

def display_media_view(media):
    """Displays the selected media."""
    st.header(f"Media: {media['file']}")
    st.write(f"Prompt: {media['prompt']}")
    if media["type"] == "image":
        try:
            image = Image.open(media["file"])
            st.image(image, use_container_width=True)
        except FileNotFoundError:
            st.write(f"Image {media['file']} not found.")
    elif media["type"] == "video":
        try:
            st.video(media["file"])
        except FileNotFoundError:
            st.write(f"Video {media['file']} not found.")
    # Clear the selected media
    st.session_state.selected_media = None
    if st.button("Back to main"):
        st.session_state.current_view = "main"
        st.rerun()

def handle_image_prompt(cleanedup_prompt, history):
    """Handles the image_prompt classification."""
    st.write("Generating images...")
    image_files = generate_images(cleanedup_prompt, out_folder=OUTPUT_IMAGES_FOLDER)
    # Display images in a 2x2 grid
    cols = st.columns(2)
    for i, image_file in enumerate(image_files):
        with cols[i % 2]:
            st.image(Image.open(image_file), caption=image_file, use_container_width=True)
            # Add a link to download the full-size image
            with open(image_file, "rb") as f:
                st.download_button(
                    label="Download",
                    data=f,
                    file_name=image_file,
                    mime="image/png",
                )
    return image_files

def handle_video_prompt(cleanedup_prompt, history, folder=OUTPUT_VIDEOS_FOLDER):
    """Handles the video_prompt classification."""
    st.write("Generating videos (be patient, it can take up to 60 seconds)...")
    # Call the video generation function
    video_files_info = veo_generate_and_poll(prompt=cleanedup_prompt, output_folder=OUTPUT_VIDEOS_FOLDER)
    #video_files_info = veo_generate_and_poll(prompt=cleanedup_prompt, operation_id='projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/b140acd9-e1a6-4f56-897e-e7add5cac9a4', output_folder=OUTPUT_VIDEOS_FOLDER)
    pprint.pp(video_files_info)
    local_files_with_path = [os.path.join(folder, f) for f in os.listdir(folder)]
    st.write(f"## 1. video_files_info \n ```json\n{video_files_info}\n```")
    local_files = video_files_info.get('local_files', [])
    st.write(f"## 2. local_files \n{local_files}")
    st.write(f"## 3. local_files_with_path \n{local_files_with_path}\n")
#    gcs_stuff = video_files_info.get('gcs_stuff', {})

#     {'local_files': ['video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-1.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-2.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-3.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-4.mp4'],
#  'gcs_stuff': None}

    # Display the video
    if video_files_info:
        cols = st.columns(2)
        for i, video_file in enumerate(local_files_with_path):
            with cols[i % 2]:
                try:
                    st.video(video_file)
                    # Add a link to download the full-size video
                    with open(video_file, "rb") as f:
                        st.download_button(
                            label="Download",
                            data=f,
                            file_name=video_file,
                            mime="video/mp4",
                        )
                except FileNotFoundError:
                    st.write(f"Video {video_file} not found.")

    return local_files_with_path # video_files_info

def handle_code_prompt(cleanedup_prompt, history):
    """Handles the code classification."""
    st.write("Generating code...")
    # TODO: Add code generation and display here
    st.write("TODO: Add code generation and display here")
    return []

def handle_url_prompt(cleanedup_prompt, history):
    """Handles the url classification."""
    st.write("Parsing URL...")
    # TODO: Add URL parsing and display here
    st.write("TODO: Add URL parsing and display here")
    return []

def handle_chat_prompt(cleanedup_prompt, history):
    """Handles the chat classification."""
    st.write("Chatting...")
    # TODO: Add chat functionality here
    st.write("TODO: Add chat functionality here")
    return []

def handle_summary_prompt(cleanedup_prompt, history):
    """Handles the summary classification."""
    st.write("Summarizing...")
    # TODO: Add summary functionality here
    st.write("TODO: Add summary functionality here")
    return []

def handle_classification(classification, cleanedup_prompt, user_prompt, history):
    """Handles the classification and calls the appropriate function."""
    image_files = []
    video_files = []
    if classification == "image_prompt":
        image_files = handle_image_prompt(cleanedup_prompt, history)
    elif classification == "video_prompt":
        video_files = handle_video_prompt(cleanedup_prompt, history)
    elif classification == "code":
        handle_code_prompt(cleanedup_prompt, history)
    elif classification == "url":
        handle_url_prompt(cleanedup_prompt, history)
    elif classification == "chat":
        handle_chat_prompt(cleanedup_prompt, history)
    elif classification == "summary":
        handle_summary_prompt(cleanedup_prompt, history)
    else:
        st.write("Unknown class")

    # Save to history
    # TODO() check that those files actually exist.
    history.insert(0, {
        "prompt": user_prompt,
        "classification": classification,
        "image_files": [os.path.abspath(f) for f in image_files],
        "video_files": [os.path.abspath(f) for f in video_files],
    })
    save_history(history)

def display_prompting_view(history, sample_prompts):
    """Displays the prompting view."""
    st.header("Prompting View")
    # Textarea for user input
    selected_prompt_text = next(
        (
            prompt["text"]
            for prompt in sample_prompts
            if prompt["name"] == st.session_state.selected_prompt
        ),
        "",
    )
    user_prompt = st.text_area(
        "Enter your prompt here:",
        value=selected_prompt_text,
        height=150,
    )

    # Classify button
    if st.button("Classify"):
        if not user_prompt:
            st.warning("Please enter a prompt.")
        else:
            # Classify the prompt
            result = classify_prompt(user_prompt)

            if result:
                classification = result["classification"]
                cleanedup_prompt = result["cleanedup_prompt"]

                # Display the classification with color
                color = get_color_for_class(classification)
                st.markdown(
                    f"Classification: <tt style='color:{color}; font-size: 24px;'>{classification}</tt> found.",
                    unsafe_allow_html=True,
                )
                st.write(f"Cleaned up prompt: **{cleanedup_prompt}**")

                handle_classification(classification, cleanedup_prompt, user_prompt, history)

            else:
                st.error("Error during classification.")

def display_main_view(history, sample_prompts):
    """Displays the main view."""
    # We don't need anything here, we just use the sidebar buttons
    pass

# Streamlit app
def main():
    st.set_page_config(layout="wide")
    st.title("Prompt Classifier")

    # Cleanup generated files on startup
    # if CLEANUP_GENERATED_FILES:
    #     cleanup_generated_files(OUTPUT_IMAGES_FOLDER)
    # VIDEOleanup_generated_files(OUTPUT_IMAGES_FOLDER)
    # Load history
    history = load_history()

    # Load sample prompts
    sample_prompts = load_sample_prompts()

    # Initialize session state
    if "current_view" not in st.session_state:
        st.session_state.current_view = "prompting" # default to prompting
    if "selected_prompt" not in st.session_state:
        st.session_state.selected_prompt = sample_prompts[0]["name"] if sample_prompts else ""
    if "selected_media" not in st.session_state:
        st.session_state.selected_media = None

    # Sidebar for sample prompts and history
    st.sidebar.header("Sample Prompts")
    st.session_state.selected_prompt = st.sidebar.selectbox(
        "Choose a sample prompt:",
        [prompt["name"] for prompt in sample_prompts],
        index=0 if sample_prompts else None,
    )

    # Sidebar for history
    st.sidebar.header("History")
    selected_history_item = st.sidebar.selectbox(
        "Choose a previous generation:",
        [f"#{i+1}: {item['prompt'][:50]}..." for i, item in enumerate(history)],
        index=0 if history else None,
    )

    # Display history item if selected
    if selected_history_item:
        selected_history_index = int(selected_history_item.split(":")[0].replace("#", "")) - 1
        selected_history = history[selected_history_index]
        st.sidebar.write(f"Prompt: {selected_history['prompt']}")
        st.sidebar.write(f"Classification: {selected_history['classification']}")
        if selected_history['classification'] == "image_prompt":
            st.sidebar.write("Images:")
            cols = st.sidebar.columns(2)
            for i, image_file in enumerate(selected_history["image_files"]):
                with cols[i % 2]:
                    try:
                        st.image(Image.open(image_file), caption=image_file, use_container_width=True)
                    except FileNotFoundError:
                        st.write(f"Image {image_file} not found.")
        elif selected_history['classification'] == "video_prompt":
            st.sidebar.write("Videos:")
            cols = st.sidebar.columns(2)
            for i, video_file in enumerate(selected_history["video_files"]):
                with cols[i % 2]:
                    try:
                        st.video(video_file)
                    except FileNotFoundError:
                        st.write(f"Video {video_file} not found.")

    # Mosaic and Prompting buttons in sidebar
    st.sidebar.header("Navigation")
    if st.sidebar.button("Prompting"):
        st.session_state.current_view = "prompting"
        st.rerun()
    if st.sidebar.button("Mosaic"):
        st.session_state.current_view = "mosaic"
        st.rerun()

    # Main content area
    if st.session_state.current_view == "main":
        display_main_view(history, sample_prompts)
    elif st.session_state.current_view == "mosaic":
        display_mosaic_view(history)
    elif st.session_state.current_view == "media":
        display_media_view(st.session_state.selected_media)
    elif st.session_state.current_view == "prompting":
        display_prompting_view(history, sample_prompts)

if __name__ == "__main__":
    main()
