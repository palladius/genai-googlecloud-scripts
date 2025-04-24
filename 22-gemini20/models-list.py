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

def fancy_in_out(num):
    if num == 1024:
        return '1k'
    if num == 2048:
        return '2k'
    if num == 814096:
        return '4k'
    if num == 8192:
        return '8k'
    if num == 12288:
        return '12k'
    if num == 32768:
        return '32k'
    if num == 65536:
        return '64k'
    if num == 131072:
        return '128k'

    if num == 1000000:
        return '1Mi'
    if num == 1048576:
        return '1M'
    if num == 2000000:
        return '2Mi'
    return num

def print_fancy(model, debug=False):
    m = model
        #print(m.name, m.display_name)
    description = (m.description or '[Riccardo] no description provided by API')
    if "legacy" in description:
        return
    model_name_short = m.name.split('/')[-1]
    in_out = f"{fancy_in_out(m.input_token_limit)} > {fancy_in_out(m.output_token_limit)}"
    if debug:
        print(model)
    if "Alias" in description:
        model_name_short = cyan(model_name_short) # cyan for symlink
    else:
        if "table" in description:
            model_name_short = green(model_name_short)  # stable is green
        else:
            model_name_short = yellow(model_name_short) # yellow is everything else
    if m.labels:
        colored_labels = " # " + purple(", ".join(m.labels))
    else:
        colored_labels = '' # Seems like everyone has NO LABELS!!
    if m.supported_actions:
        colored_supported_actions = ' 🔣 ' + blue(", ".join(m.supported_actions))
    else:
        colored_supported_actions = ''
    #description =
    fancy_line = f" ♊️ {model_name_short}: {description}{colored_labels}{colored_supported_actions} 🔁 {red(in_out)}"
    print(fancy_line)


print('👀 list models for Gemini (ignore legacy ones):')
for m in models:
    print_fancy(m)
