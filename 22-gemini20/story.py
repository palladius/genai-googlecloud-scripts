'''
a dream until this morning! https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation/

'''

from pickle import FALSE
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import datetime
import os
import argparse  # Import the argparse module

# Riccardo stuff

from constants import *
from lib.filez import *  # create_filename_from_prompt
from colorama import Fore, Style
from dotenv import load_dotenv
from lib.filez import write_to_file

load_dotenv()

APP_VERSION = '1.3'
APP_NAME = 'Text&Image Story Generation Tool'
APP_HISTORY = '''
20250314 v1.3 Added CLI options --prompt, --help and CLI-prompt
20250313 v1.2 Move to function and add some debugging.
20250313 v1.1 Added creation of story.md
20250313 v1.0 INITIAL FUNCTION - clunky
'''
STORY_MODEL = "gemini-2.0-flash-exp"
# STORY_PROMPT = "Generate a story about a Googler with a funny googler hat in Istanbul in a 3d digital art style who finds a key to Istanbul Topkapi. For each scene, generate an image in a photographic style. Ensure the main character is present in all scenes."
# SHORT_STORY_FILE_ADDON = "da-story"
#STORY_PROMPT = '''Generate a story about a cute little Shrek in a 3d digital art style, walking around Milan and looking for the perfect Panettone. For each scene, generate an image.'''
#SHORT_STORY_FILE_ADDON = "babyshrek-milan"
FOLDER_BASE = "out/stories/"


def generate_story(story_prompt, short_story_file_addon):
    '''Generates a story thanks to Mar12 new API :)'''

    # SHORT_STORY_FILE_ADDON = "babyshrek-milan" # TODO use
    FOLDER_NAME = datetime.date.today().strftime("%Y%m%d") + "-" + datetime.datetime.now().strftime("%H%M") + "-" + short_story_file_addon
    print(f"Folder will be: {Fore.BLUE}{FOLDER_NAME}{Style.RESET_ALL}")

    FINAL_FOLDER = FOLDER_BASE + FOLDER_NAME + '/'
    os.makedirs(FINAL_FOLDER, exist_ok=True)  # Use os.makedirs with exist_ok=True

    print(f"generate_story(): prompt = {Fore.BLUE}{story_prompt}{Style.RESET_ALL}")

    client = genai.Client(api_key=GEMINI_API_KEY)

    response = client.models.generate_content(
        model=STORY_MODEL,
        contents=(story_prompt),
        config=types.GenerateContentConfig(
            response_modalities=["Text", "Image"]
        ),
    )

    write_to_file(file_name=FINAL_FOLDER + 'story-gemini-response.json', content=response)

    story_markdown = f"# {APP_NAME} - {FOLDER_NAME}\n\n"
    story_markdown += f"**Prompt:** {story_prompt}\n\n"

    image_prompt = story_prompt
    chapter_counter = 1
    image_counter = 1

    # if content is None:
    #     print("Somehow the story went south. Sorry.")
    #     return FALSE

    for i, candidate in enumerate(response.candidates):
        print(f"DEB candidate ##{i}")
        # Add a new chapter
        story_markdown += f"## Chapter {chapter_counter}\n\n"
        chapter_counter += 1

        if candidate.content is None:
            print("[WARN] candidate #TODO is empty - skipping..")
            # next
            break

        for j, part in enumerate(candidate.content.parts):
            print(f"DEB candidate ##{i} :: Part #{j}")
            if part.text:
                story_markdown += f"{part.text}\n\n"
            if part.inline_data and part.inline_data.mime_type == "image/png":
                image_bytes = part.inline_data.data
                image = Image.open(BytesIO(image_bytes))
                # image.show()
                filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=FINAL_FOLDER,
                                                              extension="png")
                print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
                image.save(f"{filename}")
                image_counter += 1
                # Add the image to the markdown
                relative_filename = os.path.relpath(filename, FINAL_FOLDER)  # To keep the md portable
                story_markdown += f"![Chapter Image](./{relative_filename})\n\n"

    write_to_file(file_name=os.path.join(FINAL_FOLDER, "STORY.md"), content=story_markdown)
    final_readme_location = os.path.join(FINAL_FOLDER, 'STORY.md')
    print(f"✅ Story saved to: {Fore.GREEN}{final_readme_location}{Style.RESET_ALL}")
    return final_readme_location


def main():
    parser = argparse.ArgumentParser(description="Generate a story with images using Gemini.")
    parser.add_argument("-p", "--prompt", help="Path to a file containing the story prompt.")
    parser.add_argument("prompt_cli", nargs="*", help="Story prompt (or part of it) from the command line.")
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {APP_VERSION}")

    args = parser.parse_args()

    if args.prompt:
        with open(args.prompt, "r") as f:
            story_prompt = f.read()
        short_story_file_addon = os.path.basename(args.prompt)[:-7] # remove .prompt
    else:
        if args.prompt_cli:
            story_prompt = " ".join(args.prompt_cli)
        else:
            print("Error: no prompt given! You must use --prompt or the command line.")
            parser.print_help()
            exit(1)
        short_story_file_addon = "cli" # default name

    generate_story(story_prompt, short_story_file_addon)


if __name__ == "__main__":
    main()
