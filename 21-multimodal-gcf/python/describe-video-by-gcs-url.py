import vertexai
import dotenv
import os

'''Code from here:

https://cloud.google.com/vertex-ai/generative-ai/docs/samples/generativeaionvertexai-gemini-single-turn-video
'''

dotenv.load_dotenv()

from vertexai.generative_models import GenerativeModel, Part

PROJECT_ID = os.getenv('PROJECT_ID', None)
print(os.environ.get('PROJECT_ID'))

if PROJECT_ID is None:
    raise "Missing ENV[PROJECT_ID]!"

vertexai.init(project=PROJECT_ID, location="us-central1")

vision_model = GenerativeModel("gemini-1.5-flash-002")

# Generate text
response = vision_model.generate_content(
    [
        Part.from_uri(
            "gs://cloud-samples-data/video/animals.mp4", mime_type="video/mp4"
        ),
        "What is in the video?",
    ]
)
print(response.text)
