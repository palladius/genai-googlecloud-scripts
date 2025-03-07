import sys
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import datetime
import re

from constants import *
from colorama import Fore, Style

load_dotenv()

APP_VERSION = '1.0'
APP_NAME = 'Image Generation Tool'

#IMAGE_PROMPT = 'Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.'

def print_help():
    print(f"""
Image Generation Tool

Usage:
    python imagen.py [--help] <image_prompt>

    <image_prompt>: The description of the image you want to generate.

Options:
    --help: Display this help message.

Examples:
    python imagen.py Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.
    python imagen.py --help
    python imagen.py A CD cover with elements of Pink Floyd and Genesis
    python imagen.py 'A futuristic cityscape at sunset with 4-colored traffic lights, in the style of Dali.'
    """)
    sys.exit(0)

def create_filename_from_prompt(prompt, extension='png'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    '''
    return ...


def create_filename_from_prompt(prompt, id='', extension='png'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.

    Should have some sort of ID.
    '''
    max_length = 96 # 64

    # Get current date in YYYYMMDD format
    today = datetime.date.today().strftime("%Y%m%d")

    # Shorten the prompt if it's too long
    if len(prompt) > max_length:
        prompt = prompt[:max_length]

    # Replace spaces with underscores
    prompt = prompt.replace(" ", "_")

    # Remove any characters that are not alphanumeric or underscores
    prompt = re.sub(r'[^a-zA-Z0-9_]', '', prompt)

    # Construct the filename
    filename = f"{today}_{prompt}_{id}.{extension}"
    return filename


def main():
    if len(sys.argv) < 2 or "--help" in sys.argv:
        print_help()

    image_prompt = ' '.join(sys.argv[1:])

    client = genai.Client(api_key=GEMINI_API_KEY)

    print(f"Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

    response = client.models.generate_images(
        model='imagen-3.0-generate-002',
#        model='imagen-3.0-generate',
        prompt=image_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=4,
        )
    )

    image_counter = 1
    for generated_image in response.generated_images:
        image = Image.open(BytesIO(generated_image.image.image_bytes))
        #image.show()
        filename = create_filename_from_prompt(image_prompt, id=image_counter) #id=image_counter,
        print(f"Saving image to: {filename}")
        image.save(f"{filename}")
        image_counter +=1

if __name__ == "__main__":
    main()
