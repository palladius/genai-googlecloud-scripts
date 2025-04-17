import sys
import argparse # <--- Import argparse!
import os
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

# --- Mock implementation for missing parts (for testing) ---
# If you don't have these files yet, uncomment and adapt these:
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE") # Load from .env or replace
if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
     print(f"{Fore.RED}Error:{Style.RESET_ALL} GEMINI_API_KEY not found. Please set it in a .env file or constants.py")
     sys.exit(1)

APP_VERSION = '1.4' # Incremented version!
APP_NAME = 'Image Generation Tool 🚀'
APP_HISTORY = '''
2025-04-17 v1.4 Added -p/--promptfile argument using argparse. Removed manual help. (R. Gemini)
 .. Seems broken !!  TODO: add save_to_gcs() functionality too.
2025-03-07 v1.3 Set up $0 and moved code to lib/ for better code reuse.
...
2025-03-07 v1.0 First working version.
'''


def create_filename_from_prompt(prompt, extension='png'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    '''
    return ...

# def generate_images_OLD(image_prompt, out_folder='out/', also_show_image=True):
#     '''Generates images.

#     TODO(ricc): move to lib/imagez.py
#     '''
#     image_filenames = []
#     print(f"Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

#     client = genai.Client(api_key=GEMINI_API_KEY)


#     response = client.models.generate_images(
#         model='imagen-3.0-generate-002',
#         prompt=image_prompt,
#         config=types.GenerateImagesConfig(
#             number_of_images=4,
#             #aspect_ratio=types.AspectRatio.SQUARE,
#             #image_bytes_base64_encoded=True,
#         )
#     )

#     image_counter = 1
#     # if not os.path.exists(out_folder):
#     #     os.makedirs(out_folder)
#     if not response.generated_images:
#         print("No image was generated. Probably some issue with the prompt.")
#         print(f"response for you to investigate: {Fore.RED}{response}{Style.RESET_ALL}")
#         return []

#     for generated_image in response.generated_images:
#         image = Image.open(BytesIO(generated_image.image.image_bytes))
#         if also_show_image:
#             print("Note: this contains a bug in the packaged version. The bug is in PIL :: ImageShow.py")
#             image.show()
#         filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=out_folder)
#         print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
#         image.save(f"{filename}")
#         image_counter +=1
#         image_filenames += [filename]

#     return image_filenames


def generate_images(image_prompt: str, out_folder: str = 'out/', also_show_image: bool = True):
    '''Generates images.

    TODO(ricc): move to lib/imagez.py
    '''
    image_filenames = []
    print(f"🧞‍♂️ Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

    # Check for API Key early
    api_key = os.getenv("GEMINI_API_KEY") # Use getenv for safety
    if not api_key:
        print(f"{Fore.RED}Fatal Error:{Style.RESET_ALL} GEMINI_API_KEY environment variable not set!")
        print("Please create a .env file with GEMINI_API_KEY=YOUR_ACTUAL_KEY or set it in your environment.")
        sys.exit(1) # Stop execution if no key

    try:
        client = genai.Client(api_key=api_key)

        my_image_config = types.GenerateImagesConfig(
            number_of_images=4,
            aspect_ratio="3:4",
            #safety_filter_level="block_some",
            person_generation="allow_adult",
        )

        response = client.models.generate_images(
            model='imagen-3.0-generate-002', # Or your preferred model
            prompt=image_prompt,
            config=my_image_config,
            # config=types.GenerateImagesConfig(
            #     number_of_images=4,
            #    # aspect_ratio="3:4", # Also possible 1:1, 4:3, 3:4,16:9,9:16  See https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide
            #     #aspect_ratio=types.AspectRatio.SQUARE,
            #     #image_bytes_base64_encoded=True,
            #     safety_filter_level="block_some",
            #     person_generation="allow_adult",
            #     #person_generation="allow_adult",
            # )
        )

        if not response.generated_images:
            print(f"{Fore.YELLOW}🤔 No image was generated. Check the prompt for potential safety issues or try rephrasing.{Style.RESET_ALL}")
            print(f"API Response details (may contain reasons): {Fore.LIGHTBLACK_EX}{response}{Style.RESET_ALL}")
            return []

        image_counter = 1
        for generated_image in response.generated_images:
            try:
                image = Image.open(BytesIO(generated_image.image.image_bytes))
                if also_show_image:
                    try:
                        print(f"👀 Displaying image {image_counter} (Note: requires a display environment and PIL correctly configured)")
                        image.show()
                    except Exception as show_err:
                        print(f"{Fore.YELLOW}Warning:{Style.RESET_ALL} Could not display image automatically: {show_err}")
                        print(f"{Fore.YELLOW}       (This often happens on servers or if display libs are missing){Style.RESET_ALL}")


                filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=out_folder)
                print(f"💾 Saving image {image_counter} to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
                image.save(f"{filename}")
                image_counter +=1
                image_filenames.append(filename) # Corrected append

            except Exception as img_err:
                 print(f"{Fore.RED}Error processing generated image {image_counter-1}:{Style.RESET_ALL} {img_err}")


    # except types.StopCandidateException as stop_ex:
    #      print(f"{Fore.RED}Error:{Style.RESET_ALL} Prompt likely rejected due to safety policies.")
    #      print(f"Details: {stop_ex}")
    #      return [] # Return empty list on safety stop
    except Exception as e:
        print(f"An unexpected error occurred during image generation: {Fore.RED}{e}{Style.RESET_ALL}")
        # Consider logging the full traceback here for debugging if needed
        import traceback
        traceback.print_exc()
        return [] # Return empty list on other errors

    return image_filenames


def main() -> None:
    # Use os.path.basename(sys.argv[0]) to make examples dynamic
    script_name = os.path.basename(sys.argv[0])
    if not script_name.endswith(".py"):
        script_name = f"{script_name} (or python -m your_module)" # Adjust if running as module
    else:
         script_name = f"python {script_name}"

    parser = argparse.ArgumentParser(
        prog='imagen.py', # Short name for help message
        description=f"{Fore.CYAN}{APP_NAME} v{APP_VERSION}{Style.RESET_ALL}\nGenerate images using Google's Generative AI.",
        epilog=f"""{Fore.YELLOW}Examples:{Style.RESET_ALL}
  {script_name} "A cat riding a unicorn on Mars, watercolor style"
  {script_name} Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.
  {script_name} A CD cover with elements of Pink Floyd and Genesis
  {script_name} A futuristic cityscape at sunset with 4-colored traffic lights, in the style of Dali.
  {script_name} The swiss village of Duloc, with a lake, surrounded by alps, in the style of Shrek and Dreamworks.
  {script_name} 'Sicilian Volcano Etna erupts: From its lava emerges a beautiful fiery phoenix, in the style of Pixar'
  {script_name} 'A funny robotic puffin, surrounded by playful students, is coding a kids game on a computer. The computer screen shows a funny game. The image has a cartoon Shrek style. The robot has a tshirt with written "Gemini 2.5"'

  {script_name} --help
  {script_name} -p my_cool_prompt.txt
  {script_name} --promptfile etc/image-prompts/alessandro-figurine.prompt

{Fore.LIGHTBLUE_EX}App History Snippet:{Style.RESET_ALL}
{APP_HISTORY}
""",
        formatter_class=argparse.RawDescriptionHelpFormatter # Preserves formatting in help
    )

    # --- Argument Definition ---
    # Group for prompt input to make help clearer
    prompt_group = parser.add_mutually_exclusive_group(required=True)
    prompt_group.add_argument(
        '-p', '--promptfile',
        metavar='FILE', # Show FILE instead of PROMPTFILE in help
        type=str,
        help='File containing the image prompt (reads all lines, joins with spaces).'
    )
    prompt_group.add_argument(
        'prompt_text',
        metavar='PROMPT_TEXT',
        type=str,
        nargs='*', # 0 or more arguments, becomes a list
        help='The image prompt text provided directly (if --promptfile is not used).'
    )

    # Optional arguments
    parser.add_argument(
        '--out',
        dest='out_folder', # Store value in 'out_folder' attribute
        metavar='FOLDER',
        type=str,
        default='out/',
        help='Output folder for generated images (default: %(default)s).'
    )
    parser.add_argument(
        '--no-show',
        action='store_false', # Set 'show_image' to False if flag is present
        dest='show_image',
        help="Don't automatically open/show generated images."
    )
    parser.add_argument(
        '--version',
        action='version',
        version=f'%(prog)s {APP_VERSION}'
    )

    # --- Argument Parsing ---
    args = parser.parse_args()

    # --- Determine the Image Prompt ---
    image_prompt = ""
    if args.promptfile:
        try:
            print(f"📜 Reading prompt from file: {Fore.CYAN}{args.promptfile}{Style.RESET_ALL}")
            with open(args.promptfile, 'r', encoding='utf-8') as f:
                # Read lines, strip whitespace from each, filter empty lines, join with space
                lines = [line.strip() for line in f if line.strip()]
                image_prompt = ' '.join(lines)
            if not image_prompt:
                 print(f"{Fore.YELLOW}Warning:{Style.RESET_ALL} Prompt file '{args.promptfile}' was empty or contained only whitespace.")
                 sys.exit(1) # Exit if the file resulted in an empty prompt
        except FileNotFoundError:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} Prompt file not found: {args.promptfile}")
            sys.exit(1)
        except Exception as e:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} Could not read prompt file '{args.promptfile}': {e}")
            sys.exit(1)
    elif args.prompt_text:
        # argparse gives a list of strings for 'prompt_text' (due to nargs='*')
        image_prompt = ' '.join(args.prompt_text)
        if not image_prompt:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} No prompt text provided on the command line.")
            # Argparse should actually catch this because the group is required,
            # but adding a check here is safe.
            parser.print_help()
            sys.exit(1)
    # else: # This case is handled by argparse 'required=True' on the group
    #     print(f"{Fore.RED}Error:{Style.RESET_ALL} You must provide a prompt either via text or --promptfile.")
    #     parser.print_help()
    #     sys.exit(1)

    # --- Call Generation ---
    if image_prompt: # Double check we have a prompt
        # Pass the parsed arguments to the function
        images = generate_images(
            image_prompt=image_prompt,
            out_folder=args.out_folder,
            also_show_image=args.show_image # Use the value from args
        )
        if images: # Only print success if images were returned
            print(f"\n✅ Successfully generated {len(images)} image(s):")
            for img_file in images:
                print(f"   - {Fore.GREEN}{img_file}{Style.RESET_ALL}")
        else:
            print(f"\n🤷 No images were generated or saved. Check logs above.")
    # No else needed, handled above/by argparse

if __name__ == "__main__":
    main()


#Creating 4 images with this prompt (please be patient): -c import os, sys, time; time.sleep(20); os.remove(sys.argv[1]) /var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/tmprbghbooe.PNG
