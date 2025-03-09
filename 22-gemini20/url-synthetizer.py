
'''
Given N URLs in CLI (or a --url-files <urls.txt> with a \n separated list of URLs),
write a python script which:
- downloads them and extracts text.
- asks GEmini to summarize the content and come up with a possible title.
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
from lib.colorz import *

VERSION = '1.1b'
MODEL_ID = "gemini-2.0-flash"

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


def download_and_extract_text(url: str) -> str:
    """Downloads a webpage and extracts its text content."""
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

        return text
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return ""

def summarize_with_gemini(text: str) -> tuple[str, str]:
    """Summarizes the given text and suggests a title using Gemini."""
    #model = genai.GenerativeModel('gemini-pro')
    #model = MODEL_ID
    prompt = f"""
    Please summarize the following text and suggest a suitable title for it.
    Provide the output in markdown format, with the title in a single line, starting with 'Title: '.
    Then, a line with the summary starting with 'Summary: '.
    Text:
    {text}
    """
    try:
        #response = model.generate_content(prompt)
        #response.resolve() # if it is blocked, you will get an error here

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=GenerateContentConfig(
#                tools=[google_search_tool],
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

def process_urls(urls: List[str]):
    """Processes a list of URLs, summarizing their content."""
    for url in urls:
        print(f"Processing {cyan(url)}...")
        text = download_and_extract_text(url)
        if text:
            title, summary = summarize_with_gemini(text)
            if title and summary:
                print(f"## {title}\n")
                print(f"URL: {url}\n")
                print(f"{summary}\n")
            else:
                print(f"Error: could not create title or summary for {url}")
        else:
            print(f"Skipping {url} due to download error.")

def get_urls_from_file(file_path: str) -> List[str]:
    """Reads URLs from a file, one URL per line."""
    try:
        with open(file_path, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        return urls
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}")
        return []

def main():
    """Main function to handle command-line arguments and process URLs."""
    parser = argparse.ArgumentParser(description="Summarize web pages using Gemini.")
    parser.add_argument('urls', metavar='URL', type=str, nargs='*',
                        help='URLs to summarize.')
    parser.add_argument('--url-file', dest='url_file',
                        help='File containing URLs to summarize (one per line).')

    args = parser.parse_args()

    if args.url_file:
        urls = get_urls_from_file(args.url_file)
    else:
        urls = args.urls

    if not urls:
        print("No URLs provided. Please provide URLs as command line arguments or using --url-file.")
        parser.print_help()
        return

    process_urls(urls)

if __name__ == "__main__":
    main()
