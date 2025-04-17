import sys
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import datetime
import re
from colorama import Fore, Style

# Riccardo stuff
from constants import *
from lib.filez import * # create_filename_from_prompt

load_dotenv()

APP_VERSION = '1.3b'
APP_NAME = 'Image Generation Tool'
APP_HISTORY = '''
Seems broken !!
TODO: add save_to_gcs() functionality too.
2025-03-07 v1.3 Set up $0 and moved code to lib/ for better code reuse.
...
2025-03-07 v1.0 First working version.
'''

#IMAGE_PROMPT = 'Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.'

def print_help():
    #print(f"{Fore.BLUE}{APP_NAME} v{APP_VERSION}{Style.RESET_ALL}")
    # Use sys.argv[0] to get the script name dynamically
    # Better functionality: https://stackoverflow.com/questions/59297692/python-obtaining-the-oss-argv0-not-sys-argv0
    script_name = os.path.basename(sys.argv[0])

    script_name = "python " + script_name
    print(f"""
{APP_NAME} v{APP_VERSION}

Usage:
    {script_name} [--help] <image_prompt>

    <image_prompt>: The description of the image you want to generate.

Options:
    --help: Display this help message.

Examples:
    {script_name} Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.
    {script_name} --help
    {script_name} A CD cover with elements of Pink Floyd and Genesis
    {script_name} A futuristic cityscape at sunset with 4-colored traffic lights, in the style of Dali.
    {script_name} The swiss village of Duloc, with a lake, surrounded by alps, in the style of Shrek and Dreamworks.
    {script_name} 'Sicilian Volcano Etna erupts: From its lava emerges a beautiful fiery phoenix, in the style of Pixar'
    {script_name} 'A funny robotic puffin, surrounded by playful students, is coding a kids game on a computer. The computer screen shows a funny game. The image has a cartoon Shrek style. The robot has a tshirt with written "Gemini 2.5"'
    """)
    sys.exit(0)

def create_filename_from_prompt(prompt, extension='png'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    '''
    return ...

def generate_images(image_prompt, out_folder='out/', also_show_image=True):
    '''Generates images.

    TODO(ricc): move to lib/imagez.py
    '''
    image_filenames = []
    print(f"Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

    client = genai.Client(api_key=GEMINI_API_KEY)


    response = client.models.generate_images(
        model='imagen-3.0-generate-002',
        prompt=image_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=4,
            #aspect_ratio=types.AspectRatio.SQUARE,
            #image_bytes_base64_encoded=True,
        )
    )

    image_counter = 1
    # if not os.path.exists(out_folder):
    #     os.makedirs(out_folder)
    if not response.generated_images:
        print("No image was generated. Probably some issue with the prompt.")
        print(f"response for you to investigate: {Fore.RED}{response}{Style.RESET_ALL}")
        return []

    for generated_image in response.generated_images:
        image = Image.open(BytesIO(generated_image.image.image_bytes))
        if also_show_image:
            print("Note: this contains a bug in the packaged version. The bug is in PIL :: ImageShow.py")
            image.show()
        filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=out_folder)
        print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
        image.save(f"{filename}")
        image_counter +=1
        image_filenames += [filename]

    return image_filenames

def main():
    #also_show_image = True

    if len(sys.argv) < 2 or "--help" in sys.argv:
        print_help()

    image_prompt = ' '.join(sys.argv[1:])

    images =  generate_images(image_prompt)
    print(f"images generated: {images}" )


if __name__ == "__main__":
    main()


#Creating 4 images with this prompt (please be patient): -c import os, sys, time; time.sleep(20); os.remove(sys.argv[1]) /var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/tmprbghbooe.PNG
