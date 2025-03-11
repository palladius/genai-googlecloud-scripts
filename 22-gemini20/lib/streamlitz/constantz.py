import streamlit as st

from colorama import Fore, Style
from PIL import Image

#from ...utils.imagen import generate_images
#from ...imagen  import generate_images
#from ...imagen  import generate_images # OLD

CLEANUP_GENERATED_FILES = False
HISTORY_FILE = "history.json"
OUTPUT_IMAGES_FOLDER = 'streamlit/generated_images/'
OUTPUT_VIDEOS_FOLDER = 'streamlit/generated_videos/'

APP_NAME = 'Gemini 2.0 AutoPrompter'
APP_VERSION = '1.3'
APP_HISTORY = '''
20250310 v1.3 Video generation now works smoothly!
20250310 v1.2 Added Prompting page
20250310 v1.1 Added Mosaic
20250310 v1.0 Created streamlit app with Gemini cloud code.
'''


# Define Google logo colors
GOOGLE_COLORS = {
    "blue": "#4285F4",
    "red": "#EA4335",
    "yellow": "#FBBC05",
    "green": "#34A853",
}
