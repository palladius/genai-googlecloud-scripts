import asyncio
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from constants import *
import markdown
from bs4 import BeautifulSoup
from colorama import Fore, Style
import re
import sys

VERSION = '0.9'
APP_NAME = 'MultimodalAsyncChatWithGroundingOnDerek'
APP_DESCRIPTION = 'An experimental MultimodalAsync Chat branched from asyncchat (multimodal.py) but with grounding.'

from dotenv import load_dotenv
load_dotenv()

google_search_tool = Tool(
    google_search = GoogleSearch()
)

print(f"Welcome to {Fore.YELLOW}{APP_NAME} v{VERSION}{Style.RESET_ALL}")
print(f"Welcome to {Fore.WHITE}{APP_DESCRIPTION}{Style.RESET_ALL}")
print(f"DEBUG: GEMINI_API_KEY={Fore.RED}{GEMINI_API_KEY}{Style.RESET_ALL} (needs to start with AIza)")
print("BNROKEN: TypeError: 'GenerateContentConfig' object is not subscriptable")
# broken TypeError: 'GenerateContentConfig' object is not subscriptable
grounding_config = GenerateContentConfig(
    tools=[google_search_tool],
    response_modalities=["TEXT"],
    )

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={'api_version': 'v1alpha'},
    #config=grounding_config,
    )
model_id = "gemini-2.0-flash-exp"
#config = {"response_modalities": ["TEXT"]}
grounding_config = GenerateContentConfig(
    tools=[google_search_tool],
    response_modalities=["TEXT"],
    )
#config = grounding_config

async def main():
    async with client.aio.live.connect(model=model_id, config=grounding_config) as session:

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

        # while True:
        #     message = input("👤> ")
        #     if message.lower() == "exit":
        #         break
        #     await session.send(input=message, end_of_turn=True)

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
