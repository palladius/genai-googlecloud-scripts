#!/bin/bash

# gcloud config configurations activate ricc-genai

# A puffin is doing an ironman, just out of the water from swimming and starting to cycling right now.
# A very cinematic low angle highlights the beautiful swiss montins behind the lake on a puddle.

set -euo pipefail

# Set environment variables
PROJECT_ID="veo-testing"  # Replace with your Google Cloud project ID
ACCOUNT=ricc@google.com

yellow TODO/MAYBE: gcloud auth login "$ACCOUNT"
echodo gcloud config set project "$PROJECT_ID"
#echodo gsutil ls

ACCESS_TOKEN=$(gcloud auth print-access-token)
#OUTPUT_BUCKET=gs://palladius/veo/cat-riding-unicorn/
#OUTPUT_BUCKET=gs://palladius/veo/cat-riding-unicorn/
OUTPUT_BUCKET=gs://ad-veo-testing/test-rc-bash/cat-riding-unicorn/

# Define the API endpoint
ENDPOINT="https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/veo-001-preview-0815:predictLongRunning"

# Define the JSON payload.
# Be sure to replace the example values with your actual data.
JSON_PAYLOAD=$(cat <<EOF
{
  "instances": [
    {
      "prompt": "a cat riding a unicorn through a field of flowers"
    }
  ],
  "parameters": {
    "aspectRatio": "16:9",
    "framerate": "24",
    "negativePrompt": "blurry, distorted",
    "personGeneration": "DISABLED",
    "sampleCount": 1,
    "seed": 12345,
    "storageUri": "gs://your-bucket/path/to/output/"
  }
}
EOF
)

# Send the POST request
curl -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${JSON_PAYLOAD}" \
  "${ENDPOINT}"

green "RET=$?"
