#!/bin/bash
# sbrodola.sh - Bootstrapper for the LLM Email Prettifier Project

# Exit on error, treat unset variables as error, exit on pipe failures
set -euo pipefail

echo "🚀 Creating project structure and files..."

# Create lib directory
mkdir -p lib
echo "📁 Created directory: lib/"

# --- lib/colors.py ---
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
cat << 'EOF' > lib/io_utils.py
# -*- coding: utf-8 -*-
"""
Input/Output Utilities - Reading from places and putting things into other places. 📥📤
Handles reading from stdin, files, clipboard and writing to clipboard.
"""

import sys
from typing import Optional

# Attempt to import pyperclip, but don't fail if it's not there yet.
# We'll handle the error gracefully in the functions.
try:
    import pyperclip
    _PYPERCLIP_AVAILABLE = True
except ImportError:
    _PYPERCLIP_AVAILABLE = False
    # print("Warning: pyperclip module not found. Clipboard functionality will be disabled.", file=sys.stderr)
    # print("Install it with: pip install pyperclip", file=sys.stderr)

# Import colors locally within functions where needed to avoid potential
# circular dependency issues if other utils needed colors, though unlikely here.
# Or just import at top level if structure is simple like this.
try:
    from lib import colors
except ImportError:
    # Fallback if colors cannot be imported (e.g., during setup/testing)
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
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
            raise RuntimeError(f"Failed to read from clipboard: {e}") from e
    elif file_path:
        try:
            print(colors.cyan(f"📄 Reading from file: {file_path}..."), file=sys.stderr)
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Input file not found: {file_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to read file {file_path}: {e}") from e
    else:
        # Read from stdin
        if sys.stdin.isatty() and not sys.stdin.closed:
             # This means the script is run interactively without piped input
             raise RuntimeError("No input provided. Pipe content via stdin, use --input <file>, or use --clipboard.")

        print(colors.cyan("⌨️ Reading from stdin..."), file=sys.stderr)
        # Read all data from stdin
        content = sys.stdin.read()
        # If stdin was immediately closed (e.g., `echo "" | script`), content might be empty.
        # This is valid, allow empty input to proceed.
        return content


def copy_to_clipboard(text: str) -> bool:
    """
    Copies the given text to the system clipboard.

    Args:
        text: The text to copy.

    Returns:
        True if successful, False otherwise.
    """
    if not _PYPERCLIP_AVAILABLE:
        print(colors.yellow("📋 Clipboard functionality disabled (pyperclip not installed)."), file=sys.stderr)
        return False
    try:
        pyperclip.copy(text)
        return True
    except Exception as e: # Catching generic Exception
        print(colors.red(f"❗ Failed to copy to clipboard: {e}"), file=sys.stderr)
        return False

EOF
echo "💾 Created file: lib/io_utils.py"

# --- lib/genai.py ---
cat << 'EOF' > lib/genai.py
# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain! 🧠
Handles communication with the Vertex AI Gemini API.
"""

import sys
import time
from typing import Optional

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, GenerationConfig, Candidate, Part
    from google.api_core import exceptions as google_exceptions
    _VERTEXAI_AVAILABLE = True
except ImportError:
    _VERTEXAI_AVAILABLE = False
    # print("Warning: google-cloud-aiplatform module not found. GenAI functionality will be disabled.", file=sys.stderr)
    # print("Install it with: pip install google-cloud-aiplatform", file=sys.stderr)

try:
    from lib import colors
except ImportError:
    # Fallback if colors cannot be imported
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()


# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95 # Often used with temperature
DEFAULT_TOP_K = 40   # Often used with temperature

# The placeholder we expect in prompt files
PROMPT_INPUT_PLACEHOLDER = "{EMAIL_BODY}"

class GeminiClient:
    """Wraps the Vertex AI Gemini client."""

    def __init__(self, project_id: str, location: str, debug: bool = False):
        """
        Initializes the GeminiClient.

        Args:
            project_id: Google Cloud Project ID.
            location: Google Cloud Project Location (e.g., 'us-central1').
            debug: Enable debug printing.

        Raises:
            ImportError: If the 'google-cloud-aiplatform' library is not installed.
            RuntimeError: If Vertex AI initialization fails.
        """
        if not _VERTEXAI_AVAILABLE:
            raise ImportError("The 'google-cloud-aiplatform' library is required for GenAI operations. Please install it (`pip install google-cloud-aiplatform`).")

        self.project_id = project_id
        self.location = location
        self.debug = debug
        self._model: Optional[GenerativeModel] = None # Lazy initialization

        try:
            if self.debug:
                print(colors.grey(f"🔧 Initializing Vertex AI SDK for project '{project_id}' in location '{location}'..."), file=sys.stderr)
            # Retry initialization softly, sometimes network blips happen
            retries = 3
            for i in range(retries):
                try:
                    vertexai.init(project=project_id, location=location)
                    if self.debug:
                        print(colors.grey(f"✅ Vertex AI SDK initialized successfully (attempt {i+1}/{retries})."), file=sys.stderr)
                    break # Success
                except Exception as e:
                    if i < retries - 1:
                        print(colors.yellow(f"⚠️ Vertex AI init failed (attempt {i+1}/{retries}): {e}. Retrying in 2 seconds..."), file=sys.stderr)
                        time.sleep(2)
                    else:
                        print(colors.red(f"❗ Vertex AI init failed after {retries} attempts."), file=sys.stderr)
                        raise RuntimeError(f"Failed to initialize Vertex AI SDK: {e}") from e
        except Exception as e:
             # Catch any unexpected error during the retry logic itself
             print(colors.red(f"❗ Unexpected error during Vertex AI initialization: {e}"), file=sys.stderr)
             raise RuntimeError(f"Unexpected error initializing Vertex AI SDK: {e}") from e


    def _get_model(self, model_name: str) -> GenerativeModel:
        """Initializes and returns the GenerativeModel instance."""
        # Construct the full model resource name expected by the library
        expected_model_name = f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/{model_name}"

        # Check if the current model instance matches the *full resource name*
        # Note: Accessing _model_name might be fragile if library internals change, but it's common practice.
        if self._model is None or self._model._model_name != expected_model_name:
             if self.debug:
                 print(colors.grey(f"🧠 Loading/switching to Generative Model: {model_name} ({expected_model_name})..."), file=sys.stderr)
             try:
                self._model = GenerativeModel(model_name)
                if self.debug:
                    # Verify the internal name matches expectation after loading
                    loaded_name = getattr(self._model, '_model_name', 'Unknown')
                    print(colors.grey(f"✅ Model '{model_name}' loaded. Internal resource name: {loaded_name}"), file=sys.stderr)
             except Exception as e:
                 print(colors.red(f"❗ Failed to load model '{model_name}': {e}"), file=sys.stderr)
                 raise RuntimeError(f"Failed to load model '{model_name}'") from e
        elif self.debug:
            print(colors.grey(f"🧠 Reusing existing model instance for: {model_name}"), file=sys.stderr)

        # Double-check model is not None after attempt
        if self._model is None:
            raise RuntimeError(f"Model object is unexpectedly None after trying to load '{model_name}'.")

        return self._model


    def process_text(
        self,
        prompt_template: str,
        input_text: str,
        model_name: str = DEFAULT_MODEL_NAME,
        temperature: float = DEFAULT_TEMPERATURE,
        max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
        top_p: float = DEFAULT_TOP_P,
        top_k: int = DEFAULT_TOP_K
    ) -> str:
        """
        Sends the input text and prompt to the Gemini model for processing.

        Args:
            prompt_template: The prompt string, potentially containing {EMAIL_BODY}.
            input_text: The text to be processed (e.g., the email body).
            model_name: The name of the Gemini model to use.
            temperature: Controls randomness (0.0-1.0). Lower is more deterministic.
            max_output_tokens: Maximum number of tokens in the response.
            top_p: Nucleus sampling parameter.
            top_k: Top-k sampling parameter.

        Returns:
            The processed text returned by the model.

        Raises:
            ValueError: If the prompt template doesn't contain the expected placeholder.
            RuntimeError: If the API call fails or model loading fails.
        """
        if PROMPT_INPUT_PLACEHOLDER not in prompt_template:
             print(colors.yellow(f"⚠️ Warning: Prompt template does not contain the placeholder '{PROMPT_INPUT_PLACEHOLDER}'. Input text will be appended directly after the template."), file=sys.stderr)
             # Ensure there's separation between template and raw input
             full_prompt = f"{prompt_template.rstrip()}\n\n---\n\n{input_text}"
        else:
             full_prompt = prompt_template.replace(PROMPT_INPUT_PLACEHOLDER, input_text)

        if self.debug:
            print(colors.grey("\n--- Sending Prompt to LLM ---"), file=sys.stderr)
            print(colors.grey(full_prompt[:500] + ("..." if len(full_prompt) > 500 else "")), file=sys.stderr) # Print truncated prompt
            print(colors.grey("-----------------------------"), file=sys.stderr)
            print(colors.grey(f"Model: {model_name}, Temp: {temperature}, Max Tokens: {max_output_tokens}, Top-P: {top_p}, Top-K: {top_k}"), file=sys.stderr)


        try:
            model = self._get_model(model_name)
        except RuntimeError as e:
             # Propagate model loading errors
             raise e

        generation_config = GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k
        )

        try:
            print(colors.cyan(f"✨ Calling Gemini ({model_name})... This might take a moment..."), file=sys.stderr)
            start_time = time.time()
            response = model.generate_content(
                [full_prompt], # Content can be a list of strings or Parts
                generation_config=generation_config,
                # stream=False # We want the full response here
                )
            duration = time.time() - start_time

            if self.debug:
                print(colors.grey(f"✅ Raw API Response received ({type(response)}) in {duration:.2f}s."), file=sys.stderr)
                # print(colors.grey(f"{response}"), file=sys.stderr) # Might be too verbose

            # --- Process Response ---
            # More robust checking based on library documentation and common patterns
            if not response.candidates:
                 # Check usage metadata if available, might give clues
                 usage_metadata = getattr(response, 'usage_metadata', None)
                 if self.debug:
                      print(colors.yellow(f"LLM response missing candidates. Usage metadata: {usage_metadata}"), file=sys.stderr)
                 raise RuntimeError(f"LLM response contained no candidates. Usage: {usage_metadata}")

            # Check the first candidate (usually the only one unless num_candidates > 1)
            candidate = response.candidates[0]
            finish_reason = getattr(candidate, 'finish_reason', Candidate.FinishReason.FINISH_REASON_UNSPECIFIED)
            safety_ratings = getattr(candidate, 'safety_ratings', [])

            # Case 1: Valid content exists
            if candidate.content and candidate.content.parts:
                # Assuming text model, the first part should contain the text
                result_text = candidate.content.parts[0].text
                if self.debug:
                    print(colors.grey(f"✅ Extracted Text Length: {len(result_text)} chars. Finish reason: {finish_reason.name if finish_reason else 'N/A'}"), file=sys.stderr)
                # If finish_reason indicates truncation (MAX_TOKENS), warn the user
                if finish_reason == Candidate.FinishReason.MAX_TOKENS:
                    print(colors.yellow(f"⚠️ Warning: LLM response may be truncated because the maximum output token limit ({max_output_tokens}) was reached."), file=sys.stderr)
                return result_text

            # Case 2: No content, investigate why
            if self.debug:
                 print(colors.yellow(f"LLM response missing content parts. Finish reason: {finish_reason.name if finish_reason else 'N/A'}"), file=sys.stderr)
                 if safety_ratings:
                     print(colors.yellow(f"Safety Ratings: {safety_ratings}"), file=sys.stderr)

            # Specific error based on finish reason
            if finish_reason == Candidate.FinishReason.SAFETY:
                 raise RuntimeError(f"LLM response blocked due to safety concerns. Ratings: {safety_ratings}")
            elif finish_reason == Candidate.FinishReason.RECITATION:
                 raise RuntimeError("LLM response blocked due to potential recitation issues.")
            elif finish_reason == Candidate.FinishReason.OTHER:
                 raise RuntimeError("LLM response failed due to an unspecified 'other' reason.")
            elif finish_reason == Candidate.FinishReason.FINISH_REASON_UNSPECIFIED:
                 raise RuntimeError("LLM response finished with an unspecified reason and no content.")
            else:
                # Should not happen if MAX_TOKENS was handled above, but catch just in case
                 raise RuntimeError(f"LLM response contained no content parts. Finish reason: {finish_reason.name if finish_reason else 'Unknown'}")


        except google_exceptions.PermissionDenied as e:
             print(colors.red("\n🚫 Permission Denied! Check your authentication and ensure the Vertex AI API is enabled."), file=sys.stderr)
             print(colors.red(f"   Project: {self.project_id}, Location: {self.location}"), file=sys.stderr)
             print(colors.red(f"   Attempted Model: {model_name}"), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Permission Denied") from e
        except google_exceptions.ResourceExhausted as e:
             print(colors.red("\nquota Exceeded! You might be sending requests too quickly or exceeded your quota."), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Quota Exceeded") from e
        except google_exceptions.InvalidArgument as e:
             print(colors.red(f"\n❗ Invalid Argument Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Check model name ('{model_name}'), parameters (temp, tokens, etc.), or prompt format."), file=sys.stderr)
             raise RuntimeError("API Invalid Argument") from e
        except google_exceptions.GoogleAPICallError as e:
             print(colors.red(f"\n❗ API Call Error: {e}"), file=sys.stderr)
             raise RuntimeError("General API Call Error") from e
        except Exception as e:
             print(colors.red(f"\n❗ An unexpected error occurred during the Gemini API call: {e}"), file=sys.stderr)
             # Re-raise the original exception for better traceback if not handled above
             raise RuntimeError("Unexpected GenAI Error") from e

EOF
echo "🧠 Created file: lib/genai.py"


# --- americanize.prompt ---
cat << 'EOF' > americanize.prompt
You are an expert editor specializing in converting text to standard American English, suitable for professional business communication.

Your task is to take the input email text provided below and revise it according to these guidelines:

1.  **Spelling:** Convert all British/Commonwealth English spellings to American English (e.g., "colour" -> "color", "organise" -> "organize", "centre" -> "center").
2.  **Vocabulary & Idioms:** Replace British/Commonwealth terms and idioms with their common American equivalents (e.g., "holiday" -> "vacation", "lift" -> "elevator", "queue" -> "line", "fortnight" -> "two weeks", "cheers" (as thanks) -> "thanks", "quite good" -> "pretty good" or "very good", "whilst" -> "while"). Look for subtle differences too (e.g., "full stop" -> "period").
3.  **Grammar & Punctuation:** Adjust punctuation and minor grammatical structures where American conventions differ (e.g., placement of punctuation with quotation marks - typically inside, use of serial comma is often preferred in professional settings but match original style if consistent). Ensure subject-verb agreement and clarity.
4.  **Tone:** Maintain a professional, clear, and generally positive business tone. Avoid overly casual or slang terms unless they are standard in American business (which is rare). Do not make the text *less* formal unless the original is overly stiff or informal. The goal is natural-sounding American business English.
5.  **Formatting:** Preserve the general structure (paragraphs, greetings, closings) of the original email. Do not add extra greetings or closings unless the original is missing them. Preserve line breaks between paragraphs.
6.  **Clarity and Conciseness:** Improve clarity and conciseness where possible without losing the original meaning or essential politeness.
7.  **Output:** ONLY output the revised email body. Do not include any introductory phrases like "Here is the revised email:", "Revised text:", or any commentary about the changes you made. Just the final, revised text.

Here is the email body to revise:

{EMAIL_BODY}
EOF
echo "📝 Created file: americanize.prompt"


# --- llm-americanize.py ---
cat << 'EOF' > llm-americanize.py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLM Email Prettifier/Americanizer 🇺🇸✨

Reads email text from stdin, a file, or clipboard, sends it to Gemini
via Vertex AI for processing based on a prompt file, and outputs the result
to stdout and the clipboard.
"""

import argparse
import sys
import os
import textwrap # For wrapping help text

# --- Add lib directory to Python path ---
# This makes `from lib import ...` work reliably
LIB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib')
if LIB_DIR not in sys.path:
    sys.path.insert(0, LIB_DIR)

# --- Import custom libraries (with error handling) ---
try:
    from lib import colors, io_utils, genai
except ImportError as e:
    # Provide more specific guidance if possible
    missing_module = str(e).split("'")[-2] # Heuristic to find module name
    print(f"\n[ERROR] Failed to import required library module: '{missing_module}'", file=sys.stderr)
    print(f"        Please ensure the '{LIB_DIR}' directory exists and contains the necessary '.py' files.", file=sys.stderr)
    print("        Did you run the `sbrodola.sh` script successfully?", file=sys.stderr)
    print("        Original error:", e, file=sys.stderr)
    sys.exit(1)
except Exception as e:
    # Catch other potential import errors
    print(f"\n[ERROR] An unexpected error occurred during library import:", file=sys.stderr)
    print(f"        Error: {e}", file=sys.stderr)
    print(f"        Please check the integrity of files in '{LIB_DIR}'.", file=sys.stderr)
    sys.exit(1)

# --- Argument Parsing ---
def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments."""

    # Use textwrap to format the epilog nicely
    examples = textwrap.dedent(f"""
    Examples:
      # Read from file, specify project (replace 'my-gcp-project')
      {colors.yellow('./llm-americanize.py --project my-gcp-project --input my_email.txt')}

      # Read from stdin, specify project
      {colors.yellow('cat my_email.txt | ./llm-americanize.py --project my-gcp-project')}

      # Read from clipboard (requires pyperclip), specify project
      {colors.yellow('./llm-americanize.py --project my-gcp-project --clipboard')}

      # Read from clipboard using system tools (macOS)
      {colors.yellow('pbpaste | ./llm-americanize.py --project my-gcp-project')}

      # Read from clipboard using system tools (Linux with xclip)
      {colors.yellow('xclip -o | ./llm-americanize.py --project my-gcp-project')}

      # Use a different prompt file and model
      {colors.yellow('./llm-americanize.py --project my-gcp-project --input draft.txt \\')}
      {colors.yellow('  --prompt-file custom_style.prompt --model gemini-1.5-pro-001')}

      # Enable debug output
      {colors.yellow('./llm-americanize.py --project my-gcp-project --input my_email.txt --debug')}
    """)

    parser = argparse.ArgumentParser(
        description=f"{colors.bold('LLM Email Americanizer')} - Reads email, asks Gemini to Americanize it, prints & copies.",
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
    llm_group = parser.add_argument_group(colors.cyan('LLM Configuration'))
    llm_group.add_argument(
        "--project",
        type=str,
        required=True, # Made project ID mandatory for clarity
        help="REQUIRED: Your Google Cloud Project ID for Vertex AI."
    )
    llm_group.add_argument(
        "--location",
        type=str,
        default="us-central1",
        help="Google Cloud location for Vertex AI API endpoint (default: us-central1)."
    )
    llm_group.add_argument(
        "--model",
        type=str,
        default=genai.DEFAULT_MODEL_NAME,
        help=f"Name of the Gemini model to use on Vertex AI (default: {genai.DEFAULT_MODEL_NAME})."
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
        # This catches errors during argument parsing itself (e.g., invalid type)
        # parser.error() would have already exited, but this is a safeguard.
        print(colors.red(f"\n❗ Error parsing command-line arguments: {e}"), file=sys.stderr)
        parser.print_help(sys.stderr)
        sys.exit(2) # Use a different exit code for parsing errors

    return args

# --- Main Logic ---
def main():
    """Main execution function."""
    args = parse_arguments()
    exit_code = 0 # Default to success

    if args.debug:
        print(colors.grey("--- Debug Mode Enabled ---"), file=sys.stderr)
        print(colors.grey(f"Parsed Arguments: {vars(args)}"), file=sys.stderr)
        print(colors.grey(f"Python sys.path: {sys.path}"), file=sys.stderr)

    try:
        # 1. Read Input Text
        # Determine input source based on mutually exclusive group
        input_file = args.input
        use_clipboard_input = args.clipboard
        input_text = io_utils.read_input(file_path=input_file, use_clipboard=use_clipboard_input)

        # Check if input is empty *after* reading
        if not input_text.strip():
             print(colors.yellow("🤔 Input text is empty or contains only whitespace. Nothing to process."), file=sys.stderr)
             # No error, just nothing to do. Exit cleanly.
             sys.exit(0)

        if args.debug:
             print(colors.grey(f"📬 Read {len(input_text)} characters of input."), file=sys.stderr)
             if len(input_text) < 200: # Print short inputs for debugging
                  print(colors.grey(f"Input Text Preview:\n'''\n{input_text[:200]}\n'''"), file=sys.stderr)


        # 2. Read Prompt File Content
        try:
            prompt_filepath = args.prompt_file
            if args.debug:
                print(colors.grey(f"📜 Reading prompt file: '{prompt_filepath}'..."), file=sys.stderr)
            # Ensure file exists before trying to open
            if not os.path.isfile(prompt_filepath):
                 raise FileNotFoundError(f"Prompt file not found: {prompt_filepath}")
            with open(prompt_filepath, 'r', encoding='utf-8') as f:
                prompt_template = f.read()
            if not prompt_template.strip():
                 print(colors.yellow(f"⚠️ Warning: Prompt file '{prompt_filepath}' is empty or contains only whitespace."), file=sys.stderr)
            elif args.debug:
                 print(colors.grey("✅ Prompt file read successfully."), file=sys.stderr)
        except FileNotFoundError as e:
            print(colors.red(f"❗ Error: {e}"), file=sys.stderr)
            raise # Re-raise to be caught by the main handler
        except IOError as e:
            print(colors.red(f"❗ Error reading prompt file '{prompt_filepath}': {e}"), file=sys.stderr)
            raise # Re-raise


        # 3. Initialize GenAI Client (can raise errors)
        if args.debug:
             print(colors.grey("🔧 Instantiating Gemini Client..."), file=sys.stderr)
        client = genai.GeminiClient(args.project, args.location, args.debug)
        if args.debug:
             print(colors.grey("✅ Gemini Client instantiated."), file=sys.stderr)


        # 4. Call Gemini API (can raise errors)
        processed_text = client.process_text(
            prompt_template=prompt_template,
            input_text=input_text,
            model_name=args.model,
            temperature=args.temperature,
            max_output_tokens=args.max_tokens,
            top_p=args.top_p,
            top_k=args.top_k
        )


        # 5. Output Result to Standard Output
        # Print a clear separator before the main output
        print(colors.green("\n--- LLM Processed Output ---"), file=sys.stderr)
        # Print the actual result to STDOUT so it can be piped
        print(processed_text, flush=True)
        # Print a closing separator to stderr
        print(colors.green("--- End of Output ---"), file=sys.stderr)


        # 6. Optionally Copy to Clipboard
        if not args.no_clipboard_output:
            if io_utils.copy_to_clipboard(processed_text):
                print(colors.cyan("\n📋✨ Result also copied to clipboard!"), file=sys.stderr)
            else:
                 # Error/warning message should have been printed by io_utils.copy_to_clipboard
                 # Indicate failure slightly more clearly here.
                 print(colors.yellow("\n📋❌ Could not copy result to clipboard (see details above)."), file=sys.stderr)
        elif args.debug:
            print(colors.grey("\n📋 Skipped copying output to clipboard due to --no-clipboard-output flag."), file=sys.stderr)


    except (FileNotFoundError, ImportError, ValueError, RuntimeError, IOError) as e:
        # Handle errors raised explicitly from our code or dependencies
        print(colors.red(f"\n[ERROR] Execution failed: {e}"), file=sys.stderr)
        exit_code = 1 # Indicate failure
        if args.debug:
            # Provide traceback in debug mode for easier diagnosis
            import traceback
            print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    except Exception as e:
        # Catch-all for truly unexpected errors
        print(colors.red(f"\n💥 [UNEXPECTED ERROR] An unhandled error occurred: {e}"), file=sys.stderr)
        exit_code = 1 # Indicate failure
        # Always print traceback for unexpected errors
        import traceback
        print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    finally:
        if args.debug:
            print(colors.grey(f"\n🏁 Script finished with exit code: {exit_code}"), file=sys.stderr)
        # Ensure script exits with the determined code
        sys.exit(exit_code)


if __name__ == "__main__":
    # Ensure that when running the script directly (__name__ == "__main__"),
    # the main function is called.
    main()
EOF
echo "🐍 Created file: llm-americanize.py"
chmod +x llm-americanize.py
echo "🔩 Made llm-americanize.py executable."

# --- requirements.txt ---
cat << 'EOF' > requirements.txt
google-cloud-aiplatform>=1.40.0
pyperclip>=1.8.2
EOF
echo "📄 Created file: requirements.txt"

# --- Final Instructions (Plain Text) ---
echo ""
echo "✅ All files created successfully!"
echo "➡️ Next steps:"
echo "1. Install dependencies: pip install -r requirements.txt"
echo "2. Make sure you are authenticated with Google Cloud:"
echo "   gcloud auth application-default login"
echo "   gcloud config set project YOUR_PROJECT_ID"
echo "3. Ensure the Vertex AI API is enabled in your project."
echo "4. Edit the 'americanize.prompt' file if desired."
echo "5. Run the script (see examples in --help):"
echo "   ./llm-americanize.py --project YOUR_PROJECT_ID --input your_email.txt"
echo "   cat your_email.txt | ./llm-americanize.py --project YOUR_PROJECT_ID"
echo "   ./llm-americanize.py --project YOUR_PROJECT_ID --clipboard"
echo "🎉 Happy Americanizing! 🇺🇸"
