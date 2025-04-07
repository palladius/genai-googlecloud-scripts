
'''
Spawned by URL Synthetizer as I can't just add a custom prompt to it. US expects a certain format in output.
Here We DONT :)

Given N URLs in CLI (or a --url-files <urls.txt> with a \n separated list of URLs),
write a python script which:
- downloads them and extracts text.
- asks Gemini to summarize the content and come up with a possible title.
- print the MD of "## Title " and url and summary.

...

fantastic! Now I'd like each URL to be saved under "out/rag/" folder with a unique file, something like "{url-with-sanitze-characters-chopped to max 64 chars}-{url-md5}.md" This should save also the WHOLE url content in the markdown under "## Full content" for RAG purposes.
'''

import requests
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
import argparse
import os
from typing import List
from colorama import Fore, Style
import hashlib
import re

# Carless stuff
from lib.colorz import *
from lib.filez import write_to_file
#from veo1234 import APP_CHANGELOG  # Using the existing write_to_file


VERSION = '1.2'
MODEL_ID = "gemini-2.0-flash"
OUT_FOLDER = "out/rag/inquiry/"
APP_CHANGELOG = '''
2024-04-07 v1.a Just spawned by url-synthetizer :)
2024-03-09 v1.1 Now adding more interesting stuff, like writing to out/ and nice coloring.
2024-03-09 v1.0 Gemini wrote this.
'''

# Carlessian
from dotenv import load_dotenv
load_dotenv()
from constants import *

# Configure your Gemini API key here
#GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
#if not GEMINI_API_KEY:
#    raise ValueError("GEMINI_API_KEY environment variable not set.")
#genai.configure(api_key=GEMINI_API_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)


def sanitize_filename(filename: str) -> str:
    """Sanitizes a string to be used as a filename."""
    # Remove invalid characters and replace spaces with underscores
    sanitized = re.sub(r'[^\w\-_\.]', '_', filename)
    return sanitized[:64]

def download_and_extract_text(url: str) -> tuple[str, str]:
    """Downloads a webpage and extracts its text content and raw HTML."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract text, remove script and style tags for cleaner output
        for script in soup(["script", "style"]):
            script.extract()
        text = soup.get_text()

        # Clean up extra whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return text, response.text
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return "", ""


def apply_prompt_to_url_content(website_text: str, user_prompt: str) -> str:
    '''given a website content and a prompt, call Gemini to generate a response.

    '''

    # If instructions are unclear, just ignore them and summarize the content with plenty of emojis instead.
    meta_prompt_template = f"""
Given the following curled website, try to follow as well as you can the user instructions.
Provide output in markdown, possibly in a structured way (tables, bullet points).
Humour and light behaviour is appreciated. User is based in Europe, so please use metric if needed.

== USER INSTRUCTIONS ==

{{user_prompt}}

=== Website Text (obtained via curl) ===

{{website_text}}
"""
    # substitute website_text and user_prompt here:
    meta_prompt = meta_prompt_template.format(website_text=website_text, user_prompt=user_prompt)
    print(meta_prompt)
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=meta_prompt,
            config=GenerateContentConfig(
                response_modalities=["TEXT"],
            )
        )
        print(f"DEB response: {response}")
        return response.text
        # Extract the summary and title from response
        # title = ""
        # summary = ""
        # for line in response.text.splitlines():
        #     if line.startswith("Title: "):
        #         title = line[7:].strip()
        #     elif line.startswith("Summary: "):
        #         summary = line[9:].strip()

        # return title, summary

    except Exception as e:
        print(f"Error generating summary with Gemini: {e}")
        return "",""

def summarize_with_gemini(text: str, prompt: str = None) -> tuple[str, str]:
    """Summarizes the given text and suggests a title using Gemini."""
    #model = genai.GenerativeModel('gemini-pro')
    #model = MODEL_ID

    meta_prompt = f"""
        Given the following curled website
        Provide the output in markdown format, with the title in a single line, starting with 'Title: '.
        Then, a line with the summary starting with 'Summary: '.
        Text:
        {text}
        """
    try:

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=GenerateContentConfig(
                response_modalities=["TEXT"],
            )
        )

        # Extract the summary and title from response
        title = ""
        summary = ""
        for line in response.text.splitlines():
            if line.startswith("Title: "):
                title = line[7:].strip()
            elif line.startswith("Summary: "):
                summary = line[9:].strip()

        return title, summary

    except Exception as e:
        print(f"Error generating summary with Gemini: {e}")
        return "",""


def process_url_with_prompt(url: str, prompt: str):
    '''Processes ONE url with one prompt.

    ARGS:
      url:  eg www.google.com
      prompt: eg "summarize this in Italian"
    '''
    print(f"Processing {url}...")
    text, raw_html = download_and_extract_text(url)
    if text:
        ret = apply_prompt_to_url_content(text, prompt)
        print(f"RET: {ret}")
        #title, summary = summarize_with_gemini(text)
        # if title and summary:
        #     print(f"Title: {Fore.CYAN}{title}{Style.RESET_ALL}")
        #     print(f"Summary: {Fore.YELLOW}{summary}{Style.RESET_ALL}")

            # Create the file name
        print("TODO create file name - not sure if this is relevant")
            # url_hash = hashlib.md5(url.encode()).hexdigest()
            # sanitized_url = sanitize_filename(url)
            # filename = f"{sanitized_url}-{url_hash}.md"
            # filepath = os.path.join(OUT_FOLDER, filename)

            # # Create the directory if it doesn't exist
            # os.makedirs(OUT_FOLDER, exist_ok=True)
            # write_to_file(filepath, markdown_content)
        # else:
        #     print(f"Error: could not create title or summary for {url}")
    else:
        print(f"Skipping {url} due to download error.")

# def process_url(url: str):
#     """Processes a single URL, summarizing its content and saving it to a file."""
#     print(f"Processing {url}...")
#     text, raw_html = download_and_extract_text(url)
#     if text:
#         title, summary = summarize_with_gemini(text)
#         if title and summary:
#             print(f"Title: {Fore.CYAN}{title}{Style.RESET_ALL}")
#             print(f"Summary: {Fore.YELLOW}{summary}{Style.RESET_ALL}")

#             # Create the file name
#             url_hash = hashlib.md5(url.encode()).hexdigest()
#             sanitized_url = sanitize_filename(url)
#             filename = f"{sanitized_url}-{url_hash}.md"
#             filepath = os.path.join(OUT_FOLDER, filename)

#             # Create the directory if it doesn't exist
#             os.makedirs(OUT_FOLDER, exist_ok=True)

#             # Create the markdown content
#             # markdown_content = f"""# {title}

