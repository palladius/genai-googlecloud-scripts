# app.py
from os import stat_result


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

# Add the project root to sys.path
project_root = os.path.dirname(os.path.abspath(__file__))
project_parent = os.path.dirname(project_root)
sys.path.insert(0, project_parent)  # Go up one level to genai-googlecloud-scripts

#from lib.videoz import veo_generate_and_poll
from lib.streamlitz.constantz import *
from lib.streamlitz.ui import * # get_color_for_class
from lib.streamlitz.media import handle_image_prompt, handle_video_prompt

# Import the classify_prompt function from classificator.py
from classificator import classify_prompt


def file_exists(file_name):
    '''implemented on a flight to istanbul so pls forgive me.

    TODO when internet is back, check if its ok.
    '''
    try:
        stat: stat_result = os.stat(file_name)
        print(stat)
        return True
    except FileNotFoundError as e:
        print('non trovato quindi falseo')
        return False
    print('🐞 Some other error probably a bug')
    return False

def show_video_if_exists(filename):
    if file_exists(filename):
        st.video(filename)
    else:
        short_file = filename.split('/')[-1]  # .last
        st.error(f"File exitiert nood: {short_file}")


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


def delete_media(history, media_file):
    """Deletes a media item from history and the file system."""
    for item in history:
        if "image_files" in item and media_file in item["image_files"]:
            try:
                if CLEANUP_GENERATED_FILES:
                    os.remove(media_file)
                item["image_files"].remove(media_file)
                if not item["image_files"]:
                    history.remove(item)
                save_history(history)
                st.rerun()
            except FileNotFoundError:
                pass
            break
        if "video_files" in item and media_file in item["video_files"]:
            try:
                if CLEANUP_GENERATED_FILES:
                    os.remove(media_file)
                item["video_files"].remove(media_file)
                if not item["video_files"]:
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
          # todo when back at a keyboard make nice indenting.
          # Note if file doesnt exist still i is incremented..
          if file_exists(media["file"]):
            with cols[i % 4]:
                if media["type"] == "image" and file_exists(media["file"]):
                    try:
                        image = Image.open(media["file"])
                        # help=media["prompt"],
                        #st.image(image, caption=f"_Prompt_: :blue[{media['prompt']}]",  use_container_width=True)
                        st.image(image, use_container_width=True)
                        col1, col2 = st.columns(2)
                        with col1:
                            if st.button(f"Open", key=f"open-{media['file']}", use_container_width=True, type="secondary"):
                                st.session_state.selected_media = media
                                st.session_state.current_view = "media"
                                st.rerun()
                        with col2:
                            if st.button(f"Del", key=f"delete-{media['file']}", use_container_width=True, type="primary"):
                                delete_media(history, media["file"])
                    except FileNotFoundError:
                        st.write(f"Image {media['file']} not found.")
                elif media["type"] == "video" and file_exists(media["file"]):
                    try:
                        # if file_exists(media["file"]):
                        #     st.video(media["file"])
                        show_video_if_exists(media["file"])
                        col1, col2 = st.columns(2)
                        with col1:
                            if st.button(f"Open 📹", key=f"open-{media['file']}"):
                                st.session_state.selected_media = media
                                st.session_state.current_view = "media"
                                st.rerun()
                        with col2:
                            if st.button(f"Del", key=f"delete-{media['file']}"):
                                delete_media(history, media["file"])
                    except FileNotFoundError:
                        st.write(f"Video {media['file']} not found.")
    else:
        st.write("No images or videos in history.")

def display_media_view(media):
    """Displays the selected media."""
#    st.header(f"Prompt: {media['prompt']}")
    st.header(media['prompt'])
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
    st.write(f"Media: {media['file']}")
    # Clear the selected media
    st.session_state.selected_media = None
    if st.button("Back to main"):
        st.session_state.current_view = "main"
        st.rerun()

def handle_code_prompt(cleanedup_prompt, history):
    """Handles the code classification."""
    st.write("Generating code...")
    # TODO: Add code generation and display here
    st.write("*TODO: Add code generation and display here*")
    return []

def handle_url_prompt(cleanedup_prompt, history):
    """Handles the url classification."""
    st.write("Parsing URL...")
    # TODO: Add URL parsing and display here
    st.write("*TODO: Add URL parsing and display here*")
    return []

def handle_chat_prompt(cleanedup_prompt, history):
    """Handles the chat classification."""
    st.write("Chatting...")
    # TODO: Add chat functionality here
    st.write("*TODO: Add chat functionality here*")
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
    operation_id = None
    if classification == "image_prompt":
        image_files = handle_image_prompt(cleanedup_prompt, history)
    elif classification == "video_prompt":
        video_files = []
        video_files, operation_id = handle_video_prompt(cleanedup_prompt, history)
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
    elem_to_insert = {
        "prompt": user_prompt,
        "classification": classification,
        "image_files": [os.path.abspath(f) for f in image_files],
        "video_files": [os.path.abspath(f) for f in video_files],
        #"operation_id": operation_id,
    }
    if operation_id:
        elem_to_insert["operation_id"] = operation_id
    history.insert(0, elem_to_insert)
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
    st.title(f"{APP_NAME} v{APP_VERSION}")

    #     # --- Top Bar ---
    # st.markdown(
    #     f"""
    #     <div style="background-color:#f0f0f0;padding:10px;border-radius:5px;">
    #         <h1 style="color:black;text-align:center;">{APP_NAME} v{APP_VERSION}</h1>
    #     </div>
    #     """,
    #     unsafe_allow_html=True,
    # )


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
        st.sidebar.write(f"Prompt: **{selected_history['prompt']}**")
        st.sidebar.write(f"Classification: {selected_history['classification']}")
        if selected_history['classification'] == "image_prompt":
            st.sidebar.write("Images:")
            cols = st.sidebar.columns(2)
            for i, image_file in enumerate(selected_history["image_files"]):
                with cols[i % 2]:
                    try:
#                        st.image(Image.open(image_file), caption=image_file, use_container_width=True)
                        st.image(Image.open(image_file), use_container_width=True)
                    except FileNotFoundError:
                        st.write(f"Image {image_file} not found.")
        elif selected_history['classification'] == "video_prompt":
            st.sidebar.write("Videos:")
            cols = st.sidebar.columns(2)
            for i, video_file in enumerate(selected_history["video_files"]):
                with cols[i % 2]:
                    try:
                        if file_exists(video_file):
                            st.video(video_file)
                    except FileNotFoundError:
                        st.write(f"Video {video_file} not found.")

    # Mosaic and Prompting buttons in sidebar
    st.sidebar.header("Navigation")
    if st.sidebar.button("🏡 Prompting"):
        st.session_state.current_view = "prompting"
        st.rerun()
    if st.sidebar.button("📷🖼️ Mosaic"):
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
