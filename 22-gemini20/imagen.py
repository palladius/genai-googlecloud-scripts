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
# Assuming constants.py and lib.filez are in the same directory or accessible via PYTHONPATH
try:
    from constants import * # Assuming GEMINI_API_KEY might be here if not in .env
except ImportError:
    print(f"{Fore.YELLOW}Warning:{Style.RESET_ALL} constants.py not found or could not be imported.")
    # Define fallbacks if necessary, though GEMINI_API_KEY is handled below

try:
    from lib.filez import midjourneyish_filename_from_prompt # create_filename_from_prompt is defined below
except ImportError:
    print(f"{Fore.RED}Error:{Style.RESET_ALL} lib/filez.py not found or 'midjourneyish_filename_from_prompt' is missing.")


load_dotenv()

# --- Mock implementation for missing parts (for testing) ---
# If you don't have these files yet, uncomment and adapt these:
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE") # Load from .env or replace
if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
     print(f"{Fore.RED}Error:{Style.RESET_ALL} GEMINI_API_KEY not found. Please set it in a .env file or constants.py")
     sys.exit(1)

APP_VERSION = '1.5' # Incremented version!
APP_NAME = 'Image Generation Tool 🚀'
APP_HISTORY = '''
2025-04-18 v1.5 Added --aspect-ratio/-a and --max-images/-m arguments. (R. Gemini)
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
    # Placeholder implementation - replace with your actual logic if needed
    safe_prompt = re.sub(r'\W+', '_', prompt)[:64]
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    return f"{date_str}_{safe_prompt}.{extension}"


def generate_images(image_prompt: str,
                    out_folder: str = 'out/',
                    also_show_image: bool = True,
                    number_of_images: int = 4, # <-- New parameter
                    aspect_ratio: str = "1:1"   # <-- New parameter
                   ):
    '''Generates images.

    TODO(ricc): move to lib/imagez.py
    '''
    image_filenames = []
    print(f"🧞‍♂️ Creating {number_of_images} image(s) with aspect ratio {aspect_ratio}...")
    print(f"   Prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")


    # Check for API Key early (already done in main, but good practice here too)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"{Fore.RED}Fatal Error:{Style.RESET_ALL} GEMINI_API_KEY environment variable not set!")
        sys.exit(1)

    try:
        client = genai.Client(api_key=api_key)

        # Use the new parameters here
        my_image_config = types.GenerateImagesConfig(
            number_of_images=number_of_images,
            aspect_ratio=aspect_ratio,
            #safety_filter_level="block_some", # Consider making this configurable too
            person_generation="allow_adult", # Consider making this configurable too
        )

        response = client.models.generate_images(
            model='imagen-3.0-generate-002', # Or your preferred model
            prompt=image_prompt,
            config=my_image_config,
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
                image_filenames.append(filename)

            except Exception as img_err:
                 print(f"{Fore.RED}Error processing generated image {image_counter-1}:{Style.RESET_ALL} {img_err}")

    except Exception as e:
        print(f"An unexpected error occurred during image generation: {Fore.RED}{e}{Style.RESET_ALL}")
        import traceback
        traceback.print_exc()
        return []

    return image_filenames


def main() -> None:
    script_name = os.path.basename(sys.argv[0])
    if not script_name.endswith(".py"):
        script_name = f"{script_name} (or python -m your_module)"
    else:
         script_name = f"python {script_name}"

    # --- Define valid choices ---
    valid_aspect_ratios = ["1:1", "4:3", "3:4", "16:9", "9:16"]
    valid_image_counts = range(1, 5) # 1, 2, 3, 4

    parser = argparse.ArgumentParser(
        prog='imagen.py',
        description=f"{Fore.CYAN}{APP_NAME} v{APP_VERSION}{Style.RESET_ALL}\nGenerate images using Google's Generative AI.",
        epilog=f"""{Fore.YELLOW}Examples:{Style.RESET_ALL}
  {script_name} Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.
  {script_name} A CD cover with elements of Pink Floyd and Genesis
  {script_name} A futuristic cityscape at sunset with 4-colored traffic lights, in the style of Dali.
  {script_name} The swiss village of Duloc, with a lake, surrounded by alps, in the style of Shrek and Dreamworks.
  {script_name} 'Sicilian Volcano Etna erupts: From its lava emerges a beautiful fiery phoenix, in the style of Pixar'
  {script_name} 'A funny robotic puffin, surrounded by playful students, is coding a kids game on a computer. The computer screen shows a funny game. The image has a cartoon Shrek style. The robot has a tshirt with written "Gemini 2.5"'
  {script_name} "A futuristic cityscape at sunset" -a 16:9 -m 2
  {script_name} -p etc/image-prompts/alessandro-figurine.prompt -a 3:4
  {script_name} --promptfile etc/image-prompts/puffin_robot.prompt --aspect-ratio 1:1 --max-images 1

{Fore.LIGHTBLUE_EX}App History Snippet:{Style.RESET_ALL}
{APP_HISTORY}
""",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    # --- Argument Definition ---
    prompt_group = parser.add_mutually_exclusive_group(required=True)
    prompt_group.add_argument(
        '-p', '--promptfile',
        metavar='FILE',
        type=str,
        help='File containing the image prompt.'
    )
    prompt_group.add_argument(
        'prompt_text',
        metavar='PROMPT_TEXT',
        type=str,
        nargs='*',
        help='The image prompt text (if --promptfile is not used).'
    )

    parser.add_argument(
        '-a', '--aspect-ratio',
        type=str,
        default='1:1',
        choices=valid_aspect_ratios,
        help=f'Aspect ratio for generated images (default: %(default)s). Choices: {", ".join(valid_aspect_ratios)}'
    )
    parser.add_argument(
        '-m', '--max-images',
        type=int,
        default=4,
        choices=valid_image_counts,
        metavar='{1..4}', # Nicer help message for range
        help='Number of images to generate (default: %(default)s).'
    )
    parser.add_argument(
        '--out',
        dest='out_folder',
        metavar='FOLDER',
        type=str,
        default='out/',
        help='Output folder for generated images (default: %(default)s).'
    )
    parser.add_argument(
        '--no-show',
        action='store_false',
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
                lines = [line.strip() for line in f if line.strip()]
                image_prompt = ' '.join(lines)
            if not image_prompt:
                 print(f"{Fore.YELLOW}Warning:{Style.RESET_ALL} Prompt file '{args.promptfile}' was empty.")
                 sys.exit(1)
        except FileNotFoundError:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} Prompt file not found: {args.promptfile}")
            sys.exit(1)
        except Exception as e:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} Could not read prompt file '{args.promptfile}': {e}")
            sys.exit(1)
    elif args.prompt_text:
        image_prompt = ' '.join(args.prompt_text)
        if not image_prompt:
            print(f"{Fore.RED}Error:{Style.RESET_ALL} No prompt text provided.")
            parser.print_help()
            sys.exit(1)

    # --- Call Generation ---
    if image_prompt:
        images = generate_images(
            image_prompt=image_prompt,
            out_folder=args.out_folder,
            also_show_image=args.show_image,
            number_of_images=args.max_images, # Pass the parsed value
            aspect_ratio=args.aspect_ratio    # Pass the parsed value
        )
        if images:
            print(f"\n✅ Successfully generated {len(images)} image(s):")
            for img_file in images:
                print(f"   - {Fore.GREEN}{img_file}{Style.RESET_ALL}")
        else:
            print(f"\n🤷 No images were generated or saved. Check logs above.")

if __name__ == "__main__":
    main()
