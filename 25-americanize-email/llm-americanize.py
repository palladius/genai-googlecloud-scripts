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
import lib.colors as colors

import dotenv
from dotenv import load_dotenv

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
            colored_text = colors.grey(input_text)
            print(f"<Clipboard input>{colored_text}</Clipboard input>")

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
