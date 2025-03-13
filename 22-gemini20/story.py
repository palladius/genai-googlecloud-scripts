'''
a dream until this morning! https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation/

'''

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import datetime

# Riccardo stuff

from constants import *
from lib.filez import * # create_filename_from_prompt
from colorama import Fore, Style
from dotenv import load_dotenv
from lib.filez import write_to_file
load_dotenv()

APP_VERSION = '1.0'
APP_NAME = 'Text&Image Story Generation Tool'

STORY_PROMPT = "Generate a story about a cute baby turtle in a 3d digital art style. For each scene, generate an image."
FOLDER_BASE="out/"
#FOLDER_NAME="YYYMMDD-HHMM-turtle-story" # TODO change
FOLDER_NAME=datetime.date.today().strftime("%Y%m%d") + "-" + datetime.datetime.now().strftime("%H%M") +"-turtle-story"
print(f"Folder will be: {Fore.BLUE}{FOLDER_NAME}{Style.RESET_ALL}")

FINAL_FOLDER = FOLDER_BASE + FOLDER_NAME + '/'
os.mkdir(FINAL_FOLDER )

client = genai.Client(api_key=GEMINI_API_KEY)

response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=(STORY_PROMPT
    ),
    config=types.GenerateContentConfig(
        response_modalities=["Text", "Image"]
    ),
)

# def create_and_generate_image(also_show_image=True):
#         #also_show_image = True
#         image = Image.open(BytesIO(generated_image.image.image_bytes))
#         if also_show_image:
#             image.show()
#         filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=out_folder)
#         print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
#         image.save(f"{FINAL_FOLDER}/{filename}")

#print(response)

#write_to_file(file_name='20250311-blah-content.json', content=response.to_json())
write_to_file(file_name=FINAL_FOLDER + '20250311-blah-content.json', content=response)

candidate = response.candidates[0]
#response.candidates[0].__class__()
#Candidate(content=None, citation_metadata=None, finish_message=None, token_count=None, avg_logprobs=None, finish_reason=None, grounding_metadata=None, index=None, logprobs_result=None, safety_ratings=None)

# >>> candidate.content.__class__
# <class 'google.genai.types.Content'>
# >>> candidate.content.__class__()
# Content(parts=None, role=None)

image_prompt = STORY_PROMPT
image_counter = 0
for candidate in  response.candidates:
    # print candidate
    print("candidate")
    for part in candidate.content.parts:
        print("part")
        # some have text
        print(part.text)
        # some have image
        #part.inline_data.__class__
        #<class 'google.genai.types.Blob'>
        if part.inline_data:
            # print blob in YELLOW
            print(f"MimeType: {Fore.YELLOW}{ part.inline_data.mime_type }{Style.RESET_ALL}")
            #my_json = part.inline_data.json()
            #my_json = part.inline_data.model_dump_json()
            #part.inline_data.dict().keys()
            # dict_keys(['data', 'mime_type'])
            # TODO build image with part.inline_data.data()
            #image = Image.open(BytesIO(part.inline_data.image_bytes))
                        # Correctly use `part.inline_data.data` for image bytes
            if part.inline_data.mime_type == "image/png":
                #part.inline_data.__class__
                # <class 'google.genai.types.Blob'>
                image_bytes = part.inline_data.data
                image = Image.open(BytesIO(image_bytes))
                image.show()
                filename = midjourneyish_filename_from_prompt(image_prompt, id=image_counter, out_folder=FINAL_FOLDER)
                print(f"💾 Saving image to: {Fore.MAGENTA}{filename}{Style.RESET_ALL}")
#                image.save(f"{FINAL_FOLDER}/{filename}")
                image.save(f"{filename}")
                image_counter += 1

            else:
                print(f"{Fore.RED}Wrong mime: not image!{Style.RESET_ALL} ")







#candidate.content.parts[0]
