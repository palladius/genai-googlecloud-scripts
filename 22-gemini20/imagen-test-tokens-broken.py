
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
from lib.geminiz import * # cost_of_api_call, print_cost

load_dotenv()

APP_VERSION = '1.3b'
APP_NAME = 'Image Generation Tool'
APP_HISTORY = '''
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
    """)
    sys.exit(0)

def create_filename_from_prompt(prompt, extension='png'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    '''
    return ...

def main():
    also_show_image = True

    if len(sys.argv) < 2 or "--help" in sys.argv:
        print_help()

    image_prompt = ' '.join(sys.argv[1:])

    client = genai.Client(api_key=GEMINI_API_KEY)

    print(f" Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

    # <class 'google.genai.types.GenerateImagesResponse'>
    response = client.models.generate_images(
        model='imagen-3.0-generate-002',
        prompt=image_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=4,
        )
    )
    #     response = client.models.count_tokens(
    #       model='gemini-2.0-flash',
    #       contents='What is your name?',
    #   )

# google.genai.errors.ClientError: 404 NOT_FOUND. {'error': {'code': 404, 'message': 'models/imagen-3.0-generate-002 is not found for API version v1beta, or is not supported for countTokens. Call ListModels to see the list of available models and their supported methods.', 'status': 'NOT_FOUND'}}
    # count_tokens = client.models.count_tokens(
    #       model='imagen-3.0-generate-002',
    #       contents='What is your name?',
    #   )

    # response.__dict__.keys()
    # dict_keys(['generated_images'])
    #response.generated_images[0].__class__
    # <class 'google.genai.types.GeneratedImage'>


    #   generated_images: Optional[list[GeneratedImage]] = Field(
    #       default=None,
    #       description="""List of generated images.
    #       """,
    #   )


    # Code: https://github.com/googleapis/python-genai/blob/f523a7c45abc8373c01cfcb737fd446d8567fc46/google/genai/types.py#L3748
    #>>> response.generated_images[0].__dict__.keys()
    #dict_keys(['image', 'rai_filtered_reason', 'enhanced_prompt'])

    image_counter = 1
    for generated_image in response.generated_images:
        image = Image.open(BytesIO(generated_image.image.image_bytes))
        if also_show_image:
            image.show()
        filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter)
        print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
        image.save(f"{filename}")
        image_counter +=1
    cost1 = cost_of_api_call('Impossibile capire il costo da una ImageResponse', printCost=True)
    cost2 = cost_of_api_call(client, printCost=True)
    #print_cost(cost)

if __name__ == "__main__":
    main()
