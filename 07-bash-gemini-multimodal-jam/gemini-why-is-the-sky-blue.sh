#!/bin/bash

# first: gcloud auth login

PROJECT_ID='cloud-llm-preview1'
MODEL_ID="gemini-pro"
LOCATION=us-central1

set -euo pipefail

gcloud config set project $PROJECT_ID

echodo curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json"  \
    https://us-central1-autopush-aiplatform.sandbox.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent -d \
    $'{
      "contents": {
        "role": "USER",
        "parts": { "text": "Why is the sky blue?" }
      }
  }'
