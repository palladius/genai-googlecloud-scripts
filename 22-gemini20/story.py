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
import sys
import argparse  # Import the argparse module

# Riccardo stuff

from constants import *
from lib.filez import *  # create_filename_from_prompt
from colorama import Fore, Style
from dotenv import load_dotenv
from lib.filez import write_to_file

load_dotenv()

APP_VERSION = '1.6a'
APP_NAME = 'Text&Image Story Generation Tool'
APP_HISTORY = '''
20250316 v1.6 Better understanding of when and why it stops, and better documentation of FinishReason.
              This yields non-empty files and directories, which is good.
20250315 v1.5 Moving story.md to readme.md => easier on github ;)
20250314 v1.4 CLi is now complete and works great!
20250314 v1.3 Added CLI options --prompt, --help and CLI-prompt
20250313 v1.2 Move to function and add some debugging.
20250313 v1.1 Added creation of README.md
20250313 v1.0 INITIAL FUNCTION - clunky
'''
STORY_MODEL = "gemini-2.0-flash-exp"
# DEFAULT_STORY_PROMPT =  \
#     "Generate a story about a cute baby turtle in a 3d digital art style. " + \
#     "For each scene, generate an image."

# DEFAULT_STORY_PROMPT2 =  \
#     "Generate a story about a Googler with a funny googler hat in Istanbul in a 3d digital art style who finds a key to Istanbul Topkapi. " + \
#     "For each scene, generate an image in a photographic style. Ensure the main character is present in all scenes."


DEFAULT_STORIES = [
        "Generate a story about a cute baby turtle in a 3d digital art style. For each scene, generate an image.",
        "Generate a story about a Googler with a funny googler hat in Istanbul in a 3d digital art style who finds a key to Istanbul Topkapi. For each scene, generate an image in a photographic style. Ensure the main character is present in all scenes.",
    """Generate an illustrated story about a cute little Shrek in a 3d digital art style, walking around Duloc with donkey and looking for the perfect present for Fiona. Finally he finds a great present: a panettone. For each scene, generate an image. """
]

FOLDER_BASE = "out/stories/"

def deb(str, debug: bool):
    if debug:
        # LIGHTBLACK_EX = GRAY https://stackoverflow.com/questions/61686780/python-colorama-print-all-colors
        print(f"#DEB# {Fore.LIGHTBLACK_EX}{str}{Style.RESET_ALL}")
        return True
    else:
        return False

def generate_story(story_prompt, short_story_file_addon, image_show=True, debug=True): # , debug=True
    '''Generates a story thanks to Mar12 new API :)'''

    FOLDER_NAME = datetime.date.today().strftime("%Y%m%d") + "-" + datetime.datetime.now().strftime("%H%M") + "-" + short_story_file_addon
    print(f"📂 Folder will be: {Fore.BLUE}{FOLDER_NAME}{Style.RESET_ALL}")

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

    # TOPDO: detect in response something like this
    # /Users/ricc/git/genai-googlecloud-scripts/22-gemini20/.venv/lib/python3.13/site-packages/google/genai/_common.py:232: UserWarning: IMAGE_SAFETY is not a valid FinishReason
    # How? Look at this:
    # candidates=[Candidate(content=None, citation_metadata=None, finish_message=None, token_count=None, avg_logprobs=None, finish_reason=<FinishReason.IMAGE_SAFETY: 'IMAGE_SAFETY'>, grounding_metadata=None, index=0, logprobs_result=None, safety_ratings=None)] model_version='gemini-2.0-flash-exp' prompt_feedback=None usage_metadata=GenerateContentResponseUsageMetadata(cached_content_token_count=None, candidates_token_count=None, prompt_token_count=57, total_token_count=57) automatic_function_calling_history=[] parsed=None

