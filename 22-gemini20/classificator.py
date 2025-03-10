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

VERSION = '1.5'
APP_NAME = 'QuickClassifier'
GEMINI_MODEL = "gemini-2.0-flash-001"  # needs to be fast
APP_CHANGELOG = '''
20250310 v1.5 Fixed -- parsing. Now it's a remaining_prompt. Also added code to prompt.
20250310 v1.4 Fixed -- parsing.
20250310 v1.3 Added support for prompt after -- without quotes.
20250310 v1.2 Added support for prompt after --
20250310 v1.1 Removed constants.py and added version print. Removed GRPC error.
20250310 v1.0 Initial classificator from Gemini and Ricc.
'''
print(f"🚀 {Fore.BLUE}{APP_NAME}{Style.RESET_ALL} v{VERSION} 🚀")

# Default classification prompt (as provided in the original file)
DefaultClassificationPrompt = """You're a useful prompt classifier.
You need to understand if the user, through a given prompt, is asking to create an image, video, parse a url or simply to explain/summarize
based on normal text.

Based on the following input, please find the most pertinent class for the prompt which is given :

- "image_prompt". Choose this if you seem to be asked something to create an image (something which has no movement or can be in a picture).
- "video_prompt". Choose this if you seem to be asked something to create a video (there is a concept of time, variation, ..).
- "url". Choose this if the content contains an URL.
- "chat". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "code". The content seems to ask you to write code.
- "summary". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "unknown". If nothing really fits.

--- GIVEN PROMPT BEGIN ---
{{content}}
--- GIVEN PROMPT END ---

Make sure to return just one of these: ['image_prompt', 'video_prompt', 'chat', 'url', 'code', 'summary', 'unknown' ]:
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
        valid_classes = ['image_prompt', 'video_prompt', 'chat', 'url', 'summary', 'code', 'unknown']

        # Check if the response is a valid class
        if classification_text in valid_classes:
            classification = classification_text
        else:
            print(
                f"{Fore.YELLOW}Warning: Invalid classification '{classification_text}' received. Defaulting to 'unknown'.{Style.RESET_ALL}")
            classification = "unknown"

        return {
            "classification": classification,
            "cleanedup_prompt": content,  # In this case, we return the original content as the cleaned-up prompt
        }

    except Exception as e:
        print(f"{Fore.RED}Error during classification: {e}{Style.RESET_ALL}")
        return None
    finally:
        del model  # this should help to close the connection.


def get_content_from_source(content_file, remaining_prompt):
    """
    Gets the content from either a file, stdin, or command-line arguments after --.

    Args:
        content_file: Path to the content file or "-" for stdin.
        remaining_prompt: Prompt provided through command line arguments (string).

    Returns:
        The content as a string.
    """
    if remaining_prompt:
        content = remaining_prompt
        print(f"Reading prompt from command line: '{content}'")
    elif content_file:
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
    else:
        content = None

    return content


def main():
    """Main function to handle command-line arguments and perform classification."""
    parser = argparse.ArgumentParser(
        description="Classify content using Gemini 2.0 LLM.",
        formatter_class=argparse.RawTextHelpFormatter,
        add_help=False,
    )
    parser.add_argument(
        "-c",
        "--classification-prompt",
        help="Path to a file containing the classification prompt. If not provided, the default prompt is used.",
        default=None,
    )
    parser.add_argument(
        "content_source",
        nargs="?",
        help="""Path to a file containing the content to classify.
        Use '-' to read from stdin. If not provided, will try to read from --""",
        default=None,
    )
    parser.add_argument(
        "-h", "--help", action="help", help="Show this help message and exit"
    )

    # Parse only the arguments we care about (before --)
    known_args, unknown_args = parser.parse_known_args()

    # Load classification prompt if provided
    classification_prompt = DefaultClassificationPrompt
    if known_args.classification_prompt:
        try:
            with open(known_args.classification_prompt, "r") as f:
                classification_prompt = f.read()
        except FileNotFoundError:
            print(f"{Fore.RED}Error: Classification prompt file '{known_args.classification_prompt}' not found.{Style.RESET_ALL}")
            return
        except Exception as e:
            print(
                f"{Fore.RED}Error reading classification prompt file '{known_args.classification_prompt}': {e}{Style.RESET_ALL}")
            return

    # Check if -- is present in sys.argv
    remaining_prompt = None
    if "--" in sys.argv:
        # Find the index of --
        double_dash_index = sys.argv.index("--")
        # Everything after -- is the prompt
        remaining_prompt = " ".join(sys.argv[double_dash_index + 1:])

    # Get content from source
    content = get_content_from_source(known_args.content_source, remaining_prompt)

    if content is None:
        print(f"{Fore.RED}Error: No content provided.{Style.RESET_ALL}")
        parser.print_help()
        return

    print(f"Content: {Fore.GREEN}{content}{Style.RESET_ALL}")

    # Classify the content
    result = classify_prompt(content, classification_prompt)

    if result:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
