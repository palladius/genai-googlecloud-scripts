#!/bin/bash

PROJECT=ricc-genai
IMAGE=../07-bash-gemini-multimodal-jam/images/cat.jpg
BASE64_ENCODED_IMG=$(base64 -w 0 "$IMAGE")

curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json; charset=utf-8" \
"https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict" \
 -d '{ "instances": [ { "image": { "bytesBase64Encoded": "'${BASE64_ENCODED_IMG}'" } } ] }' > .tmp.image.json


# curl -X POST \
#   -H "Authorization: Bearer $(gcloud auth print-access-token)" \
#   -H "Content-Type: application/json; charset=utf-8" \
# "https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict" \
#  -d '{ "instances": [ { "image": { "bytesBase64Encoded": "'${BASE64_ENCODED_IMG}'" } } ] }'
