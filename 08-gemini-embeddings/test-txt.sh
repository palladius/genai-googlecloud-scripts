#!/bin/bash

PROJECT=ricc-genai

curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json; charset=utf-8" \
"https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict" \
 -d '{ "instances": [ { "text": "a cake"} ] }' > .tmp.text.json


