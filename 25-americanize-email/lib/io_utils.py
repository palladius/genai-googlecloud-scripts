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

