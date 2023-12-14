#!/bin/bash

# Usage: $0 <IMAGE> <question on that image>
# Give it an image in input and ask a question after it :)
#

set -euo pipefail

#PROJECT_ID='cloud-llm-preview1'
PROJECT_ID='ricc-genai'
MODEL_ID="gemini-pro-vision"
LOCATION=us-central1
TMP_OUTPUT_FILE=.tmp.lastresponse-generic.json
REQUEST_FILE=.tmp.lastrequest-generic.json
JQ_PATH=".candidates[0].content.parts[0].text"
GENERATE_MP3="${GENERATE_MP3:-unknown}"
TEMPERATURE="${TEMPERATURE:-0.2}"
# common functions
source _common.sh

function _usage() {
    echo "Usage: $0 <IMAGE> <question on that image>"
    echo "Example: $0 image.jpg \"what do you see here?\""
    echo "Error: $1"
    exit 1
}



if [ $# -lt 2 ] ; then
    _usage "Provide at least 2 arguments (TODO just 1)"

fi

export IMAGE="$1"
data=$(_base64_encode_mac_or_linux "$IMAGE") # Mac or Linux should both work!
shift
export ORIGINAL_QUESTION="$@" # should default to "what do you see here?"
export QUESTION="$(echo "$@" | sed "s/'/ /g")" # cleaned up

echo "# 🤌  QUESTION: $(yellow $QUESTION)"
echo "# 🌡️ TEMPERATURE: $TEMPERATURE "
echo "# 👀 Examining image $(white $(file "$IMAGE")). "


#echo "💾 Find any errors in: $TMP_OUTPUT_FILE"

    #  "generation_config":{
    #     "temperature": $TEMPERATURE,
    #     "top_p": 0.1,
    #     "top_k": 16,
    #     "max_output_tokens": 2048,
    #     "candidate_count": 1,
    #     "stop_sequences": [],
    #     },

cat > "$REQUEST_FILE" <<EOF
{'contents': {
      'role': 'USER',
      'parts': [
        {'text': '$QUESTION'},
        {'inline_data': {
            'data': '$data',
            'mime_type':'image/jpeg'}}]
    }

}
EOF

curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json"  \
    https://us-central1-autopush-aiplatform.sandbox.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-pro-vision:generateContent -d \
    @"$REQUEST_FILE" \
    > $TMP_OUTPUT_FILE 2>t ||
        show_errors_and_exit

OUTPUT=$(cat $TMP_OUTPUT_FILE | jq $JQ_PATH)

if [ "$OUTPUT" = '""' -o "$OUTPUT" = 'null' ]; then # empty answer
    echo "#😥 Sorry, some error here. Dig into the JSON file more: $TMP_OUTPUT_FILE" >&2
    cat $TMP_OUTPUT_FILE | jq >&2
else
    echo -e '# ♊ Gemini no Saga answer for you:'
    cat $TMP_OUTPUT_FILE | jq "$JQ_PATH" -r | lolcat
    if [ "true" = "$GENERATE_MP3" ]; then
        ./tts.sh `cat $TMP_OUTPUT_FILE | jq "$JQ_PATH" -r`
        cp t.mp3 "$IMAGE".mp3
    else
        echo "# Note: No mp3 file generated (use GENERATE_MP3=true to generate one)"
    fi
fi


