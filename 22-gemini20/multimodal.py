import asyncio
from google import genai
from constants import *
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
                #prefix = "🤖 " if "\n" in response.text else ""
                prefix = "🤖> " if first_response else ""

                first_response = False
                print(prefix + response.text, end="")

if __name__ == "__main__":
    asyncio.run(main())
