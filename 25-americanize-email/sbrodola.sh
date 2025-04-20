#!/bin/bash
# sbrodola.sh - Bootstrapper for the LLM Email Prettifier Project (google-genai version)

# Exit on error, treat unset variables as error, exit on pipe failures
set -euo pipefail

echo "🚀 Creating project structure and files (using google-genai)..."

# Create lib directory
mkdir -p lib
echo "📁 Created directory: lib/"

# --- lib/colors.py ---
# (No changes needed for colors.py)
cat << 'EOF' > lib/colors.py
# -*- coding: utf-8 -*-
"""
Tired of monochrome terminals? Let's paint the town! 🎨
Provides simple functions for adding ANSI color codes to strings.
"""

from typing import Final

# ANSI escape codes
_RESET: Final[str] = "\033[0m"
_BOLD: Final[str] = "\033[1m"
_UNDERLINE: Final[str] = "\033[4m"

_BLACK: Final[str] = "\033[30m"
_RED: Final[str] = "\033[31m"
_GREEN: Final[str] = "\033[32m"
_YELLOW: Final[str] = "\033[33m"
_BLUE: Final[str] = "\033[34m"
_MAGENTA: Final[str] = "\033[35m"
_CYAN: Final[str] = "\033[36m"
_WHITE: Final[str] = "\033[37m"

# Brighter versions (often needed for visibility)
_BRIGHT_BLACK: Final[str] = "\033[90m" # Often looks grey
_BRIGHT_RED: Final[str] = "\033[91m"
_BRIGHT_GREEN: Final[str] = "\033[92m"
_BRIGHT_YELLOW: Final[str] = "\033[93m"
_BRIGHT_BLUE: Final[str] = "\033[94m"
_BRIGHT_MAGENTA: Final[str] = "\033[95m"
_BRIGHT_CYAN: Final[str] = "\033[96m"
_BRIGHT_WHITE: Final[str] = "\033[97m"


def red(text: str) -> str:
    """Makes text red"""
    return f"{_BRIGHT_RED}{text}{_RESET}"

def green(text: str) -> str:
    """Makes text green"""
    return f"{_BRIGHT_GREEN}{text}{_RESET}"

def yellow(text: str) -> str:
    """Makes text yellow"""
    return f"{_BRIGHT_YELLOW}{text}{_RESET}"

def blue(text: str) -> str:
    """Makes text blue"""
    return f"{_BRIGHT_BLUE}{text}{_RESET}"

def magenta(text: str) -> str:
    """Makes text magenta"""
    return f"{_BRIGHT_MAGENTA}{text}{_RESET}"

def cyan(text: str) -> str:
    """Makes text cyan"""
    return f"{_BRIGHT_CYAN}{text}{_RESET}"

def white(text: str) -> str:
    """Makes text white"""
    return f"{_BRIGHT_WHITE}{text}{_RESET}"

def grey(text: str) -> str:
    """Makes text grey (bright black)"""
    return f"{_BRIGHT_BLACK}{text}{_RESET}"

def bold(text: str) -> str:
    """Makes text bold"""
    return f"{_BOLD}{text}{_RESET}"

def underline(text: str) -> str:
    """Makes text underlined"""
    return f"{_UNDERLINE}{text}{_RESET}"

def rainbow(text: str) -> str:
    """Because why not? 🌈"""
    colors = [_BRIGHT_RED, _BRIGHT_YELLOW, _BRIGHT_GREEN, _BRIGHT_CYAN, _BRIGHT_BLUE, _BRIGHT_MAGENTA]
    colored_text = ""
    for i, char in enumerate(text):
        if char.strip(): # Don't color whitespace
            colored_text += f"{colors[i % len(colors)]}{char}"
        else:
            colored_text += char
    return f"{colored_text}{_RESET}"

EOF
echo "🎨 Created file: lib/colors.py"

# --- lib/io_utils.py ---
# (No changes needed for io_utils.py)
cat << 'EOF' > lib/io_utils.py
# -*- coding: utf-8 -*-
"""
Input/Output Utilities - Reading from places and putting things into other places. 📥📤
Handles reading from stdin, files, clipboard and writing to clipboard.
"""

