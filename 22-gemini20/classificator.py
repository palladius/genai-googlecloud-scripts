
'''classificator.py

#
Usage: classificator.py --classification-prompt etc/classification.prompt content.txt
Usage: classificator.py -c etc/classification.prompt -
Usage: classificator.py -c etc/classification.prompt -- This is my prompt


'''

import google.generativeai as genai
import os
import argparse
import sys
import json
from colorama import Fore, Style
from dotenv import load_dotenv
load_dotenv()
from constants import GEMINI_API_KEY

VERSION = '1.0'
APP_NAME = 'QuickClassifier'
GEMINI_MODEL = "gemini-2.0-flash-001" # needs to be fast
APP_CHANGELOG = '''
20250310 v1.0 Initial classificator from Gemini and Ricc.
'''
'''classificator.py

#
Usage: classificator.py --classification-prompt etc/classification.prompt content.txt
Usage: classificator.py -c etc/classification.prompt -

'''

# Default classification prompt (as provided in the original file)
DefaultClassificationPrompt = """You're a useful prompt classifier.
You need to understand if the user, through a given prompt, is asking to create an image, video, parse a url or simply to explain/summarize
based on normal text.

Based on the following input, please find the most pertinent class for the prompt which is given :

- "image_prompt". Choose this if you seem to be asked something to create an image (something which has no movement or can be in a picture).
- "video_prompt". Choose this if you seem to be asked something to create a video (there is a concept of time, variation, ..).
- "url". Choose this if the content contains an URL.
- "chat". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "summary". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "unknown". If nothing really fits.

--- GIVEN PROMPT BEGIN ---
{{content}}
--- GIVEN PROMPT END ---

Make sure to return just one of these: ['image_prompt', 'video_prompt', 'chat', 'url', 'summary', 'unknown' ]:
"""

def classify_prompt(content, classification_prompt=DefaultClassificationPrompt):
    """
    Classifies the given content using the Gemini 2.0 LLM.

    Args:
        content: The input text to classify.
        classification_prompt: The prompt to use for classification.

    Returns:
        A dictionary containing the classification result and the cleaned-up prompt.
        Returns None if there is an error.
    """
    model = None
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)

        # Replace {{content}} placeholder in the prompt
        final_prompt = classification_prompt.replace("{{content}}", content)

        response = model.generate_content(final_prompt)
        response.resolve()

        # Extract the classification from the response
        classification_text = response.text.strip()

        # Define the valid classes
        valid_classes = ['image_prompt', 'video_prompt', 'chat', 'url', 'summary', 'unknown']

        # Check if the response is a valid class
        if classification_text in valid_classes:
            classification = classification_text
        else:
            print(f"{Fore.YELLOW}Warning: Invalid classification '{classification_text}' received. Defaulting to 'unknown'.{Style.RESET_ALL}")
            classification = "unknown"

        return {
            "classification": classification,
            "cleanedup_prompt": content,  # In this case, we return the original content as the cleaned-up prompt
        }

    except Exception as e:
        print(f"{Fore.RED}Error during classification: {e}{Style.RESET_ALL}")
        return None
    finally:
        del model # this should help to close the connection.


def get_content_from_source(content_file):
    """
    Gets the content from either a file or stdin.

    Args:
        content_file: Path to the content file or "-" for stdin.

    Returns:
        The content as a string.
    """
    if content_file == "-":
        print("Reading content from stdin...")
        content = sys.stdin.read().strip()
    else:
        try:
            with open(content_file, "r") as f:
                content = f.read().strip()
        except FileNotFoundError:
            print(f"{Fore.RED}Error: Content file '{content_file}' not found.{Style.RESET_ALL}")
            return None
        except Exception as e:
            print(f"{Fore.RED}Error reading content file '{content_file}': {e}{Style.RESET_ALL}")
            return None
    return content


def main():
    """Main function to handle command-line arguments and perform classification."""
    parser = argparse.ArgumentParser(
        description="Classify content using Gemini 2.0 LLM.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "-c",
        "--classification-prompt",
        help="Path to a file containing the classification prompt. If not provided, the default prompt is used.",
        default=None,
    )
    parser.add_argument(
        "content_source",
        help="""Path to a file containing the content to classify.
        Use '-' to read from stdin.""",
    )

    args = parser.parse_args()

    # Load classification prompt if provided
    classification_prompt = DefaultClassificationPrompt
    if args.classification_prompt:
        try:
            with open(args.classification_prompt, "r") as f:
                classification_prompt = f.read()
        except FileNotFoundError:
            print(f"{Fore.RED}Error: Classification prompt file '{args.classification_prompt}' not found.{Style.RESET_ALL}")
            return
        except Exception as e:
            print(f"{Fore.RED}Error reading classification prompt file '{args.classification_prompt}': {e}{Style.RESET_ALL}")
            return

    # Get content from source
    content = get_content_from_source(args.content_source)
    if content is None:
        return

    # Classify the content
    result = classify_prompt(content, classification_prompt)

    if result:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
