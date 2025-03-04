import asyncio
from google import genai
from constants import *
import markdown
from bs4 import BeautifulSoup
from colorama import Fore, Style

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
                for strong in soup.find_all('strong'):  # Find bold text
                    orig_text = f"**{strong.text}**"
                    colored_text = colored_text.replace(orig_text, f"{Fore.CYAN}{strong.text}{Style.RESET_ALL}")

                for em in soup.find_all('em'):  # Find italic text
                    orig_text = f"*{em.text}*"
                    # \x1B[3m enables italics in terminals that support it
                    colored_text = colored_text.replace(orig_text, f"{Style.BRIGHT}{Fore.WHITE}\x1B[3m{em.text}{Style.RESET_ALL}")

                prefix = "🤖 " if first_response else ""
                first_response = False
                print(prefix + colored_text, end="")

if __name__ == "__main__":
    asyncio.run(main())