import sys
import os
from typing import Optional

# Attempt to import pyperclip, but don't fail if it's not there yet.
# We'll handle the error gracefully in the functions.
try:
    import pyperclip
    _PYPERCLIP_AVAILABLE = True
except ImportError:
    _PYPERCLIP_AVAILABLE = False

# Import colors locally within functions where needed to avoid potential
# circular dependency issues if other utils needed colors, though unlikely here.
# Or just import at top level if structure is simple like this.
try:
    # Assume running from top level where llm-americanize.py is
    if os.path.exists('lib/colors.py'):
        from lib import colors
    else: # Fallback if running directly from lib maybe? Unlikely use case.
        import colors
except ImportError:
    # Fallback if colors cannot be imported (e.g., during setup/testing)
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x # Return function that returns input unchanged
    colors = MockColors()


def read_input(file_path: Optional[str] = None, use_clipboard: bool = False) -> str:
    """
    Reads input text from the specified source.

    Args:
        file_path: Path to the input file. If None and use_clipboard is False, reads from stdin.
        use_clipboard: If True, attempts to read from the system clipboard.

    Returns:
        The input text as a string.

    Raises:
        FileNotFoundError: If the specified file_path does not exist.
        ImportError: If pyperclip is needed but not installed.
        RuntimeError: If clipboard access fails or stdin is a TTY when expected.
        ValueError: If both file_path and use_clipboard are specified.
    """
    if file_path and use_clipboard:
        raise ValueError("Cannot specify both --input file and --clipboard.")

    if use_clipboard:
        if not _PYPERCLIP_AVAILABLE:
             raise ImportError("The 'pyperclip' library is required for clipboard operations. Please install it (`pip install pyperclip`).")
        try:
            print(colors.cyan("📋 Reading from clipboard..."), file=sys.stderr)
            content = pyperclip.paste()
            if not content:
                print(colors.yellow("📋 Clipboard seems empty."), file=sys.stderr)
            return content
        except Exception as e: # Catching generic Exception as pyperclip errors can vary
             # Pyperclip can raise various errors depending on the OS and setup
             print(colors.red(f"❗ Error reading from clipboard. Ensure your environment supports clipboard operations."), file=sys.stderr)
             print(colors.red(f"   (Details: {e})"), file=sys.stderr)
             raise RuntimeError(f"Failed to read from clipboard") from e
    elif file_path:
        try:
            print(colors.cyan(f"📄 Reading from file: {file_path}..."), file=sys.stderr)
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            # Raise specific error to be caught cleanly later
            raise FileNotFoundError(f"Input file not found: '{file_path}'")
        except IOError as e:
            # Catch other potential file reading errors
            raise RuntimeError(f"Failed to read file '{file_path}': {e}") from e
        except Exception as e:
             # Catch unexpected errors during file read
             raise RuntimeError(f"Unexpected error reading file '{file_path}': {e}") from e
    else:
        # Read from stdin if no other input specified
        # Check if stdin is connected to a terminal (interactive) vs. piped/redirected
        if sys.stdin.isatty() and not sys.stdin.closed:
             # Interactive mode with no input given - print help/error message
             # The main script should handle this by printing help if input_text is None/empty after calling this
             # Or we can raise an error here
             raise RuntimeError("No input method specified and not receiving piped data on stdin. Use --input <file>, --clipboard, or pipe data in.")

        print(colors.cyan("⌨️ Reading from stdin..."), file=sys.stderr)
        try:
            # Read all data from stdin
            content = sys.stdin.read()
            return content
        except Exception as e:
             raise RuntimeError(f"Failed to read from stdin: {e}") from e


def copy_to_clipboard(text: str) -> bool:
    """
    Copies the given text to the system clipboard.

    Args:
        text: The text to copy.

    Returns:
        True if successful, False otherwise.
    """
    if not _PYPERCLIP_AVAILABLE:
        print(colors.yellow("📋 Clipboard output disabled ('pyperclip' not installed)."), file=sys.stderr)
        return False
    try:
        pyperclip.copy(text)
        return True
    except Exception as e: # Catching generic Exception
        print(colors.red(f"❗ Failed to copy to clipboard. Ensure your environment supports clipboard operations."), file=sys.stderr)
        print(colors.red(f"   (Details: {e})"), file=sys.stderr)
        return False

