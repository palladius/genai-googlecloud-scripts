from google import genai
from dotenv import load_dotenv
import os
import re # Import the regex module if you need more complex patterns later
from lib.colorz import *
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

models = client.models.list()
# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents=["How does AI work?"]
# )
#print(response.text)

# gemini-2.5-pro-preview-03-25

# name='models/aqa'
# display_name='Model that performs Attributed Question Answering.'
# description='Model trained to return answers to questions that are grounded in provided sources, along with estimating answerable probability.'
# version='001'
# endpoints=None
# labels=None
# tuned_model_info=TunedModelInfo(base_model=None, create_time=None, update_time=None)
# input_token_limit=7168
# output_token_limit=1024
# supported_actions=['generateAnswer']

def print_fancy(model):
    m = model
        #print(m.name, m.display_name)
    if "legacy" in m.description:
        return
    model_name_short = m.name.split('/')[-1]
    if "Alias" in m.description:
        model_name_short = cyan(model_name_short) # symlink
    else:
        if "table" in m.description: # stable
            model_name_short = green(model_name_short)
        else:
            model_name_short = yellow(model_name_short)
#    colored_labels = purple(", ".join(m.labels))
    if m.labels:
        colored_labels = "# " + purple(", ".join(m.labels))
    else:
        colored_labels = ""
    fancy_line = f" ♊️ {model_name_short}: {m.description} {colored_labels}"
    print(fancy_line)


print('👀 list models for Gemini (ignore legacy ones):')
for m in models:
    print_fancy(m)
