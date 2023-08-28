#!/bin/bash

######################################################################################
# This script uses Palm APIs from GCP to invoke the wealth of knowledge that powers Bard.
# Make sure to 'Toss a coin to the Palm API' (enable billing first)
# If you use `lolcat` please enabled it on the line its commented.
######################################################################################

DEBUG="${DEBUG:-true}"

function _fatal() {
    echo "[FATAL] $*" >&1
    exit 42
}

DEFAULT_MESSAGE="Please write me 3 random genai prompts"

if [ "$#" -gt 0 ]; then
    export MESSAGE="$*"
else
     export MESSAGE="$DEFAULT_MESSAGE"
fi

STRIPPED_MESSAGE=$(echo -en "$MESSAGE" | tr -d '"')
export PROJECT_ID="$(gcloud config get project)"
export API_ENDPOINT='us-central1-aiplatform.googleapis.com'
export MODEL_ID='text-bison@001'
export TOKEN="$(gcloud --project $PROJECT_ID auth print-access-token)"

set -euop pipefail

which gcloud >/dev/null ||
    _fatal "Sorry for this hacky auth you need to have a working gcloud config"


if [ 'true' = "$DEBUG" ]; then
    echo '==================================================================================='
    echo 'Lets make sure you have in ENV the right values: (export DEBUG=false to remove this):'
    echo "GCLOUD USER: $(gcloud config get account)"
    echo "PROJECT_ID: $PROJECT_ID"
    echo "STRIPPED_MESSAGE: $STRIPPED_MESSAGE"
    echo '==================================================================================='
fi


#set -x

curl -s \
    -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    "https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predict" -d \
    $'{
    "instances": [
        {
        "content": "'"$STRIPPED_MESSAGE"'"
        }
    ],
    "parameters": {
        "temperature": 0.5,
        "maxOutputTokens": 1000,
        "topP": 0.8,
        "topK": 40
    }
}' > .tmp.lastsong

OUTPUT=$(cat .tmp.lastsong | jq .predictions[0].content)

#echo "OUTPUT: '$OUTPUT'"
if [ "$OUTPUT" = '""' ]; then # empty answer
    echo "Sorry, some error here. Dig into the JSON file more: .tmp.lastsong" >&2
    cat .tmp.lastsong | jq >&2
else
    #echo Ok non trivial content..
    cat .tmp.lastsong | jq .predictions[0].content -r # | lolcat
fi