EOF
echo "💾 Created file: lib/io_utils.py"

# --- lib/genai.py (UPDATED) ---
cat << 'EOF' > lib/genai.py
# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain using google-genai! 🧠
Handles communication with the Gemini API via API Key.
"""

import sys
import os
import time
from typing import Optional

# Attempt to import google-genai library
try:
    from google import genai
    from google.genai import types
    from google.genai import safety_settings as safety
    from google.genai import errors as google_genai_errors
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False

# Import dotenv to load environment variables like GOOGLE_API_KEY
try:
    from dotenv import load_dotenv
    _DOTENV_AVAILABLE = True
except ImportError:
    _DOTENV_AVAILABLE = False

try:
    from lib import colors
except ImportError:
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()


# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001" # Or "models/gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95
DEFAULT_TOP_K = 40
# Default safety settings (block medium+ for most categories)
DEFAULT_SAFETY_SETTINGS = {
    safety.HarmCategory.HARM_CATEGORY_HARASSMENT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_HATE_SPEECH: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

class GeminiClient:
    """Wraps the google-genai client for Gemini API calls."""

    def __init__(self, debug: bool = False):
        """
        Initializes the GeminiClient using API Key authentication.

        Args:
            debug: Enable debug printing.

        Raises:
            ImportError: If 'google-genai' or 'python-dotenv' library is not installed.
            RuntimeError: If the GOOGLE_API_KEY environment variable is not set or client init fails.
        """
        if not _GENAI_AVAILABLE:
            raise ImportError("The 'google-genai' library is required. Please install it (`pip install google-genai`).")
        if not _DOTENV_AVAILABLE:
             print(colors.yellow("⚠️ Warning: 'python-dotenv' not installed. Cannot automatically load '.env' file."), file=sys.stderr)
             print(colors.yellow("   Ensure GOOGLE_API_KEY is set in your environment."), file=sys.stderr)
             # Continue, maybe the key is set directly in the environment
        else:
            # Load .env file if it exists, this will not override existing env vars
            env_path = '.env'
            if os.path.exists(env_path):
                 if debug:
                    print(colors.grey(f"🔑 Loading environment variables from '{env_path}'..."), file=sys.stderr)
                 load_dotenv(dotenv_path=env_path, override=False)
            elif debug:
                 print(colors.grey(f"🔑 '.env' file not found, relying on existing environment variables."), file=sys.stderr)

        self.debug = debug
        self._client: Optional[genai.Client] = None

        # Check for API key after attempting to load .env
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print(colors.red("\n❗ Critical Error: GOOGLE_API_KEY environment variable not set."), file=sys.stderr)
            print(colors.yellow("   Please set the GOOGLE_API_KEY environment variable."), file=sys.stderr)
            print(colors.yellow("   You can create one at https://aistudio.google.com/app/apikey"), file=sys.stderr)
            print(colors.yellow("   You can set it directly or place it in a '.env' file in the script's directory:"), file=sys.stderr)
            print(colors.yellow("   Example .env file content:"), file=sys.stderr)
            print(colors.yellow("   GOOGLE_API_KEY=AIzaSy..."), file=sys.stderr)
            raise RuntimeError("Missing GOOGLE_API_KEY environment variable.")

        try:
            if self.debug:
                print(colors.grey("🔧 Initializing google-genai Client..."), file=sys.stderr)
                # Optionally mask part of the key in debug logs if needed
                masked_key = api_key[:5] + "..." + api_key[-4:] if len(api_key) > 9 else api_key
                print(colors.grey(f"   (Using API Key starting with {masked_key})"), file=sys.stderr)

            # Initialize client - it uses GOOGLE_API_KEY from env by default
            self._client = genai.Client()

            # Optional: Make a lightweight call to verify connectivity/key validity?
            # E.g., list models, but that might be too slow for init.
            # Let's rely on the first generate_content call to fail if key is bad.
            if self.debug:
                print(colors.grey("✅ google-genai Client initialized successfully."), file=sys.stderr)

        except Exception as e:
            print(colors.red(f"❗ Failed to initialize google-genai Client: {e}"), file=sys.stderr)
            # Provide specific hints if possible, e.g., check network, API key format?
            raise RuntimeError(f"Failed to initialize google-genai Client") from e

    def process_text(
        self,
        system_prompt: str,
        input_text: str,
        model_name: str = DEFAULT_MODEL_NAME,
        temperature: float = DEFAULT_TEMPERATURE,
        max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
        top_p: float = DEFAULT_TOP_P,
        top_k: int = DEFAULT_TOP_K
    ) -> str:
        """
        Sends the input text and system prompt to the Gemini model for processing.

        Args:
            system_prompt: The system instructions for the model (from the prompt file).
            input_text: The text to be processed (e.g., the email body).
            model_name: The name or path of the Gemini model to use (e.g., 'gemini-1.5-flash-001').
            temperature: Controls randomness (0.0-1.0).
            max_output_tokens: Maximum number of tokens in the response.
            top_p: Nucleus sampling parameter.
            top_k: Top-k sampling parameter.

        Returns:
            The processed text returned by the model.

        Raises:
            RuntimeError: If the API call fails, is blocked, or returns no valid text.
        """
        if self._client is None:
             # This should not happen if __init__ succeeded, but safeguard anyway
             raise RuntimeError("GenAI client is not initialized.")

        # Ensure model name doesn't have the "models/" prefix if user provides it like that
        if not model_name.startswith("models/"):
            model_path = f"models/{model_name}"
        else:
            model_path = model_name # Assume user provided full path

        if self.debug:
            print(colors.grey("\n--- Preparing Call to Gemini API ---"), file=sys.stderr)
            print(colors.grey(f"Model: {model_path}"), file=sys.stderr)
            print(colors.grey(f"System Prompt Snippet:\n'''\n{system_prompt[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Input Text Snippet:\n'''\n{input_text[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Config: Temp={temperature}, MaxTokens={max_output_tokens}, TopP={top_p}, TopK={top_k}"), file=sys.stderr)
            print(colors.grey("------------------------------------"), file=sys.stderr)

        # Prepare the generation configuration
        generation_config = types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
            # candidate_count=1 # Default is 1
        )

        # Prepare the contents - use the input_text directly as the user's message
        contents = [input_text] # Simple string content for user role

        try:
            print(colors.cyan(f"✨ Calling Gemini ({model_path})... Be patient, magic takes time... ✨"), file=sys.stderr)
            start_time = time.time()

            response = self._client.models.generate_content(
                model=model_path,
                contents=contents,
                generation_config=generation_config,
                safety_settings=DEFAULT_SAFETY_SETTINGS,
                system_instruction=system_prompt if system_prompt.strip() else None # Pass system prompt here
            )

            duration = time.time() - start_time
            if self.debug:
                print(colors.grey(f"✅ API Response received in {duration:.2f}s."), file=sys.stderr)
                # print(colors.grey(f"Raw response type: {type(response)}"), file=sys.stderr) # Less useful now

            # --- Process Response ---
            # 1. Check for immediate errors indicated by lack of text and prompt feedback
            try:
                # Accessing response.text should be the primary method
                result_text = response.text
                if self.debug:
                    print(colors.grey(f"✅ Extracted Text Length: {len(result_text)} chars."), file=sys.stderr)
                return result_text

            except ValueError as e:
                # google-genai raises ValueError if response access fails (e.g., blocked)
                print(colors.red(f"❗ Error accessing response text: {e}"), file=sys.stderr)
                # Try to get more info from prompt_feedback or candidates
                finish_reason = "Unknown"
                safety_ratings = "Unknown"
                block_reason = "Unknown"
                try:
                    if response.prompt_feedback:
                        block_reason = response.prompt_feedback.block_reason
                        safety_ratings = response.prompt_feedback.safety_ratings
                        print(colors.yellow(f"   Prompt Feedback Block Reason: {block_reason}"), file=sys.stderr)
                        print(colors.yellow(f"   Safety Ratings: {safety_ratings}"), file=sys.stderr)
                    elif response.candidates and response.candidates[0].finish_reason:
                        finish_reason = response.candidates[0].finish_reason.name
                        safety_ratings = response.candidates[0].safety_ratings
                        print(colors.yellow(f"   Candidate Finish Reason: {finish_reason}"), file=sys.stderr)
                        print(colors.yellow(f"   Safety Ratings: {safety_ratings}"), file=sys.stderr)

                except Exception as inner_e:
                     if self.debug:
                         print(colors.grey(f"   Could not extract detailed feedback: {inner_e}"), file=sys.stderr)

                # Raise a more informative error
                if block_reason != "Unknown" and block_reason != "BLOCK_REASON_UNSPECIFIED":
                     raise RuntimeError(f"Content generation blocked. Reason: {block_reason}. Ratings: {safety_ratings}")
                elif finish_reason != "Unknown" and finish_reason != "FINISH_REASON_UNSPECIFIED" and finish_reason != "STOP":
                     raise RuntimeError(f"Content generation failed or stopped unexpectedly. Reason: {finish_reason}. Ratings: {safety_ratings}")
                else:
                     raise RuntimeError(f"Content generation failed. Could not extract text from response. Original error: {e}")

            except Exception as e:
                 # Catch any other unexpected error during text extraction
                 print(colors.red(f"❗ Unexpected error processing response: {e}"), file=sys.stderr)
                 raise RuntimeError("Unexpected error processing LLM response.") from e


        # --- Handle API Errors ---
        except google_genai_errors.PermissionDenied as e:
             print(colors.red("\n🚫 API Permission Denied!"), file=sys.stderr)
             print(colors.red(f"   Check your GOOGLE_API_KEY. Is it valid and enabled?"), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Permission Denied (Check GOOGLE_API_KEY)") from e
        except google_genai_errors.ResourceExhausted as e:
             print(colors.red("\nquota Exceeded or Rate Limited!"), file=sys.stderr)
             print(colors.red(f"   You might be sending requests too quickly or exceeded your quota (often 60 RPM for free tier)."), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Quota Exceeded / Rate Limited") from e
        except google_genai_errors.InvalidArgument as e:
             print(colors.red(f"\n❗ Invalid Argument Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Check model name ('{model_path}'), parameters (temp, tokens, etc.), or prompt format."), file=sys.stderr)
             raise RuntimeError("API Invalid Argument") from e
        except google_genai_errors.NotFound as e:
             print(colors.red(f"\n❗ Model Not Found Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Ensure the model name '{model_path}' is correct and available for your API key region/tier."), file=sys.stderr)
             raise RuntimeError(f"Model '{model_path}' not found") from e
        except google_genai_errors.InternalServerError as e:
            print(colors.red(f"\n❗ Internal Server Error from API: {e}"), file=sys.stderr)
            print(colors.yellow(f"   This might be a temporary issue with the Google API. Try again later."), file=sys.stderr)
            raise RuntimeError("API Internal Server Error") from e
        except google_genai_errors.APIError as e:
             # Catch other specific API errors
             print(colors.red(f"\n❗ Gemini API Error ({type(e).__name__}): {e}"), file=sys.stderr)
             raise RuntimeError("Gemini API Error") from e
        except Exception as e:
             # Catch unexpected errors during the call itself
             print(colors.red(f"\n❗ An unexpected error occurred during the Gemini API call: {type(e).__name__} - {e}"), file=sys.stderr)
             raise RuntimeError("Unexpected GenAI Error") from e

EOF
echo "🧠 Created file: lib/genai.py (google-genai version)"


# --- americanize.prompt (UPDATED for system_instruction) ---
cat << 'EOF' > americanize.prompt
You are an expert editor specializing in converting text to standard American English, suitable for professional business communication.

Your task is to take the user's input text and revise it according to these guidelines:

1.  **Spelling:** Convert all British/Commonwealth English spellings to American English (e.g., "colour" -> "color", "organise" -> "organize", "centre" -> "center").
2.  **Vocabulary & Idioms:** Replace British/Commonwealth terms and idioms with their common American equivalents (e.g., "holiday" -> "vacation", "lift" -> "elevator", "queue" -> "line", "fortnight" -> "two weeks", "cheers" (as thanks) -> "thanks", "quite good" -> "pretty good" or "very good", "whilst" -> "while"). Look for subtle differences too (e.g., "full stop" -> "period").
3.  **Grammar & Punctuation:** Adjust punctuation and minor grammatical structures where American conventions differ (e.g., placement of punctuation with quotation marks - typically inside, use of serial comma is often preferred in professional settings but match original style if consistent). Ensure subject-verb agreement and clarity.
4.  **Tone:** Maintain a professional, clear, and generally positive business tone. Avoid overly casual or slang terms unless they are standard in American business (which is rare). Do not make the text *less* formal unless the original is overly stiff or informal. The goal is natural-sounding American business English.
5.  **Formatting:** Preserve the general structure (paragraphs, greetings, closings) of the original email. Do not add extra greetings or closings unless the original is missing them. Preserve line breaks between paragraphs.
6.  **Clarity and Conciseness:** Improve clarity and conciseness where possible without losing the original meaning or essential politeness.
7.  **Output:** ONLY output the revised text based on the user's input. Do not include any introductory phrases like "Here is the revised email:", "Revised text:", or any commentary about the changes you made. Just the final, revised text.
EOF
echo "📝 Created file: americanize.prompt (adjusted for system instruction)"


# --- llm-americanize.py (UPDATED) ---
cat << 'EOF' > llm-americanize.py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLM Email Prettifier/Americanizer 🇺🇸✨ (using google-genai)

Reads email text from stdin, a file, or clipboard, sends it to the Gemini API
(using API Key auth) for processing based on a prompt file, and outputs the result
to stdout and the clipboard.
"""

