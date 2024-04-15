#!/bin/bash

export PROJECT="ricc-genai"
export ACCOUNT='ricc@google.com'

curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token --account $ACCOUNT )" \
  -H "Content-Type: application/json; charset=utf-8" \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001:predict" \
  -d '{ "instances": [ { "text": "a cake"} ] }' \
    > .tmp.text.json


echo '💎 Error if such:'
cat .tmp.text.json | jq .error
echo 💎 Cardinality of Embeddings params:
cat .tmp.text.json | jq  '.predictions[0].textEmbedding | length'
