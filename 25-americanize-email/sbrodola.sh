#!/bin/bash
# sbrodola.sh - Bootstrapper for the LLM Email Prettifier Project (google-genai version, system clipboard)

# Exit on error, treat unset variables as error, exit on pipe failures
set -euo pipefail

echo "🚀 Creating project structure and files (using google-genai, system clipboard)..."

# Create lib directory
mkdir -p lib
echo "📁 Created directory: lib/"

# --- lib/colors.py ---
# (No changes from previous version)
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

# --- lib/clipboard.py (NEW) ---
cat << 'EOF' > lib/clipboard.py
# -*- coding: utf-8 -*-
"""
Clipboard Interaction using System Commands (pbpaste/pbcopy, xclip).
Handles getting text from and putting text onto the system clipboard.
"""

import platform
import subprocess
import sys

try:
    # Assume running from top level where llm-americanize.py is
    if __package__ is None or __package__ == '':
        # Running as script or top-level module
        from colors import red, yellow, grey, cyan
    else:
        # Running as part of the 'lib' package
        from .colors import red, yellow, grey, cyan
except ImportError:
    # Fallback if colors cannot be imported
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x # Return function that returns input unchanged
    colors = MockColors()
    red = yellow = grey = cyan = colors.red # Assign all needed colors


# --- Clipboard Reading (Paste) ---

def _paste_macos() -> str:
    """Pastes from clipboard using macOS pbpaste command."""
    try:
        result = subprocess.run(
            ['pbpaste'],
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8' # Explicitly set encoding
        )
        return result.stdout
    except FileNotFoundError:
        print(red("❗ Error: 'pbpaste' command not found. Is this macOS?"), file=sys.stderr)
        raise RuntimeError("Clipboard command 'pbpaste' not found.")
    except subprocess.CalledProcessError as e:
        print(red(f"❗ Error running 'pbpaste': {e}"), file=sys.stderr)
        if e.stderr:
            print(red(f"   stderr: {e.stderr.strip()}"), file=sys.stderr)
        raise RuntimeError(f"Failed to run 'pbpaste': {e}")
    except Exception as e:
        print(red(f"❗ Unexpected error during paste (macOS): {e}"), file=sys.stderr)
        raise RuntimeError(f"Unexpected paste error (macOS)") from e

