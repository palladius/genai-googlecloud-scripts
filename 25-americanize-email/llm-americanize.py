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
