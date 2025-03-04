from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from google.genai import types
import time

# Carlessian
from dotenv import load_dotenv
load_dotenv()
from constants import *

client = genai.Client(api_key=GEMINI_API_KEY)


#client = genai.Client()
model_id = "gemini-2.0-flash"

google_search_tool = Tool(
    google_search = GoogleSearch()
)

GROUNDED_QUERIES = [
    "What's the weather like today in Milan and Zurich? Use Celsius and provide min, max, and [chance of] rain.",
    "When is the next total solar eclipse in the United States?",
    "What is the sum of the first 10 primes? Explain the reasoning"
]
for grounded_query in GROUNDED_QUERIES:

    print(f"Query to be 🕳️grounded🪨 : {Fore.YELLOW}{grounded_query}{Style.RESET_ALL}")
    start_time = time.time()


    response = client.models.generate_content(
        model=model_id,
        contents=grounded_query,
        config=GenerateContentConfig(
            tools=[google_search_tool],
            response_modalities=["TEXT"],
        )
    )

    for each in response.candidates[0].content.parts:
        print("🦄> " + each.text)
        execution_time = round(time.time() - start_time, 1)
        print(f"⏱️ Execution time: {Fore.CYAN}{execution_time}s{Style.RESET_ALL}\n")
        #print("Total time: TODO⏳")
# Example response:
# The next total solar eclipse visible in the contiguous United States will be on ...

# To get grounding metadata as web content.
#print(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)

# Write to response.html
# with open('response.html', 'w', encoding='utf-8') as f:
#     f.write(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
