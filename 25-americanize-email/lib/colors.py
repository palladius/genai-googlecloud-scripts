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

