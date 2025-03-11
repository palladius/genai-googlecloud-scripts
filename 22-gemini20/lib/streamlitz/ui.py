
# todo

from .constantz import *



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
