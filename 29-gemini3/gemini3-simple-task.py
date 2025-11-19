
from google import genai
from google.genai import types

client = genai.Client(
    vertexai=True,
    project="ricc-demos-386214",
    location="global",
)

response = client.models.generate_content(
   model="gemini-3-pro-preview",
   contents="How does AI work?",
   config=types.GenerateContentConfig(
       thinking_config=types.ThinkingConfig(
           thinking_level=types.ThinkingLevel.LOW # For fast and low latency response
       )
   ),
)
import os

# Ensure output directory exists
os.makedirs("out", exist_ok=True)

print(response.text)

with open("out/simple-answer.md", "w") as f:
    f.write(response.text)
    print(f"\nOutput written to out/simple-answer.md")

