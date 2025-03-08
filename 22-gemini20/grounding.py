from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from google.genai import types
import time
import sys

VERSION = '1.1b'

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
    "What's the weather like today in Milan (IT), Zurich (CH) and Rio de Janeiro (BR)? Use Celsius and provide min, max, and [chance of] rain. Give results in tabular format. Plus add date of today in bold.",
    "When is the next total solar eclipse in the United States?",
    "What is the sum of the first 10 primes? Explain the reasoning",
    "What are the top 10 cities in Europe by population? Give me a ranked table (id, city, nation, urban population) and sort by population in descending order.",
]

def print_help():
    print(f"""Gemini Grounding Tool v{VERSION}

Usage:
    1. Run with no arguments to execute default queries:
       $ python grounding.py
       This will run some example queries, such as:
       - Weather in Milan and Zurich
       - Next US solar eclipse
       - Sum of first 10 primes

    2. Run with your own query:
       $ python grounding.py "your query here"
       Example:
       $ python grounding.py "What are the top 20 cities in Europe, ranked by city population?"
    """)
    sys.exit(0)

if len(sys.argv) > 1:
    if sys.argv[1] in ['-h', '--help']:
        print_help()
    # Use command line arguments as a single query
    queries = [' '.join(sys.argv[1:])]
else:
    print(f"{Fore.CYAN}No args passed, using default queries{Style.RESET_ALL}")
    queries = GROUNDED_QUERIES

for grounded_query in queries:
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

    n_tokens =  client.models.count_tokens(
        model=model_id,
        contents=grounded_query,
        # config=GenerateContentConfig(
        #     tools=[google_search_tool],
        #     response_modalities=["TEXT"],
        # )
    )


    for each in response.candidates[0].content.parts:
        #print("🦄> " + each.text)
        print("🦄 " + each.text)
        execution_time = round(time.time() - start_time, 1)
        # https://ai.google.dev/gemini-api/docs/pricing - rough idea for text: 0.10
        usd_cost = 0.10 * n_tokens.total_tokens / 1000000
        print(f"💰 INPUT n_tokens (ohne grounding): {Fore.GREEN}{n_tokens.total_tokens}{Style.RESET_ALL} ({usd_cost}$)")
        print(f"⏱️  {Fore.CYAN}Execution time:{Style.RESET_ALL} {Fore.WHITE}{execution_time}s{Style.RESET_ALL}")
        #print("Total time: TODO⏳")
# Example response:
# The next total solar eclipse visible in the contiguous United States will be on ...

# To get grounding metadata as web content.
#print(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)

# Write to response.html
# with open('response.html', 'w', encoding='utf-8') as f:
#     f.write(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
