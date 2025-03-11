'''
Example:

$ python veo.py -o projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/c1ba0947-077c-4e17-a897-8308f639e178

'''
#import requests
#import json
#import subprocess
#import base64
import os
#import re
import argparse
from typing import List
import pprint
import colorama
from colorama import Style, Fore
from lib.filez import * # write_to_file
from lib.videoz import veo_generate_and_poll
import sys

APP_VERSION = '1.10'
APP_NAME = 'Veo cURL-based video-generator'
APP_DESCRIPTION = 'Veo video generator from cURL since I still have to figure out how to do it with genai official libs'
APP_CHANGELOG = '''
20250310 v1.10 Trying to support an image in input! And it works, WOW!
20250310 v1.9 Now videos support an output folder. Default to out/videos/
20250310 v1.8 Supports calling with just operation_id now.  ## big bug was introduced here - check for regressions!
20250310 v1.7 Obsoleting old veo1234 and moving stuff to a lib where i can call it with simple "generate_video(prompt)"
20250310 v1.6 Better error handling from Veo APIs.
20250309 v1.5 Added write_to_file for broken stuff.
20250309 v1.4 Waiting4Paolo. Accepting prompt from STDIN and from file
20250309 v1.3 Waiting4Paolo. Some nice addons and fixing install for Mac.
20250308 v1.2 happy women's day, added support for GCS and it WORKS!
20250308 v1.2b Just nice skleep icon
20250307 v1.1 copied from above folder and moved to 1.1.
20250307 v1.0  Was just in above folder under experiments/
'''
# Configuration (you might want to move these to a config file)
#PROJECT_ID = "veo-testing"

#SAVE_TO_GCS = True
#VEO_GS_BUCKET_FROM_ENV = os.getenv('VEO_GS_BUCKET')

#APP_VERSION = '0.2'
#APP_NAME = 'Veo Video Generator - uses Veo to create 5sec videos based on some prompt. Also the filename is based on prompt like MJ (TODO)'

#print(f"🎥 Veo Generator v{APP_VERSION}: {Style.BRIGHT}{Fore.WHITE}At piasria!{Style.RESET_ALL} 📹")
print(f"🎥 {Fore.BLUE}{APP_NAME}{Style.RESET_ALL} v{APP_VERSION} 📹")



def get_prompt_from_source(prompt_file, argv_prompt):
    """
    Gets the prompt from either a file or command-line arguments.

    Args:
        prompt_file: Path to the prompt file or "-" for stdin.
        argv_prompt: Prompt provided through command line arguments (list of strings).

    Returns:
        The prompt as a string.
    """
    if prompt_file:
        if prompt_file == "-":
            print("Reading prompt from stdin...")
            prompt = sys.stdin.read().strip()
        else:
            try:
                with open(prompt_file, "r") as f:
                    prompt = f.read().strip()
            except FileNotFoundError:
                print(f"Error: Prompt file '{prompt_file}' not found.")
                return None
            except Exception as e:
                print(f"Error reading prompt file '{prompt_file}': {e}")
                return None
    elif argv_prompt:
        prompt = " ".join(argv_prompt)
    else:
        prompt = None

    return prompt



def main():
    """Main function to orchestrate the video generation, retrieval, and decoding."""
    parser = argparse.ArgumentParser(
        description=f"{APP_NAME} - {APP_DESCRIPTION}",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "-v",
        "--version",
        action="version",
        version=f"%(prog)s {APP_VERSION}",
    )
    parser.add_argument(
        "--promptfile",
        help="""Path to a file containing the video generation prompt.
        Use '-' to read from stdin. If provided, command line prompt is ignored.""",
        default=None
    )
    parser.add_argument(
        "prompt",
        nargs="*",
        help="""Prompt for video generation.
        Examples:
        - "Shrek wakes up in Milan, the view from Shrek to the Castello Sforzesco out of the window"
        - "A cat playing the piano in a jazz club, cinematic lighting"
        - "A futuristic city at night, neon lights, flying cars"
        - "A beautiful landscape with mountains and a lake, time-lapse"
        - "A robot dancing in a disco, 80s style"
        - "A dragon flying over a medieval castle, epic music"
        - "A group of people laughing and having fun at a party"
        - "A dog surfing on a wave, slow motion"
        - "A person walking in a forest, autumn colors"
        - "A spaceship landing on Mars, science fiction"
        - "A cinematic shot captures a fluffy Cockapoo, perched atop a vibrant pink flamingo float, in a sun-drenched Los Angeles swimming pool. The crystal-clear water sparkles under the bright California sun, reflecting the playful scene. The Cockapoo's fur, a soft blend of white and apricot, is highlighted by the golden sunlight, its floppy ears gently swaying in the breeze. Its happy expression and wagging tail convey pure joy and summer bliss. The vibrant pink flamingo adds a whimsical touch, creating a picture-perfect image of carefree fun in the LA sunshine
        - "A cinematic shot captures a fluffy Cockapoo, perched atop a vibrant pink flamingo float, in a sun-drenched Zurich See beach. The crystal-clear water sparkles under the bright Swiss sun, reflecting the playful scene. The Cockapoo's fur, a soft blend of white and apricot, is highlighted by the golden sunlight, its floppy ears gently swaying in the breeze. Its happy expression and wagging tail convey pure joy and summer bliss. The vibrant pink flamingo adds a whimsical touch, creating a picture-perfect image of carefree fun in the swiss sunshine"
        - 'Dramatic rotating view of a Panettone on a table. On top, a writing appears: "Panettone is on the table"'
        """,
    )

    parser.add_argument(
        "-o",
        "--operation",
        help="""Operation ID to poll instead of generating a new video.
        """,
        default=None
    )
    parser.add_argument(
        "-i",
        "--image",
        help="""File of an image (.png or .jpg).
        """,
        default=None
    )


    args = parser.parse_args()

    prompt = get_prompt_from_source(args.promptfile, args.prompt)
    if prompt is None:
        if not args.promptfile:
            parser.print_help()
        return
    print(f"Generating video with prompt: '{prompt}'")
    print(f"Generating video with image: '{args.image}'")
    print(f"Generating video with operation: '{args.operation}'")

    video_files_info = veo_generate_and_poll(prompt, veo_gs_bucket=os.getenv('VEO_GS_BUCKET'), operation_id=args.operation, image_file=args.image)
    print(f"👍 Some files were generated:")
    pprint.pp(video_files_info)

if __name__ == "__main__":
    main()

