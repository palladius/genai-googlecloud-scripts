#!/bin/bash

# images: https://www.youtube.com/watch?v=Rn30RMhEBTs&list=PL590L5WQmH8cTsUpRXyFWzIpc4ch1VksX

set -euo pipefail

source _common.sh

#PROJECT_ID='cloud-llm-preview1'
PROJECT_ID='ricc-genai'
MODEL_ID="gemini-pro-vision"
LOCATION=us-central1
TMP_OUTPUT_FILE=.tmp.lastsaga3
REQUEST_FILE=.tmp.request-generic-2pix.json
JQ_PATH=".candidates[0].content.parts[0].text"

#data=$(base64 -i "$IMAGE" -o -) # Mac
#data=$(base64 -w 0 "$IMAGE") # linux
function _base64_mac_or_linux() {
    IMAGE="$1"
    if [[ $(uname) == "Darwin" ]] ; then
        base64 -i "$IMAGE" -o -
    else
        base64 -w 0 "$IMAGE"
    fi
}

function _usage() {
    echo "Usage: $0 <IMAGE> <question on that image>"
    echo "Example: $0 image.jpg \"what do you see here?\""
    echo "Error: $1"
    exit 1
}

function show_errors_and_exit() {
    echo Woops. Some Errors found. See error in t:
    cat t | _redden
    exit 42
}

if [ $# -lt 2 ] ; then
    _usage "Provide at least 2 arguments (TODO just 1)"

fi

export IMAGE1="$1"
export IMAGE2="$2"

data1=$(_base64_mac_or_linux "$IMAGE1") # Mac or Linux should both work!
data2=$(_base64_mac_or_linux "$IMAGE2") # Mac or Linux should both work!
#shift
#export QUESTION="$@" # should default to "what do you see here?"
export QUESTION="Can you highlight similarity and differences between the two? Also, do you recognize the same person in both of them?"

echo "♊️ Question: $(_yellow "$QUESTION")"
echo " 👀 Examining image1 $IMAGE1: $(_white $(file "$IMAGE1")). "
echo " 👀 Examining image2 $IMAGE2: $(_white $(file "$IMAGE2")). "
#echo "Find any errors in: $TMP_OUTPUT_FILE"

cat > "$REQUEST_FILE" <<EOF
{'contents': {
      'role': 'USER',
      'parts': [
        {'text': '$QUESTION'},
        {'inline_data': {
            'data': '$data1',
            'mime_type':'image/jpeg'}
        },
        {'inline_data': {
            'data': '$data2',
            'mime_type':'image/jpeg'}
        }
        ]}
}
EOF

curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json"  \
    https://us-central1-autopush-aiplatform.sandbox.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-pro-vision:generateContent -d \
    @"$REQUEST_FILE" \
    > $TMP_OUTPUT_FILE 2>t ||
        show_errors_and_exit

#echo "Written $TMP_OUTPUT_FILE. curl_ret=$?"

OUTPUT=$(cat $TMP_OUTPUT_FILE | jq $JQ_PATH)

if [ "$OUTPUT" = '""' ]; then # empty answer
    echo "‼️ Sorry, some error here. Dig into the JSON file more: $TMP_OUTPUT_FILE" >&2
    cat $TMP_OUTPUT_FILE | jq >&2
else
    echo '♊️ Describing attached image:'
    cat $TMP_OUTPUT_FILE | jq "$JQ_PATH" -r | _lolcat
fi
