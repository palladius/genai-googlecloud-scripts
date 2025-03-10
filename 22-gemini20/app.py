# app.py


'''

Install: pip install streamlit pyyaml

## prompt

Wow! Now finally please create a small streamlit application that has a bit textarea and prompts me for any prompt. on the left it has some sample prompts: one with a sample video prompt, a sample image prompt, a sample code prompt, ... Once the user clicks on one of these sample prompts (contained conveniently in a etc/prompts.yaml) or types one, this calls the classification function in classificator.py. Based on the JSON class, it will then invoke specific per-class function (I'll implement it myself). It will type in the app the class chosen with one of the 4 google logo colors.


## p2

ok now lets add a function which, based on the (classification, prompt) couple, executes some code. Some will have to visualize local videos and images, so make sure the UI will allow for 4 images and videos to be attached.

Let's start with images. Im going to trigger an image function I already have in imagen.py , call it and return an array of 4 generated local  image files. The UI will need to present a clickable thumbnail.

## P3

Now I'd like on top left some sort of "mosaic" button which visualizes ALL the pictures in a tiled manner. Every picture and video from HISTORY.json is visualized and HOVER reveals their prompt. A click opens a page with just the image (this time BIG) and the prompt.
'''

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

# Import the classify_prompt function from classificator.py
# Add the directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from classificator import classify_prompt

# Import the image generation function from imagen.py
from imagen import generate_images

# Define Google logo colors
GOOGLE_COLORS = {
    "blue": "#4285F4",
    "red": "#EA4335",
    "yellow": "#FBBC05",
    "green": "#34A853",
}

HISTORY_FILE = "history.json"

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

def cleanup_generated_files(image_files):
    """Removes the generated image files."""
    for image_file in image_files:
        try:
            os.remove(image_file)
        except FileNotFoundError:
            pass

# Streamlit app
def main():
    st.set_page_config(layout="wide")
    st.title("Prompt Classifier")

    # Load history
    history = load_history()

    # Sidebar for sample prompts and history
    st.sidebar.header("Sample Prompts")
    sample_prompts = load_sample_prompts()
    selected_prompt = st.sidebar.selectbox(
        "Choose a sample prompt:",
        [prompt["name"] for prompt in sample_prompts],
    )

    # Find the selected prompt's text
    selected_prompt_text = next(
        (
            prompt["text"]
            for prompt in sample_prompts
            if prompt["name"] == selected_prompt
        ),
        "",
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

    # Mosaic button in sidebar
    st.sidebar.header("Mosaic")
    if st.sidebar.button("Mosaic"):
        st.session_state.show_mosaic = True
    else:
        st.session_state.show_mosaic = False

    # Main content area
    if st.session_state.show_mosaic:
        st.header("Mosaic View")
        all_media = []
        for item in history:
            if item["classification"] == "image_prompt":
                for image_file in item["image_files"]:
                    all_media.append({"type": "image", "file": image_file, "prompt": item["prompt"]})
            elif item["classification"] == "video_prompt":
                # TODO: Add video handling here
                pass

        if all_media:
            cols = st.columns(4)
            for i, media in enumerate(all_media):
                with cols[i % 4]:
                    if media["type"] == "image":
                        try:
                            image = Image.open(media["file"])
                            st.image(image, caption=f"Prompt: {media['prompt']}", use_column_width=True)
                            if st.button(f"Open {media['file']}", key=f"open-{media['file']}"):
                                st.session_state.selected_media = media
                                st.session_state.show_mosaic = False
                                st.experimental_rerun()
                        except FileNotFoundError:
                            st.write(f"Image {media['file']} not found.")
        else:
            st.write("No images or videos in history.")

    # Display selected media
    if "selected_media" in st.session_state and st.session_state.selected_media:
        media = st.session_state.selected_media
        st.header(f"Media: {media['file']}")
        st.write(f"Prompt: {media['prompt']}")
        if media["type"] == "image":
            try:
                image = Image.open(media["file"])
                st.image(image, use_column_width=True)
            except FileNotFoundError:
                st.write(f"Image {media['file']} not found.")
        # Clear the selected media
        st.session_state.selected_media = None

    # Main view (if not showing mosaic or selected media)
    if not st.session_state.show_mosaic and not ("selected_media" in st.session_state and st.session_state.selected_media):
        # Textarea for user input
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
                        f"<p style='color:{color}; font-size: 24px;'>Classification: {classification}</p>",
                        unsafe_allow_html=True,
                    )
                    st.write(f"Cleaned up prompt: {cleanedup_prompt}")

                    # Class-specific actions
                    image_files = []
                    if classification == "image_prompt":
                        st.write("Generating images...")
                        image_files = generate_images(cleanedup_prompt, out_folder='streamlit/generated_images/')
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
                    elif classification == "video_prompt":
                        st.write("Generating video...")
                        # TODO: Add video generation and display here
                        st.write("TODO: Add video generation and display here")
                    elif classification == "code":
                        st.write("Generating code...")
                        # TODO: Add code generation and display here
                        st.write("TODO: Add code generation and display here")
                    elif classification == "url":
                        st.write("Parsing URL...")
                        # TODO: Add URL parsing and display here
                        st.write("TODO: Add URL parsing and display here")
                    elif classification == "chat":
                        st.write("Chatting...")
                        # TODO: Add chat functionality here
                        st.write("TODO: Add chat functionality here")
                    elif classification == "summary":
                        st.write("Summarizing...")
                        # TODO: Add summary functionality here
                        st.write("TODO: Add summary functionality here")
                    else:
                        st.write("Unknown class")

                    # Save to history
                    history.insert(0, {
                        "prompt": user_prompt,
                        "classification": classification,
                        "image_files": [os.path.abspath(f) for f in image_files],
                    })
                    save_history(history)
                    # Cleanup generated files
                    cleanup_generated_files(image_files)

                else:
                    st.error("Error during classification.")

if __name__ == "__main__":
    main()
