import vertexai

from vertexai.generative_models import GenerativeModel, Part

# TODO(developer): Update and un-comment below line
# PROJECT_ID = "your-project-id"
vertexai.init(project=PROJECT_ID, location="us-central1")

model = GenerativeModel("gemini-1.5-flash-002")

image_file = Part.from_uri(
    "gs://cloud-samples-data/generative-ai/image/scones.jpg", "image/jpeg"
)

# Query the model
response = model.generate_content([image_file, "what is this image?"])
print(response.text)
# Example response:
# That's a lovely overhead flatlay photograph of blueberry scones.
# The image features:
# * **Several blueberry scones:** These are the main focus,
# arranged on parchment paper with some blueberry juice stains.
# ...
