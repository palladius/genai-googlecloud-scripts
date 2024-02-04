#!/bin/bash

# from: https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images
# Usage: PROJECT_ID=ricc-genai immagina a huge avocado landing on earth with extraterrestrial life forms coming out
# If everything else fails, try: 'gcloud auth login --update-adc'

SCRIPT_VER='0.3'

set -euo pipefail

SAMPLE_COUNT="4"

function _fatal() {
    echo "[FATAL] $*" >&1
    exit 42
}

# Will make rubyists happy
function _lolcat() {
    if which lolcat >/dev/null ; then
        lolcat
    else
        # Dear non rubyists, you're missing out... happyness is one "sudo gem install lolcat" away.
        cat
    fi
}
# Works for Mac and Linux
function _base64_decode() {
    INPUT_FILE="$1"
    OUTPUT_FILE="$2"
    if uname | grep -q Darwin ; then
#        echo Mac
        base64 --decode -i "$INPUT_FILE" -o "$OUTPUT_FILE"
    else
 #       echo Linux
        base64 -d "$INPUT_FILE" > "$OUTPUT_FILE"
    fi
    echo Written tmp Base64 into: "$OUTPUT_FILE"
}


set -euop pipefail

mkdir -p output/

DEFAULT_PROJECT_ID="$(gcloud config get project)"
PROJECT_ID="${PROJECT_ID:-$(gcloud config get project)}"
IMAGE_OUTPUT_PATH=output/image-api-response.json
#DEFAULT_IMAGE_PROMPT="Once upon a time, there was a young spy named \"Agent X\". Agent X was the best spy in the world, and she was always on the lookout for new mysteries to solve. One day, Agent X was sent on a mission to investigate a mysterious cave at the bottom of a mountain."
DEFAULT_IMAGE_PROMPT_OLD="Once upon a time, there was a young spy named Agent X. Agent X was the best spy in the world, and she was always on the lookout for new mysteries to solve. One day, Agent X was sent on a mission to investigate a mysterious cave at the bottom of a mountain."
DEFAULT_IMAGE_PROMPT="Santa Klaus is a triathlete. On his chest you can read: Ironman Switzerland"
IMAGE_PROMPT="${@:-$DEFAULT_IMAGE_PROMPT}"
IMAGE_MODEL_VERSION="imagegeneration@005" # Imagen 2
LOCATION='us-central1'
FILENAME="${FILENAME:-image-api-response}"
echo "-----------------------------------------------------------------------------------------------"
echo "This script ( 🇮🇹 immagina 🇮🇹 ) will generate images provided you have a PROJECT_ID (in ENV) with billing enabled and also GenAI APIs enabled"
echo -en "- IMAGE_PROMPT: " ; echo "$IMAGE_PROMPT" | _lolcat
echo "- PROJECT_ID=$PROJECT_ID"
echo "- SAMPLE_COUNT=${SAMPLE_COUNT}x"
echo "- IMAGE_MODEL_VERSION=$IMAGE_MODEL_VERSION"
echo "- LOCATION=$LOCATION"
echo "- FILENAME=$FILENAME"
echo "-----------------------------------------------------------------------------------------------"

#echo "IMAGE_PROMPT1: $IMAGE_PROMPT"
#IMAGE_PROMPT=${IMAGE_PROMPT/\"/\\\"}
#echo "IMAGE_PROMPT2: $IMAGE_PROMPT"
BEARER=$(gcloud auth print-access-token)

cat > output/image-request.json  <<EOF
{
    "instances": [
        {
        "prompt": "$IMAGE_PROMPT"
        }
    ],
    "parameters": {
        "sampleImageSize": "1536",
        "sampleCount": $SAMPLE_COUNT,
        "aspectRatio": "9:16",
        "negativePrompt": "blurry",
    }
}
EOF


time curl -X POST \
    -H "Authorization: Bearer $BEARER" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d @output/image-request.json \
    "https://${LOCATION}-aiplatform.googleapis.com/v1/projects/$PROJECT_ID/locations/${LOCATION}/publishers/google/models/${IMAGE_MODEL_VERSION}:predict" |
    tee output/image-api-response.json

#    "https://${LOCATION}-central1-aiplatform.googleapis.com/v1/projects/$PROJECT_ID/locations/${LOCATION}-central1/publishers/google/models/imagegeneration@002:predict" |

echo 'First part of the script worked correctly. Lets now base64 decode the images...'


########################
# Output looks like this:
# {
#   "predictions": [
#     {
#       "bytesBase64Encoded": "BASE64_IMG_BYTES",
#       "mimeType": "image/png"
#     },
#     {
#       "mimeType": "image/png",
#       "bytesBase64Encoded": "BASE64_IMG_BYTES"
#     }
#   ],
#   "deployedModelId": "DEPLOYED_MODEL_ID",
#   "model": "projects/PROJECT_ID/locations/${LOCATION}-central1/models/MODEL_ID",
#   "modelDisplayName": "MODEL_DISPLAYNAME",
#   "modelVersionId": "1"
# }
########################
echo '+ Output size:'
wc -l "$IMAGE_OUTPUT_PATH"

#TODO_SIZE="2" # find by grepping...

# Max supported is 8..
for IMAGE_IX in 0 1 2 3 4 5 6 7 ; do
    IMAGE_TYPE=$( cat "$IMAGE_OUTPUT_PATH" | jq .predictions[$IMAGE_IX].mimeType )
    if [ '"image/png"' = "$IMAGE_TYPE" ] ; then
        echo 'YAY, image IX is a PNG. Lets decode it:'
        cat "$IMAGE_OUTPUT_PATH" | jq -r .predictions[$IMAGE_IX].bytesBase64Encoded > output/t.base64
        # https://stackoverflow.com/questions/16918602/how-to-base64-encode-image-in-linux-bash-shell
        # This works for Linux. For Mac, you need sth slightly different with -i and -o
        _base64_decode output/t.base64 "output/${FILENAME}-$IMAGE_IX.png"
    else
        echo "NO: IMAGE_TYPE=$IMAGE_TYPE"
    fi
done


echo '👍 Everything is ok. You should now have some 0..8 images (PNG or JPG) in the output/ folder. 🌍 Try from CLI: open output/*.png'
echo 'Note the script doesnt clean up after itself, you might have images from previous invokations since you have no guarantee each invokation yeilds 8 results. Check timestamps like a pro.'

ls -al output/*.png

# opening with browser if you feel lucky :)
#open output/*.png
