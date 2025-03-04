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
                # Convert markdown bold to cyan color
                colored_text = response.text
                while "**" in colored_text:
                    start = colored_text.find("**")
                    end = colored_text.find("**", start + 2)
                    if end == -1:
                        break
                    bold_text = colored_text[start+2:end]
                    colored_text = colored_text[:start] + f"{Fore.CYAN}{bold_text}{Style.RESET_ALL}" + colored_text[end+2:]

                prefix = "🤖 " if first_response else ""
                first_response = False
                print(prefix + colored_text, end="")

if __name__ == "__main__":
    asyncio.run(main())
