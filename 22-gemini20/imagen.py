import sys
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()
from constants import *
from colorama import Fore, Style

#IMAGE_PROMPT = 'Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue.'

def print_help():
    print(f"""
Image Generation Tool

Usage:
    python image-generation.py [--help] <image_prompt>

    <image_prompt>: The description of the image you want to generate.

Options:
    --help: Display this help message.

Examples:
    python image-generation.py "Fuzzy bunnies in my kitchen, eating a carrot and dipping their paws onto a fondue."
    python image-generation.py --help
    python image-generation.py "A futuristic cityscape at sunset"
    """)
    sys.exit(0)

def main():
    if len(sys.argv) < 2 or "--help" in sys.argv:
        print_help()

    image_prompt = ' '.join(sys.argv[1:])

    client = genai.Client(api_key=GEMINI_API_KEY)

    print(f"Creating 4 images with this prompt (please be patient): {Fore.YELLOW}{image_prompt}{Style.RESET_ALL}")

    response = client.models.generate_images(
        model='imagen-3.0-generate-002',
#        model='imagen-3.0-generate',
        prompt=image_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=4,
        )
    )

    for generated_image in response.generated_images:
        image = Image.open(BytesIO(generated_image.image.image_bytes))
        image.show()

if __name__ == "__main__":
    main()
