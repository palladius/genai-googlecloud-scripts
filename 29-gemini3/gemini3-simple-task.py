
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
print(response.text)

