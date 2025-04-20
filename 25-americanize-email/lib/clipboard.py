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