#    write_to_file(file_name=FINAL_FOLDER + 'story-gemini-response.json', content=response)
    # I want just one local, so it doesnt conflict
    write_to_file(file_name='story-gemini-response.json', content=response)

    story_markdown = f"This story was written by {APP_NAME} v{APP_VERSION}\n* FOLDER_NAME: {FOLDER_NAME}\n\n"
    story_markdown += f"* **Prompt**: {story_prompt}\n\n"

    image_prompt = story_prompt
    chapter_counter = 1
    image_counter = 1

        #print(f"🐞 count(response.candidates): { count(response.candidates) }")

    # if content is None:
    #     print("Somehow the story went south. Sorry.")
    #     return FALSE

    if response.candidates is None:
        print("No candidates found in response")
        return False

    candidates_count = len(response.candidates)

    n_texts = 0
    n_images = 0
    aoe = ['1','2','3','4','5','6','7','8','9','10'] # Array of Emojis, in perl lang :)
    # Computing pre-statistics.
    deb(f"🐞 Found {candidates_count} candidates in response", debug=debug)
    for i, candidate in enumerate(response.candidates):
        aoe[i] = '🐞'+str(i)+'🐞'

        deb(f"🐞🐞 DEB candidate[{i}] class: {candidate.__class__.__name__}", debug=debug)
        if candidate.content is None:
            deb(f"🐞candidate {i} has NO Content", debug=debug)
            aoe[i] += 'ε'
        else:
            for j, part in enumerate(candidate.content.parts):
                aoe[i] += str(j)
                if part.text:
                    deb(f"🐞{i}🐞{j} has TEXT", debug=debug)
                    n_texts += 1
                    aoe[i] += '💬'

                if part.inline_data:
                    deb(f"🐞{i}🐞{j} has inline_data of type: {part.inline_data.mime_type}", debug=debug)
                    n_images += 1
                    aoe[i] += '🖼️'

    print(f"🟨 Generated: {n_texts} 📙 texts and {n_images} 🏞️ images in {candidates_count} candidates.")
    print(f"🟨 Array of Emojis (to study pattern of text and image interlacing): {aoe}.")


    if candidates_count < 1:
        print("🔴 Sorry: few candidates ({candidates_count}) means something went wrong. Check the local JSON to inspect why.")
        return False

    for i, candidate in enumerate(response.candidates):
        # Add a new chapter
        story_markdown += f"## Chapter {chapter_counter}\n\n"
        chapter_counter += 1

        fm = candidate.finish_message
        #fr = "Probably Unfinished in this candidate.. by Ricc"
        #if fm:
        fr = candidate.finish_reason

        deb(f"candidate ##{i} finish_message: {fm} finish_reason: {fr}", debug=debug)

#         if fr == "IMAGE_SAFETY":  # Compare with string instead of enum
#             print(f"⚠️ Image safety issue detected in candidate #{i}")
# #            continue
#             return False
        if fr in [  types.FinishReason.PROHIBITED_CONTENT, types.FinishReason.BLOCKLIST, types.FinishReason.SAFETY, "IMAGE_SAFETY" ]:
            print(f"⚠️⚠️⚠️ Papa Google doesn't want you to see this, aborting. Reason: {fr}", file=sys.stderr)
            return False



        if candidate.content is None:
            print("[WARN] candidate #TODO is empty - skipping..")
            break

        for j, part in enumerate(candidate.content.parts):
            deb(f"DEB candidate #{i} :: Part #{j}", debug=debug)
            if part.text:
                story_markdown += f"{part.text}\n\n"
            if part.inline_data and part.inline_data.mime_type == "image/png":
                image_bytes = part.inline_data.data
                image = Image.open(BytesIO(image_bytes))
                if image_show:
                    image.show()
                filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=FINAL_FOLDER, extension="png")
                print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
                image.save(f"{filename}")
                image_counter += 1
                # Add the image to the markdown
                relative_filename = os.path.relpath(filename, FINAL_FOLDER)  # To keep the md portable
                story_markdown += f"![Chapter Image](./{relative_filename})\n\n"

    write_to_file(file_name=os.path.join(FINAL_FOLDER, "README.md"), content=story_markdown)
    final_readme_location = os.path.join(FINAL_FOLDER, 'README.md')
    print(f"✅ Story saved to: {Fore.GREEN}{final_readme_location}{Style.RESET_ALL}")
    return final_readme_location


def main():
    parser = argparse.ArgumentParser(description="Generate a story with images using Gemini.",
                            formatter_class=argparse.RawDescriptionHelpFormatter,
                            epilog=f"""
Possible invocations:
    🔷 {os.path.basename(sys.argv[0])} "{DEFAULT_STORIES[0]}"
    🔷 {os.path.basename(sys.argv[0])} "{DEFAULT_STORIES[1]}"
    🔷 {os.path.basename(sys.argv[0])} "{DEFAULT_STORIES[2]}"

    🔷 {os.path.basename(sys.argv[0])} --prompt etc/stories/shrek-milan.prompt
    🔷 {os.path.basename(sys.argv[0])} --prompt etc/stories/grinch-pizza.prompt

    Enjoy!
"""
    )

    parser.add_argument("-p", "--prompt", help="Path to a file containing the story prompt.")
    parser.add_argument("prompt_cli", nargs="*", help="Story prompt (or part of it) from the command line.")
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {APP_VERSION}")

    args = parser.parse_args()

    if args.prompt:
        with open(args.prompt, "r") as f:
            # TODO: change parsed story_prompt: \n to ' '
            story_prompt = f.read()
            story_prompt = story_prompt.replace("\n", " ")  # Replace newlines with spaces
        short_story_file_addon = os.path.basename(args.prompt)[:-7] # remove .prompt
    else:
        if args.prompt_cli:
            story_prompt = " ".join(args.prompt_cli)
        else:
            print("Error: no prompt given! You must use --prompt or the command line.", file=sys.stderr)
            parser.print_help()
            exit(1)
        short_story_file_addon = "cli" # default name

    ret = generate_story(story_prompt, short_story_file_addon)
    if ret:
        print("✅ Story probably generated with success. Enjoy!")
    else:
        print("❌ Some error came along. Sorry.")
        sys.exit(-1)

if __name__ == "__main__":
    main()