import argparse
import sys
import os
import textwrap # For wrapping help text

# --- Add lib directory to Python path ---
LIB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib')
if LIB_DIR not in sys.path:
    sys.path.insert(0, LIB_DIR)

# --- Import custom libraries (with error handling) ---
try:
    from lib import colors, io_utils, genai
except ImportError as e:
    missing_module = str(e).split("'")[-2]
    print(f"\n[ERROR] Failed to import required library module: '{missing_module}'", file=sys.stderr)
    print(f"        Please ensure the '{LIB_DIR}' directory exists and contains the necessary '.py' files.", file=sys.stderr)
    print(f"        Also check if required packages are installed (see requirements.txt).", file=sys.stderr)
    print("        Did you run the `sbrodola.sh` script successfully and install requirements?", file=sys.stderr)
    print("        Original error:", e, file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"\n[ERROR] An unexpected error occurred during library import:", file=sys.stderr)
    print(f"        Error: {e}", file=sys.stderr)
    print(f"        Please check the integrity of files in '{LIB_DIR}'.", file=sys.stderr)
    sys.exit(1)

# --- Argument Parsing ---
def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments."""

    examples = textwrap.dedent(f"""
    Examples:
      # Read from file (ensure GOOGLE_API_KEY is set in env or .env)
      {colors.yellow('./llm-americanize.py --input my_email.txt')}

      # Read from stdin
      {colors.yellow('cat my_email.txt | ./llm-americanize.py')}

      # Read from clipboard (requires pyperclip)
      {colors.yellow('./llm-americanize.py --clipboard')}

      # Read from clipboard using system tools (macOS)
      {colors.yellow('pbpaste | ./llm-americanize.py')}

      # Read from clipboard using system tools (Linux with xclip)
      {colors.yellow('xclip -o | ./llm-americanize.py')}

      # Use a different prompt file and model
      {colors.yellow('./llm-americanize.py --input draft.txt \\')}
      {colors.yellow('  --prompt-file custom_style.prompt --model gemini-1.5-pro-001')}

      # Enable debug output
      {colors.yellow('./llm-americanize.py --input my_email.txt --debug')}
    """)

    parser = argparse.ArgumentParser(
        description=f"{colors.bold('LLM Email Americanizer (google-genai)')} - Reads email, asks Gemini to Americanize it, prints & copies.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=examples
    )

    # --- Input Options ---
    input_group = parser.add_mutually_exclusive_group()
    input_group.add_argument(
        "-i", "--input",
        metavar="FILE",
        type=str,
        help="Path to the input email file. Reads from stdin if no input option is specified."
    )
    input_group.add_argument(
        "-c", "--clipboard",
        action="store_true",
        help="Read input directly from the system clipboard (requires 'pyperclip' library)."
    )

    # --- LLM Configuration ---
    # Project/Location no longer needed for API Key auth
    llm_group = parser.add_argument_group(colors.cyan('LLM Configuration'))
    llm_group.add_argument(
        "--model",
        type=str,
        default=genai.DEFAULT_MODEL_NAME,
        help=f"Name of the Gemini model to use (e.g., 'gemini-1.5-flash-001'). Default: {genai.DEFAULT_MODEL_NAME}"
    )
    llm_group.add_argument(
        "--prompt-file",
        type=str,
        default="americanize.prompt",
        help="Path to the file containing the system prompt/instructions for the LLM (default: americanize.prompt)."
    )

    # --- LLM Parameters ---
    param_group = parser.add_argument_group(colors.magenta('LLM Generation Parameters'))
    param_group.add_argument(
        "--temperature",
        type=float,
        default=genai.DEFAULT_TEMPERATURE,
        help=f"Controls randomness (0.0-1.0). Lower is more deterministic. Default: {genai.DEFAULT_TEMPERATURE}"
    )
    param_group.add_argument(
        "--max-tokens",
        type=int,
        default=genai.DEFAULT_MAX_OUTPUT_TOKENS,
        help=f"Maximum number of tokens in the generated response. Default: {genai.DEFAULT_MAX_OUTPUT_TOKENS}"
    )
    param_group.add_argument(
        "--top-p",
        type=float,
        default=genai.DEFAULT_TOP_P,
        help=f"Nucleus sampling parameter. Cumulative probability cutoff. Default: {genai.DEFAULT_TOP_P}"
    )
    param_group.add_argument(
        "--top-k",
        type=int,
        default=genai.DEFAULT_TOP_K,
        help=f"Top-k sampling parameter. Consider only the top K most likely tokens. Default: {genai.DEFAULT_TOP_K}"
    )


    # --- Other Options ---
    other_group = parser.add_argument_group('Other Options')
    other_group.add_argument(
        "--debug",
        action="store_true",
        help="Enable verbose debug output, printed to stderr."
    )
    other_group.add_argument(
        "--no-clipboard-output",
        action="store_true",
        help="Do not attempt to copy the final output to the clipboard."
    )


    # --- Parse Arguments ---
    try:
        args = parser.parse_args()
    except Exception as e:
        print(colors.red(f"\n❗ Error parsing command-line arguments: {e}"), file=sys.stderr)
        parser.print_help(sys.stderr)
        sys.exit(2)

    return args

# --- Main Logic ---
def main():
    """Main execution function."""
    args = parse_arguments()
    exit_code = 0

    if args.debug:
        print(colors.grey("--- Debug Mode Enabled ---"), file=sys.stderr)
        print(colors.grey(f"Parsed Arguments: {vars(args)}"), file=sys.stderr)

    try:
        # 1. Read Input Text
        input_file = args.input
        use_clipboard_input = args.clipboard
        input_text = io_utils.read_input(file_path=input_file, use_clipboard=use_clipboard_input)

        if not input_text.strip():
             print(colors.yellow("🤔 Input text is empty or contains only whitespace. Nothing to process."), file=sys.stderr)
             sys.exit(0)

        if args.debug:
             print(colors.grey(f"📬 Read {len(input_text)} characters of input."), file=sys.stderr)
             if len(input_text) < 300:
                  print(colors.grey(f"Input Text Preview:\n'''\n{input_text[:300]}\n'''"), file=sys.stderr)


        # 2. Read System Prompt File Content
        try:
            prompt_filepath = args.prompt_file
            if args.debug:
                print(colors.grey(f"📜 Reading system prompt file: '{prompt_filepath}'..."), file=sys.stderr)
            if not os.path.isfile(prompt_filepath):
                 raise FileNotFoundError(f"Prompt file not found: '{prompt_filepath}'")
            with open(prompt_filepath, 'r', encoding='utf-8') as f:
                system_prompt_text = f.read()
            if not system_prompt_text.strip():
                 print(colors.yellow(f"⚠️ Warning: Prompt file '{prompt_filepath}' is empty or contains only whitespace."), file=sys.stderr)
                 # Allow empty system prompt, though maybe not useful
                 system_prompt_text = ""
            elif args.debug:
                 print(colors.grey("✅ System prompt file read successfully."), file=sys.stderr)
        except FileNotFoundError as e:
            print(colors.red(f"❗ Error: {e}"), file=sys.stderr)
            raise
        except IOError as e:
            print(colors.red(f"❗ Error reading prompt file '{prompt_filepath}': {e}"), file=sys.stderr)
            raise


        # 3. Initialize GenAI Client (checks for API Key)
        if args.debug:
             print(colors.grey("🔧 Instantiating Gemini Client (API Key Auth)..."), file=sys.stderr)
        # No project/location needed here, it reads GOOGLE_API_KEY from env
        client = genai.GeminiClient(debug=args.debug)
        if args.debug:
             print(colors.grey("✅ Gemini Client instantiated."), file=sys.stderr)


        # 4. Call Gemini API
        processed_text = client.process_text(
            system_prompt=system_prompt_text, # Pass the prompt file content as system instruction
            input_text=input_text,            # Pass the email body as user input content
            model_name=args.model,
            temperature=args.temperature,
            max_output_tokens=args.max_tokens,
            top_p=args.top_p,
            top_k=args.top_k
        )


        # 5. Output Result to Standard Output
        print(colors.green("\n--- LLM Processed Output ---"), file=sys.stderr)
        print(processed_text, flush=True) # To stdout
        print(colors.green("--- End of Output ---"), file=sys.stderr)


        # 6. Optionally Copy to Clipboard
        if not args.no_clipboard_output:
            if io_utils.copy_to_clipboard(processed_text):
                print(colors.cyan("\n📋✨ Result also copied to clipboard!"), file=sys.stderr)
            else:
                 print(colors.yellow("\n📋❌ Could not copy result to clipboard (see details above)."), file=sys.stderr)
        elif args.debug:
            print(colors.grey("\n📋 Skipped copying output to clipboard due to --no-clipboard-output flag."), file=sys.stderr)


    except (FileNotFoundError, ImportError, ValueError, RuntimeError, IOError) as e:
        print(colors.red(f"\n[ERROR] Execution failed: {e}"), file=sys.stderr)
        exit_code = 1
        if args.debug:
            import traceback
            print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    except Exception as e:
        print(colors.red(f"\n💥 [UNEXPECTED ERROR] An unhandled error occurred: {type(e).__name__} - {e}"), file=sys.stderr)
        exit_code = 1
        import traceback
        print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    finally:
        if args.debug:
            print(colors.grey(f"\n🏁 Script finished with exit code: {exit_code}"), file=sys.stderr)
        sys.exit(exit_code)


if __name__ == "__main__":
    main()
EOF
echo "🐍 Created file: llm-americanize.py (google-genai version)"
chmod +x llm-americanize.py
echo "🔩 Made llm-americanize.py executable."

# --- requirements.txt (UPDATED) ---
cat << 'EOF' > requirements.txt
google-genai>=0.7.0
pyperclip>=1.8.2
python-dotenv>=1.0.0
EOF
echo "📄 Created file: requirements.txt (google-genai version)"

# --- Final Instructions (UPDATED) ---
echo ""
echo "✅ All files created successfully!"
echo "➡️ Next steps:"
echo "1. Install dependencies: pip install -r requirements.txt"
echo "2. Set your Gemini API Key:"
echo "   - Create a key at: https://aistudio.google.com/app/apikey"
echo "   - Set the environment variable 'GOOGLE_API_KEY'. You can:"
echo "     a) Export it in your shell: export GOOGLE_API_KEY='AIzaSy...your...key...'"
echo "     b) Create a file named '.env' in this directory with the line: GOOGLE_API_KEY='AIzaSy...your...key...'"
echo "3. Edit the 'americanize.prompt' file if desired (it's now used as system instruction)."
echo "4. Run the script (no --project needed):"
echo "   ./llm-americanize.py --input your_email.txt"
echo "   cat your_email.txt | ./llm-americanize.py"
echo "   ./llm-americanize.py --clipboard"
echo "🎉 Happy Americanizing! 🇺🇸"

