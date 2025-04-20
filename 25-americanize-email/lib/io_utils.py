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

