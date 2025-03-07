#!/usr/bin/env python

import asyncio
from google import genai
from constants import *
import markdown
from bs4 import BeautifulSoup
from colorama import Fore, Style
import re
import sys
import argparse
from dotenv import load_dotenv

load_dotenv()

VERSION = '1.3'
APP_NAME = 'MultimodalAsyncChat'
APP_DESCRIPTION = 'A succulent MultimodalAsync Chat built elaborating on Gemini2 Public Docs, and some Markdown colorful/emoji magic.'
APP_HISTORY = '''
2025-03-07 v1.3  Added argparse support with --help and ---version
'''



#print(f"DEBUG: GEMINI_API_KEY={Fore.RED}{GEMINI_API_KEY}{Style.RESET_ALL} (needs to start with AIza)")

#sys.exit(42)
client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
model_id = "gemini-2.0-flash-exp"
config = {"response_modalities": ["TEXT"]}

def print_help():
    """Prints the help message."""
    prog_name = sys.argv[0]
    print(f"""{APP_NAME} v{VERSION}

{APP_DESCRIPTION}

Usage:
    {prog_name} [options]

Options:
    -h, --help      Show this help message and exit.
    -v, --version   Show the version number and exit.

    (no options)    Starts the interactive chat.
    (pipe mode)     Reads input from stdin, line by line.

Examples:
    {prog_name}
    echo "Hello" | {prog_name}
    {prog_name} -h
    {prog_name} --version
    """)
    sys.exit(0)

def print_version():
    """Prints the version number."""
    print(f"{APP_NAME} v{VERSION}")
    sys.exit(0)

async def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("-h", "--help", action="store_true", help="Show this help message and exit")
    parser.add_argument("-v", "--version", action="store_true", help="Show the version number and exit")
    args = parser.parse_args()

    if args.help:
        print_help()
    if args.version:
        print_version()

    print(f"Welcome to {Fore.YELLOW}{APP_NAME} v{VERSION}{Style.RESET_ALL}")
    print(f"Welcome to {Fore.WHITE}{APP_DESCRIPTION}{Style.RESET_ALL}")

    async with client.aio.live.connect(model=model_id, config=config) as session:

        while True:
            try:
                if sys.stdin.isatty():
                    # Interactive mode
                    message = input("👤> ")
                else:
                    # Pipe mode
                    message = sys.stdin.readline()
                    if not message:  # EOF reached
                        break
                message = message.strip()
                if not message or message.lower() == "exit":
                    break
                await session.send(input=message, end_of_turn=True)

                first_response = True
                async for response in session.receive():
                    if response.text is None:
                        continue
#                    print("🐞") # check for bugs

                                    # Convert markdown to HTML
                    html = markdown.markdown(response.text)
                    soup = BeautifulSoup(html, 'html.parser')

                    # Process the text with proper formatting
                    colored_text = response.text

                    # Handle bold text with multiple occurrences
                    bold_pattern = re.compile(r'\*\*(.+?)\*\*')
                    while "**" in colored_text:  # Continue as long as there are bold markers
                        match = bold_pattern.search(colored_text)
                        if not match:
                            break
                        bold_text = match.group(1)
                        start, end = match.span()
                        colored_text = (
                            colored_text[:start] +
                            f"{Fore.CYAN}{bold_text}{Style.RESET_ALL}" +
                            colored_text[end:]
                        )

                    # Google colors for bullet points with corresponding emojis
                    google_colors = [
                        (Fore.BLUE, "🔵"),   # Blue
                        (Fore.RED, "🔴"),    # Red
                        (Fore.YELLOW, "🟡"), # Yellow
                        (Fore.GREEN, "🟢"),  # Green
                    ]
                    bullet_count = 0

                    # Find all bullet points with any indentation
    #                bullet_pattern = re.compile(r'^(\s*)[*-]\s+(.+)$', re.MULTILINE)
                    bullet_pattern = re.compile(r'^(\s*)[*-](?:\s+|\.\s+)(.+)$', re.MULTILINE)
                    # Process all bullet points
                    for match in bullet_pattern.finditer(colored_text):
                        indent, content = match.groups()
                        color, emoji = google_colors[bullet_count % 4]
                        # Preserve the original separator (space or dot)
                        original = match.group(0)
                        replacement = f"{indent}{color}{emoji} {content}{Style.RESET_ALL}"
                        colored_text = colored_text.replace(original, replacement)
                        bullet_count += 1
                    # # Find all list items and replace bullets with Google-colored emojis
                    for li in soup.find_all('li'):
                        orig_text = f"- {li.text}"
                        color, emoji = google_colors[bullet_count % 4]
                        colored_text = colored_text.replace(orig_text, f"{color}{emoji} {li.text}{Style.RESET_ALL}")
                        bullet_count += 1

                    for em in soup.find_all('em'):  # Find italic text
                        orig_text = f"*{em.text}*"
                        # \x1B[3m enables italics in terminals that support it
                        colored_text = colored_text.replace(orig_text, f"{Style.BRIGHT}{Fore.WHITE}\x1B[3m{em.text}{Style.RESET_ALL}")

                    prefix = "🤖 " if first_response else ""
                    first_response = False
                    print(prefix + colored_text, end="")

            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