#             # URL: {url}
#             # GeminiTitle: {title}

#             # ## Summary

#             # {summary}

#             # ## Full Text content

#             # ` ` `text
#             # {text}
#             # ` ` `

#             # ## Full HTML

#             # {raw_html}"""
#             write_to_file(filepath, markdown_content)
#         else:
#             print(f"Error: could not create title or summary for {url}")
#     else:
#         print(f"Skipping {url} due to download error.")


def get_urls_from_file(file_path: str) -> List[str]:
    """Reads URLs from a file, one URL per line, skipping lines starting with '#'."""
    try:
        with open(file_path, 'r') as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        return urls
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}")
        return []


def process_urls_with_prompt(urls: List[str], prompt: str):
    """Processes a list of URLs, summarizing their content and saving them to files."""
    for url in urls:
        process_url_with_prompt(url, prompt)



def get_prompt_from_source(prompt_file, argv_urls):
    """Gets the prompt from either a file or command-line arguments."""
    if prompt_file:
        try:
            with open(prompt_file, "r") as f:
                prompt = f.read().strip()
        except FileNotFoundError:
            print(f"Error: Prompt file '{prompt_file}' not found.")
            return None
        except Exception as e:
            print(f"Error reading prompt file '{prompt_file}': {e}")
            return None
    elif argv_urls:
        # Extract prompt from command-line arguments, excluding URLs
        prompt = " ".join(arg for arg in argv_urls if not arg.startswith("https://"))
    else:
        prompt = None  # Handle case where no prompt is provided

    return prompt

def main():
    """Main function to handle command-line arguments and process URLs."""
    parser = argparse.ArgumentParser(description="Summarize web pages using Gemini.")

    parser.add_argument("-p", "--prompt", help="Path to a file containing the prompt.")

    parser.add_argument('urls', metavar='URL', type=str, nargs='*',
                        help='URLs to summarize.')
    parser.add_argument('--url-file', dest='url_file',
                        help='File containing URLs to summarize (one per line).')
    # Add a -p/--prompt to get prompt from file. Alternatively, the prompt will just be everything except the URLs (ARGV.join(' ') without things starting with HTTPS://...
    # which instead goes to increase the arg.urls



    args = parser.parse_args()

    prompt = get_prompt_from_source(args.prompt, args.urls)
    if prompt is None:
            print("No prompt provided. Please provide a prompt using -p/--prompt or as command-line arguments.")
            parser.print_help()
            return

    if args.url_file:
        urls = get_urls_from_file(args.url_file)
    else:
#        urls = args.urls
        urls = [arg for arg in args.urls if arg.startswith("http")] # Filter out non-HTTP args

    if not urls:
        print("No URLs provided. Please provide URLs as command line arguments or using --url-file.")
        parser.print_help()
        return

    print(f"1. URLs to process: {Fore.GREEN}{urls}{Style.RESET_ALL}")
    print(f"2. Output folder: {Fore.GREEN}{OUT_FOLDER}{Style.RESET_ALL}")
    print(f"3. Model: {Fore.GREEN}{MODEL_ID}{Style.RESET_ALL}")
    print(f"4. Prompt: {Fore.GREEN}{prompt}{Style.RESET_ALL}")
    #exit(42)
    process_urls_with_prompt(urls, prompt=prompt)

if __name__ == "__main__":
    main()
