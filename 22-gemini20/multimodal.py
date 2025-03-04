import asyncio
from google import genai
from constants import *
import markdown
from bs4 import BeautifulSoup
from colorama import Fore, Style
import re

from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
model_id = "gemini-2.0-flash-exp"
config = {"response_modalities": ["TEXT"]}

async def main():
    async with client.aio.live.connect(model=model_id, config=config) as session:
        while True:
            message = input("👤> ")
            if message.lower() == "exit":
                break
            await session.send(input=message, end_of_turn=True)

            first_response = True
            async for response in session.receive():
                if response.text is None:
                    continue

                                # Convert markdown to HTML
                html = markdown.markdown(response.text)
                soup = BeautifulSoup(html, 'html.parser')

                # Process the text with proper formatting
                colored_text = response.text


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



                bold_pattern = re.compile(r'\*\*(.+?)\*\*')
                for match in bold_pattern.finditer(colored_text):
                    bold_text = match.group(1)
                    original = f"**{bold_text}**"
                    colored_text = colored_text.replace(original, f"{Fore.CYAN}{bold_text}{Style.RESET_ALL}")


                # for strong in soup.find_all('strong'):  # Find bold text
                #     orig_text = f"**{strong.text}**"
                #     colored_text = colored_text.replace(orig_text, f"{Fore.CYAN}{strong.text}{Style.RESET_ALL}")

                for em in soup.find_all('em'):  # Find italic text
                    orig_text = f"*{em.text}*"
                    # \x1B[3m enables italics in terminals that support it
                    colored_text = colored_text.replace(orig_text, f"{Style.BRIGHT}{Fore.WHITE}\x1B[3m{em.text}{Style.RESET_ALL}")

                prefix = "🤖 " if first_response else ""
                first_response = False
                print(prefix + colored_text, end="")

if __name__ == "__main__":
    asyncio.run(main())
