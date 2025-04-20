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
from google import genai
from google.genai import types

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