def _paste_linux() -> str:
    """Pastes from clipboard using Linux xclip command."""
    try:
        # Check if xclip is available first
        subprocess.run(['which', 'xclip'], check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print(red("❗ Error: 'xclip' command not found or not executable."), file=sys.stderr)
        print(yellow("   Please install 'xclip' (e.g., 'sudo apt install xclip' or 'sudo yum install xclip')"), file=sys.stderr)
        raise RuntimeError("Clipboard command 'xclip' not found or not installed.")

    try:
        result = subprocess.run(
            ['xclip', '-selection', 'clipboard', '-o'],
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8'
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        # Handle case where clipboard might be empty - xclip might return non-zero
        # Check stderr? Often empty clipboard is not an error state for the command itself
        # but might result in empty stdout. Let the caller check for empty string.
        print(red(f"❗ Error running 'xclip -o': {e}"), file=sys.stderr)
        if e.stderr:
             print(red(f"   stderr: {e.stderr.strip()}"), file=sys.stderr)
        # It might be an actual error, or just an empty clipboard.
        # Let's return empty string in case of error and let caller decide.
        # Re-raising might be too strict if clipboard is just empty.
        print(yellow("   Could not get content via xclip. Clipboard might be empty or inaccessible."), file=sys.stderr)
        return "" # Return empty string on error/empty clipboard for Linux
        # raise RuntimeError(f"Failed to run 'xclip -o': {e}") # Or raise if strictness needed
    except Exception as e:
        print(red(f"❗ Unexpected error during paste (Linux/xclip): {e}"), file=sys.stderr)
        raise RuntimeError(f"Unexpected paste error (Linux/xclip)") from e


def paste() -> str:
    """
    Retrieves text from the system clipboard based on the OS.

    Returns:
        The text content of the clipboard.

    Raises:
        RuntimeError: If the OS is not supported or clipboard commands fail critically.
        FileNotFoundError: (Implicitly via CalledProcessError) If required commands aren't found.
    """
    os_name = platform.system()
    if os_name == 'Darwin':
        print(cyan("📋 Reading from clipboard using pbpaste (macOS)..."), file=sys.stderr)
        content = _paste_macos()
    elif os_name == 'Linux':
        print(cyan("📋 Reading from clipboard using xclip (Linux)..."), file=sys.stderr)
        content = _paste_linux()
    # Add Windows support here if needed (e.g., using 'clip' command or ctypes/pywin32)
    # elif os_name == 'Windows':
    #     content = _paste_windows()
    else:
        raise RuntimeError(f"Unsupported operating system for clipboard operations: {os_name}")

    if not content:
        print(yellow("📋 Clipboard seems empty or could not be read."), file=sys.stderr)

    return content

# --- Clipboard Writing (Copy) ---

def _copy_macos(text: str) -> bool:
    """Copies text to clipboard using macOS pbcopy command."""
    try:
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE, text=True, encoding='utf-8')
        stdout, stderr = process.communicate(input=text)
        if process.returncode != 0:
            print(red(f"❗ Error running 'pbcopy' (return code {process.returncode})."), file=sys.stderr)
            # stderr might be None or empty even on error with pbcopy
            return False
        return True
    except FileNotFoundError:
        print(red("❗ Error: 'pbcopy' command not found. Is this macOS?"), file=sys.stderr)
        return False
    except Exception as e:
        print(red(f"❗ Unexpected error during copy (macOS): {e}"), file=sys.stderr)
        return False

def _copy_linux(text: str) -> bool:
    """Copies text to clipboard using Linux xclip command."""
    try:
        # Check if xclip is available first
        subprocess.run(['which', 'xclip'], check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print(red("❗ Error: 'xclip' command not found or not executable."), file=sys.stderr)
        print(yellow("   Please install 'xclip' to enable clipboard output."), file=sys.stderr)
        return False

    try:
        process = subprocess.Popen(['xclip', '-selection', 'clipboard', '-i'], stdin=subprocess.PIPE, text=True, encoding='utf-8')
        stdout, stderr = process.communicate(input=text)
        if process.returncode != 0:
            print(red(f"❗ Error running 'xclip -i' (return code {process.returncode})."), file=sys.stderr)
            if stderr: # stderr might actually contain info here
                 print(red(f"   stderr: {stderr.strip()}"), file=sys.stderr)
            return False
        return True
    except Exception as e:
        print(red(f"❗ Unexpected error during copy (Linux/xclip): {e}"), file=sys.stderr)
        return False

def copy(text: str) -> bool:
    """
    Copies the given text to the system clipboard based on the OS.

    Args:
        text: The text to copy.

    Returns:
        True if successful, False otherwise.
    """
    os_name = platform.system()
    if os_name == 'Darwin':
        return _copy_macos(text)
    elif os_name == 'Linux':
        return _copy_linux(text)
    # Add Windows support here if needed
    # elif os_name == 'Windows':
    #     return _copy_windows(text)
    else:
        print(yellow(f"📋 Clipboard output not supported on this OS ({os_name})."), file=sys.stderr)
        return False

EOF
echo "📋 Created file: lib/clipboard.py"


# --- lib/io_utils.py (UPDATED) ---
cat << 'EOF' > lib/io_utils.py
# -*- coding: utf-8 -*-
"""
Input/Output Utilities - Reading from stdin/files. 📥📄
(Clipboard handled in lib/clipboard.py)
"""

import sys
import os

# Import colors locally within functions where needed to avoid potential
# circular dependency issues if other utils needed colors, though unlikely here.
# Or just import at top level if structure is simple like this.
try:
    # Assume running from top level where llm-americanize.py is
    if __package__ is None or __package__ == '':
        # Running as script or top-level module
        from colors import red, yellow, grey, cyan
    else:
        # Running as part of the 'lib' package
        from .colors import red, yellow, grey, cyan
except ImportError:
    # Fallback if colors cannot be imported (e.g., during setup/testing)
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x # Return function that returns input unchanged
    colors = MockColors()
    red = yellow = grey = cyan = colors.red # Assign all needed colors


def read_input(file_path: str | None = None) -> str:
    """
    Reads input text from the specified file path or standard input.

    Args:
        file_path: Path to the input file. If None, reads from stdin.

    Returns:
        The input text as a string.

    Raises:
        FileNotFoundError: If the specified file_path does not exist.
        RuntimeError: If reading from stdin or file fails.
    """
    if file_path:
        # --- Read from File ---
        try:
            print(cyan(f"📄 Reading from file: {file_path}..."), file=sys.stderr)
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
        # --- Read from Stdin ---
        # Check if stdin is connected to a terminal (interactive) vs. piped/redirected
        # This check should ideally happen *before* calling read_input in the main script
        # if stdin is the chosen method, but we add a fallback message here too.
        if sys.stdin.isatty() and not sys.stdin.closed:
             print(yellow("🤔 Reading from interactive terminal (stdin)... Type your input and press Ctrl+D (Unix) or Ctrl+Z then Enter (Windows) when done."), file=sys.stderr)
             # Alternatively, raise error if interactive stdin without explicit flag is not desired:
             # raise RuntimeError("Stdin is interactive. Use a flag or pipe data.")

        print(cyan("⌨️ Reading from stdin..."), file=sys.stderr)
        try:
            # Read all data from stdin
            content = sys.stdin.read()
            return content
        except Exception as e:
             raise RuntimeError(f"Failed to read from stdin: {e}") from e

# Note: copy_to_clipboard functionality is now in lib/clipboard.py

EOF
echo "💾 Created file: lib/io_utils.py (removed clipboard logic)"

# --- lib/genai.py (UPDATED - Added safety definition inside init) ---
cat << 'EOF' > lib/genai.py
# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain using google-genai! 🧠
Handles communication with the Gemini API via API Key.
"""

import sys
import os
import time
import traceback # For detailed error logging
from typing import Optional, Dict, Any

# Attempt to import google-genai library
try:
    from google import genai
    from google.genai import types
    from google.genai import safety_settings # Keep top-level import
    from google.genai import errors as google_genai_errors
    _GENAI_AVAILABLE = True
except ImportError as e:
    print(f"\n[ERROR] Failed to import 'google-genai' library or its dependencies.", file=sys.stderr)
    print(f"        Please ensure it's installed: pip install google-genai", file=sys.stderr)
    print(f"        Original error: {e}", file=sys.stderr)
    # Print traceback here too, as this is a critical failure point
    print(f"\n--- Import Traceback ---", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(f"--- End Import Traceback ---", file=sys.stderr)
    _GENAI_AVAILABLE = False

# Import dotenv to load environment variables like GOOGLE_API_KEY
try:
    from dotenv import load_dotenv
    _DOTENV_AVAILABLE = True
except ImportError:
    _DOTENV_AVAILABLE = False

try:
    # Assume running from top level where llm-americanize.py is
    if __package__ is None or __package__ == '':
        # Running as script or top-level module
        from colors import red, yellow, grey, cyan
    else:
        # Running as part of the 'lib' package
        from .colors import red, yellow, grey, cyan
except ImportError:
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()
    red = yellow = grey = cyan = colors.red

# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95
DEFAULT_TOP_K = 40

# Define safety settings mapping - moved inside __init__ where 'safety_settings' alias is guaranteed
# DEFAULT_SAFETY_SETTINGS = { ... }


class GeminiClient:
    """Wraps the google-genai client for Gemini API calls."""

    def __init__(self, debug: bool = False):
        """
        Initializes the GeminiClient using API Key authentication.

        Args:
            debug: Enable debug printing.

        Raises:
            ImportError: If 'google-genai' library is not installed.
            RuntimeError: If the GOOGLE_API_KEY environment variable is not set or client init fails.
        """
        if not _GENAI_AVAILABLE:
            # Error message and traceback printed during import failure
            raise ImportError("Required 'google-genai' library failed to import. Cannot proceed.")

        self.debug = debug
        self._client: Optional[genai.Client] = None
        self.safety_settings: Optional[Dict[Any, Any]] = None # Initialize safety settings field

        # Define safety settings mapping here, now that imports are confirmed successful
        # Using the 'safety_settings' alias directly from the import
        self.safety_settings = {
            safety_settings.HarmCategory.HARM_CATEGORY_HARASSMENT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            safety_settings.HarmCategory.HARM_CATEGORY_HATE_SPEECH: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            safety_settings.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            safety_settings.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
        if self.debug:
            print(grey(f"🔒 Default Safety Settings configured: {self.safety_settings}"), file=sys.stderr)

        # --- Environment Variable Loading ---
        if not _DOTENV_AVAILABLE:
             print(colors.yellow("⚠️ Warning: 'python-dotenv' not installed. Cannot automatically load '.env' file."), file=sys.stderr)
             print(colors.yellow("   Ensure GOOGLE_API_KEY is set in your environment."), file=sys.stderr)
        else:
            env_path = '.env'
            if os.path.exists(env_path):
                 if debug:
                    print(colors.grey(f"🔑 Loading environment variables from '{env_path}'..."), file=sys.stderr)
                 load_dotenv(dotenv_path=env_path, override=False)
            elif debug:
                 print(colors.grey(f"🔑 '.env' file not found, relying on existing environment variables."), file=sys.stderr)

        # --- API Key Check ---
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print(colors.red("\n❗ Critical Error: GOOGLE_API_KEY environment variable not set."), file=sys.stderr)
            print(colors.yellow("   Please set the GOOGLE_API_KEY environment variable."), file=sys.stderr)
            print(colors.yellow("   You can create one at https://aistudio.google.com/app/apikey"), file=sys.stderr)
            print(colors.yellow("   Set it directly or place it in a '.env' file: GOOGLE_API_KEY=AIzaSy..."), file=sys.stderr)
            raise RuntimeError("Missing GOOGLE_API_KEY environment variable.")

        # --- Client Initialization ---
        try:
            if self.debug:
                print(colors.grey("🔧 Initializing google-genai Client..."), file=sys.stderr)
                masked_key = api_key[:5] + "..." + api_key[-4:] if len(api_key) > 9 else api_key
                print(colors.grey(f"   (Using API Key starting with {masked_key})"), file=sys.stderr)

            # Initialize client - uses GOOGLE_API_KEY from env by default
            self._client = genai.Client()

            if self.debug:
                print(colors.grey("✅ google-genai Client initialized successfully."), file=sys.stderr)

        except Exception as e:
            print(colors.red(f"❗ Failed to initialize google-genai Client: {e}"), file=sys.stderr)
            print(colors.grey("\n--- Client Init Traceback ---"), file=sys.stderr)
            traceback.print_exc(file=sys.stderr) # Print traceback for init errors too
            print(colors.grey("--- End Client Init Traceback ---"), file=sys.stderr)
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
        (Args/Returns/Raises documentation unchanged from previous version)
        """
        if self._client is None:
             raise RuntimeError("GenAI client is not initialized.")

        # Ensure model name has the "models/" prefix required by google-genai
        if not model_name.startswith("models/"):
            model_path = f"models/{model_name}"
        else:
            model_path = model_name

        if self.debug:
            print(colors.grey("\n--- Preparing Call to Gemini API ---"), file=sys.stderr)
            print(colors.grey(f"Model: {model_path}"), file=sys.stderr)
            print(colors.grey(f"System Prompt Snippet:\n'''\n{system_prompt[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Input Text Snippet:\n'''\n{input_text[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Config: Temp={temperature}, MaxTokens={max_output_tokens}, TopP={top_p}, TopK={top_k}"), file=sys.stderr)
            print(colors.grey(f"Safety: {self.safety_settings}"), file=sys.stderr)
            print(colors.grey("------------------------------------"), file=sys.stderr)

        generation_config = types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
        )
        contents = [input_text]

        try:
            print(colors.cyan(f"✨ Calling Gemini ({model_path})... Thinking... 🤔"), file=sys.stderr)
            start_time = time.time()

            response = self._client.models.generate_content(
                model=model_path,
                contents=contents,
                generation_config=generation_config,
                safety_settings=self.safety_settings, # Use safety settings from init
                system_instruction=system_prompt if system_prompt.strip() else None
            )

            duration = time.time() - start_time
            if self.debug:
                print(colors.grey(f"✅ API Response received in {duration:.2f}s."), file=sys.stderr)

            try:
                result_text = response.text
                if self.debug:
                    # Check finish reason if available and debug is on
                    finish_reason_str = "N/A"
                    if response.candidates:
                         finish_reason = getattr(response.candidates[0], 'finish_reason', None)
                         if finish_reason:
                              finish_reason_str = finish_reason.name
                    print(colors.grey(f"✅ Extracted Text Length: {len(result_text)} chars. Finish Reason: {finish_reason_str}"), file=sys.stderr)
                    # Also print safety ratings if available
                    if response.prompt_feedback:
                         print(colors.grey(f"   Prompt Feedback: Block={response.prompt_feedback.block_reason}, Safety={response.prompt_feedback.safety_ratings}"), file=sys.stderr)
                    elif response.candidates and response.candidates[0].safety_ratings:
                         print(colors.grey(f"   Candidate Safety Ratings: {response.candidates[0].safety_ratings}"), file=sys.stderr)

                return result_text

            except ValueError as e:
                # Handle cases where response.text access fails (e.g., blocked response)
                print(colors.red(f"❗ Error accessing response text: {e}"), file=sys.stderr)
                block_reason_str = "Unknown"
                finish_reason_str = "Unknown"
                safety_ratings_str = "Unknown"
                try:
                    # Try extracting feedback info for better error message
                    if response.prompt_feedback:
                        block_reason_str = response.prompt_feedback.block_reason.name if response.prompt_feedback.block_reason else "None"
                        safety_ratings_str = str(response.prompt_feedback.safety_ratings) if response.prompt_feedback.safety_ratings else "N/A"
                        print(colors.yellow(f"   Prompt Feedback: Block={block_reason_str}, Safety={safety_ratings_str}"), file=sys.stderr)
                    elif response.candidates:
                         candidate = response.candidates[0]
                         finish_reason_str = candidate.finish_reason.name if candidate.finish_reason else "N/A"
                         safety_ratings_str = str(candidate.safety_ratings) if candidate.safety_ratings else "N/A"
                         print(colors.yellow(f"   Candidate Finish Reason: {finish_reason_str}, Safety: {safety_ratings_str}"), file=sys.stderr)
                except Exception as inner_e:
                     if self.debug: print(colors.grey(f"   Could not extract detailed feedback: {inner_e}"), file=sys.stderr)

                raise RuntimeError(f"Content generation failed or was blocked. Reason: {block_reason_str}/{finish_reason_str}. Safety: {safety_ratings_str}") from e

            except Exception as e:
                 print(colors.red(f"❗ Unexpected error processing response: {e}"), file=sys.stderr)
                 # Print traceback for unexpected response processing errors
                 print(colors.grey("\n--- Response Processing Traceback ---"), file=sys.stderr)
                 traceback.print_exc(file=sys.stderr)
                 print(colors.grey("--- End Response Processing Traceback ---"), file=sys.stderr)
                 raise RuntimeError("Unexpected error processing LLM response.") from e

        # --- Handle API Errors ---
        except (
            google_genai_errors.PermissionDenied,
            google_genai_errors.ResourceExhausted,
            google_genai_errors.InvalidArgument,
            google_genai_errors.NotFound,
            google_genai_errors.InternalServerError,
            google_genai_errors.APIError
        ) as e:
            error_type = type(e).__name__
            print(colors.red(f"\n❗ Gemini API Error ({error_type}): {e}"), file=sys.stderr)
            # Provide specific hints based on error type
            if isinstance(e, google_genai_errors.PermissionDenied):
                print(colors.yellow("   Suggestion: Check your GOOGLE_API_KEY validity and ensure it's enabled."))
            elif isinstance(e, google_genai_errors.ResourceExhausted):
                print(colors.yellow("   Suggestion: Check API quotas (e.g., requests per minute). Try again later."))
            elif isinstance(e, google_genai_errors.InvalidArgument):
                 print(colors.yellow(f"   Suggestion: Verify model name ('{model_path}') and generation parameters."))
            elif isinstance(e, google_genai_errors.NotFound):
                 print(colors.yellow(f"   Suggestion: Ensure model name ('{model_path}') is correct and available."))
            elif isinstance(e, google_genai_errors.InternalServerError):
                 print(colors.yellow(f"   Suggestion: Temporary Google API issue? Try again later."))

            # Print traceback for API errors if debugging
            if self.debug:
                 print(colors.grey("\n--- API Error Traceback ---"), file=sys.stderr)
                 traceback.print_exc(file=sys.stderr)
                 print(colors.grey("--- End API Error Traceback ---"), file=sys.stderr)
            raise RuntimeError(f"Gemini API Error ({error_type})") from e # Re-raise wrapped error

        except Exception as e:
             print(colors.red(f"\n❗ An unexpected error occurred during the Gemini API call: {type(e).__name__} - {e}"), file=sys.stderr)
             # Print traceback for truly unexpected errors during the call
             print(colors.grey("\n--- Unexpected API Call Traceback ---"), file=sys.stderr)
             traceback.print_exc(file=sys.stderr)
             print(colors.grey("--- End Unexpected API Call Traceback ---"), file=sys.stderr)
             raise RuntimeError("Unexpected GenAI Error") from e

EOF
echo "🧠 Created file: lib/genai.py (google-genai, fixed safety, tracebacks)"


# --- americanize.prompt ---
# (No changes from previous google-genai version)
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
echo "📝 Created file: americanize.prompt"


# --- llm-americanize.py (UPDATED - Input flags, Tracebacks, lib/clipboard usage) ---
cat << 'EOF' > llm-americanize.py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLM Email Prettifier/Americanizer 🇺🇸✨ (google-genai, system clipboard)

Reads email text from chosen source (file, stdin, clipboard), sends it to the
Gemini API for processing based on a prompt file, and outputs the result
to stdout and the system clipboard. Uses OS commands for clipboard access.
"""

import argparse
import sys
import os
import textwrap
import traceback # Import traceback for explicit error logging

# --- Add lib directory to Python path ---
LIB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib')
if LIB_DIR not in sys.path:
    sys.path.insert(0, LIB_DIR)

# --- Import custom libraries (with enhanced error reporting) ---
try:
    from lib import colors, io_utils, genai, clipboard # Add clipboard import
except ImportError as e:
    # Print detailed error message and traceback for import errors
    missing_module = "Unknown"
    try:
        missing_module = str(e).split("'")[-2]
    except IndexError:
        pass # Keep 'Unknown' if parsing fails
    print(f"\n{colors.red('--- CRITICAL ERROR: Failed to Import Libraries ---')}", file=sys.stderr)
    print(f"{colors.red('Error:')} Failed to import module '{missing_module}' or one of its dependencies.", file=sys.stderr)
    print(f"{colors.yellow('Possible Causes:')}", file=sys.stderr)
    print(f"{colors.yellow('-')} Required Python packages might be missing. Did you run '{colors.bold('pip install -r requirements.txt')}'?", file=sys.stderr)
    print(f"{colors.yellow('-')} The '{colors.bold('lib')}' directory or its contents ({colors.bold('colors.py, io_utils.py, genai.py, clipboard.py')}) might be missing or corrupted.", file=sys.stderr)
    print(f"{colors.yellow('-')} There might be an issue within the imported library itself (e.g., syntax error).", file=sys.stderr)
    print(f"\n{colors.grey('--- Traceback ---')}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr) # Print full traceback
    print(f"{colors.grey('--- End Traceback ---')}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    # Catch other unexpected errors during import phase
    print(f"\n{colors.red('--- CRITICAL ERROR: Unexpected Error During Library Import ---')}", file=sys.stderr)
    print(f"{colors.red('Error:')} {type(e).__name__} - {e}", file=sys.stderr)
    print(f"\n{colors.grey('--- Traceback ---')}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr) # Print full traceback
    print(f"{colors.grey('--- End Traceback ---')}", file=sys.stderr)
    sys.exit(1)

# --- Argument Parsing ---
def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments."""

    examples = textwrap.dedent(f"""
    Examples:
      # Read from file (ensure GOOGLE_API_KEY is set)
      {colors.yellow('./llm-americanize.py -f my_email.txt')}

      # Read from stdin
      {colors.yellow('cat my_email.txt | ./llm-americanize.py -s')}
      {colors.yellow('./llm-americanize.py --stdin < my_email.txt')}

      # Read from clipboard (uses OS commands like pbpaste/xclip)
      {colors.yellow('./llm-americanize.py -c')}

      # Use a different prompt file and model, read from clipboard
      {colors.yellow('./llm-americanize.py -c --prompt-file custom.prompt --model gemini-1.5-pro-001')}

      # Enable debug output, read from file
      {colors.yellow('./llm-americanize.py -f my_email.txt --debug')}
    """)

    parser = argparse.ArgumentParser(
        description=f"{colors.bold('LLM Email Americanizer')} - Reads from file/stdin/clipboard, asks Gemini to process, prints & copies.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=examples
    )

    # --- Input Source (Mutually Exclusive and Required) ---
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        "-f", "--input", "--file", # Added --file alias
        metavar="FILE",
        dest="input_file", # Store in 'input_file' to avoid conflict with builtin 'input'
        type=str,
        help="Path to the input email file."
    )
    input_group.add_argument(
        "-s", "--stdin",
        action="store_true",
        help="Read input explicitly from standard input (stdin)."
    )
    input_group.add_argument(
        "-c", "--clipboard",
        action="store_true",
        help="Read input from the system clipboard (uses OS commands like pbpaste/xclip)."
    )

    # --- LLM Configuration ---
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
        "--temperature", type=float, default=genai.DEFAULT_TEMPERATURE,
        help=f"LLM temperature (randomness). Default: {genai.DEFAULT_TEMPERATURE}"
    )
    param_group.add_argument(
        "--max-tokens", type=int, default=genai.DEFAULT_MAX_OUTPUT_TOKENS,
        help=f"LLM max output tokens. Default: {genai.DEFAULT_MAX_OUTPUT_TOKENS}"
    )
    param_group.add_argument(
        "--top-p", type=float, default=genai.DEFAULT_TOP_P,
        help=f"LLM top-p (nucleus sampling). Default: {genai.DEFAULT_TOP_P}"
    )
    param_group.add_argument(
        "--top-k", type=int, default=genai.DEFAULT_TOP_K,
        help=f"LLM top-k sampling. Default: {genai.DEFAULT_TOP_K}"
    )

    # --- Other Options ---
    other_group = parser.add_argument_group('Other Options')
    other_group.add_argument(
        "--debug", action="store_true",
        help="Enable verbose debug output, printed to stderr."
    )
    other_group.add_argument(
        "--no-clipboard-output", action="store_true",
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

    # Setup basic logging/debug printing
    def log_debug(message):
        if args.debug:
            print(colors.grey(f"[DEBUG] {message}"), file=sys.stderr)

    log_debug(f"Script started. Arguments: {vars(args)}")

    try:
        # 1. Read Input Text based on chosen flag
        input_text = ""
        if args.input_file:
            log_debug(f"Input source: File ({args.input_file})")
            input_text = io_utils.read_input(file_path=args.input_file)
        elif args.stdin:
            log_debug("Input source: Stdin")
            # Check if stdin is interactive - warn user if so.
            if sys.stdin.isatty() and not sys.stdin.closed:
                 print(colors.yellow("🤔 Reading from interactive terminal (stdin)... Type input and press Ctrl+D (Unix) or Ctrl+Z+Enter (Win)."), file=sys.stderr)
            input_text = io_utils.read_input(file_path=None) # Reads stdin
        elif args.clipboard:
            log_debug("Input source: Clipboard")
            input_text = clipboard.paste() # Use the new clipboard module

        # Validate input text
        if not input_text.strip():
             print(colors.yellow("🤔 Input text is empty or contains only whitespace. Nothing to process."), file=sys.stderr)
             sys.exit(0)
        log_debug(f"Read {len(input_text)} characters of input.")
        if args.debug and len(input_text) < 300:
             print(colors.grey(f"Input Preview:\n'''\n{input_text[:300]}\n'''"), file=sys.stderr)

        # 2. Read System Prompt File Content
        prompt_filepath = args.prompt_file
        log_debug(f"Reading system prompt file: '{prompt_filepath}'...")
        try:
            if not os.path.isfile(prompt_filepath):
                 raise FileNotFoundError(f"Prompt file not found: '{prompt_filepath}'")
            with open(prompt_filepath, 'r', encoding='utf-8') as f:
                system_prompt_text = f.read()
            if not system_prompt_text.strip():
                 print(colors.yellow(f"⚠️ Warning: Prompt file '{prompt_filepath}' is empty."), file=sys.stderr)
                 system_prompt_text = "" # Allow empty prompt
            log_debug("System prompt file read successfully.")
        except (FileNotFoundError, IOError) as e:
            print(colors.red(f"❗ Error reading prompt file: {e}"), file=sys.stderr)
            raise # Re-raise to be caught by main handler

        # 3. Initialize GenAI Client
        log_debug("Instantiating Gemini Client (API Key Auth)...")
        client = genai.GeminiClient(debug=args.debug)
        log_debug("Gemini Client instantiated.")

        # 4. Call Gemini API
        processed_text = client.process_text(
            system_prompt=system_prompt_text,
            input_text=input_text,
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

        # 6. Optionally Copy to Clipboard using new module
        if not args.no_clipboard_output:
            log_debug("Attempting to copy output to clipboard...")
            if clipboard.copy(processed_text):
                print(colors.cyan("\n📋✨ Result also copied to clipboard!"), file=sys.stderr)
            else:
                 # Error/warning message should have been printed by clipboard.copy
                 print(colors.yellow("\n📋❌ Could not copy result to clipboard (see details above)."), file=sys.stderr)
        else:
            log_debug("Skipped copying output to clipboard (--no-clipboard-output).")

    # --- Main Exception Handling (with Tracebacks) ---
    except (FileNotFoundError, ImportError, ValueError, RuntimeError, IOError) as e:
        # Handle known/expected errors from our code/libs
        print(colors.red(f"\n[ERROR] Execution failed: {type(e).__name__} - {e}"), file=sys.stderr)
        exit_code = 1
        # Always print traceback for these errors if debugging
        if args.debug:
            print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    except Exception as e:
        # Catch-all for truly unexpected errors
        print(colors.red(f"\n💥 [UNEXPECTED ERROR] An unhandled error occurred: {type(e).__name__} - {e}"), file=sys.stderr)
        exit_code = 1
        # Always print traceback for unexpected errors
        print(colors.grey("\n--- Traceback ---"), file=sys.stderr)
        traceback.print_exc(file=sys.stderr) # Explicitly print traceback
        print(colors.grey("--- End Traceback ---"), file=sys.stderr)

    finally:
        log_debug(f"Script finished with exit code: {exit_code}")
        sys.exit(exit_code)

if __name__ == "__main__":
    main()
EOF
echo "🐍 Created file: llm-americanize.py (updated flags, tracebacks, clipboard)"
chmod +x llm-americanize.py
echo "🔩 Made llm-americanize.py executable."

# --- requirements.txt (UPDATED) ---
cat << 'EOF' > requirements.txt
google-genai>=0.7.0
python-dotenv>=1.0.0
# pyperclip removed - using system commands via lib/clipboard.py now
EOF
echo "📄 Created file: requirements.txt (removed pyperclip)"

# --- Final Instructions (UPDATED) ---
echo ""
echo "✅ All files created successfully!"
echo "➡️ Next steps:"
echo "1. Install dependencies: pip install -r requirements.txt"
echo "   (Note: 'pyperclip' is no longer required)"
echo "2. If on Linux, ensure 'xclip' is installed: sudo apt install xclip OR sudo yum install xclip"
echo "3. Set your Gemini API Key:"
echo "   - Create a key at: https://aistudio.google.com/app/apikey"
echo "   - Set the environment variable 'GOOGLE_API_KEY' (e.g., in ~/.bashrc, ~/.zshrc, or a .env file)"
echo "     Example .env file: GOOGLE_API_KEY='AIzaSy...your...key...'"
echo "4. Edit the 'americanize.prompt' file if desired."
echo "5. Run the script, choosing ONE input method:"
echo "   ./llm-americanize.py --file your_email.txt"
echo "   ./llm-americanize.py --stdin < your_email.txt"
echo "   cat your_email.txt | ./llm-americanize.py --stdin"
echo "   ./llm-americanize.py --clipboard"
echo "   (Add other options like --model, --debug as needed)"
echo "🐛 If errors occur, the full traceback should now be printed to help debug!"
echo "🎉 Happy Americanizing! 🇺🇸"
