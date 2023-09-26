#!/bin/bash

######################################################################################
# This script uses Vertex AI Palm API from GCP to invoke Embeddings API.
# Make sure to 'Toss a coin to the Palm API' (enable billing first)
# If you use `lolcat` please enabled it on the line its commented.
#
# Better docs at https://cloud.google.com/vertex-ai/docs/generative-ai/embeddings/get-text-embeddings
######################################################################################

export PROJECT_ID="$(gcloud config get project)"
export MODEL_ID="textembedding-gecko"

export CONTENT="$@"

function get_message_from_argv() {
    DEFAULT_MESSAGE="What is life? Baby dont hurt me"

    if [ "$#" -gt 0 ]; then
        export MESSAGE="$*"
    else
        export MESSAGE="$DEFAULT_MESSAGE"
    fi

    STRIPPED_MESSAGE=$(echo -en "$MESSAGE" | tr -d '"')
    echo "$STRIPPED_MESSAGE"
}

#get_message_from_argv "$@"
stripped_message="$(get_message_from_argv "$@" )"

echo "stripped_message='$stripped_message'"
#exit 42

curl \
-X POST \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H "Content-Type: application/json" \
https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predict -d \
$'{
  "instances": [
    { "content": "'"$stripped_message"'"}
  ],
}'


# Results:
# {
#   "predictions": [
#     {
#       "embeddings": {
#         "values": [
#           0.010562753304839134,
#           0.049150310456752777,
# [..]
#           -0.036477591842412949,
#           -0.05006510391831398
#         ],
#         "statistics": {
#           "token_count": 4,
#           "truncated": false
#         }
#       }
#     }
#   ],
#   "metadata": {
#     "billableCharacterCount": 11
#   }
# }
