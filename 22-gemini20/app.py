# app.py


'''

Install: pip install streamlit pyyaml

## prompt

Wow! Now finally please create a small streamlit application that has a bit textarea and prompts me for any prompt. on the left it has some sample prompts: one with a sample video prompt, a sample image prompt, a sample code prompt, ... Once the user clicks on one of these sample prompts (contained conveniently in a etc/prompts.yaml) or types one, this calls the classification function in classificator.py. Based on the JSON class, it will then invoke specific per-class function (I'll implement it myself). It will type in the app the class chosen with one of the 4 google logo colors.


## p2

ok now lets add a function which, based on the (classification, prompt) couple, executes some code. Some will have to visualize local videos and images, so make sure the UI will allow for 4 images and videos to be attached.

Let's start with images. Im going to trigger an image function I already have in imagen.py , call it and return an array of 4 generated local  image files. The UI will need to present a clickable thumbnail.

'''
# app.py
import streamlit as st
import yaml
import os, sys
from colorama import Fore, Style
from PIL import Image

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

# Streamlit app
def main():
    st.title("Prompt Classifier")

    # Load sample prompts
    sample_prompts = load_sample_prompts()

    # Sidebar for sample prompts
    st.sidebar.header("Sample Prompts")
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
                if classification == "image_prompt":
                    st.write("Generating images...")
                    image_files = generate_images(cleanedup_prompt)
                    # Display images as clickable thumbnails
                    cols = st.columns(4)
                    for i, image_file in enumerate(image_files):
                        with cols[i]:
                            st.image(Image.open(image_file), caption=image_file, use_column_width=True)
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
            else:
                st.error("Error during classification.")

if __name__ == "__main__":
    main()
