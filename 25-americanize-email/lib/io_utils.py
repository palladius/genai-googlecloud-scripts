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

