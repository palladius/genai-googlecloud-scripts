from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()
from constants import *
from colorama import Fore, Style

IMAGE_PROMPT = 'Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.'

client = genai.Client(api_key=GEMINI_API_KEY)

print(f"Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{IMAGE_PROMPT}{Style.RESET_ALL}")

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt=IMAGE_PROMPT,
    config=types.GenerateImagesConfig(
        number_of_images= 4,
    )
)

#print(yellow(IMAGE_PROMPT))

for generated_image in response.generated_images:
  image = Image.open(BytesIO(generated_image.image.image_bytes))
  image.show()
