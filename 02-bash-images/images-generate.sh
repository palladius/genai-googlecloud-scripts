#!/bin/bash

# from: https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images
# Usage: PROJECT_ID=ricc-genai immagina a huge avocado landing on earth with extraterrestrial life forms coming out

SCRIPT_VER='0.2b'

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

PROJECT_ID="$(gcloud config get project)"
IMAGE_OUTPUT_PATH=output/image-api-response.json
#IMAGE_MODEL_VERSION="${IMAGE_MODEL_VERSION:-002}" # try also 002 ;) better but slower
DEFAULT_IMAGE_PROMPT="Once upon a time, there was a young spy named Agent X. Agent X was the best spy in the world, and she was always on the lookout for new mysteries to solve. One day, Agent X was sent on a mission to investigate a mysterious cave at the bottom of a mountain."
IMAGE_PROMPT="${@:-$DEFAULT_IMAGE_PROMPT}"

echo "-----------------------------------------------------------------------------------------------"
echo "This script ( 🇮🇹 immagina 🇮🇹 ) will generate images provided you have a PROJECT_ID (in ENV) with billing enabled and also GenAI APIs enabled"
echo -en "- IMAGE_PROMPT: " ; echo "$IMAGE_PROMPT" | _lolcat
echo "- PROJECT_ID=$PROJECT_ID"
#echo "- IMAGE_MODEL_VERSION=$IMAGE_MODEL_VERSION"
echo "-----------------------------------------------------------------------------------------------"

BEARER=$(gcloud auth print-access-token)

cat > output/image-request.json  <<EOF
{
    "instances": [
        {
        "prompt": "$IMAGE_PROMPT"
        }
    ],
    "parameters": {
        "sampleImageSize": "1024",
        "sampleCount": 8,
        "aspectRatio": "9:16",
        "negativePrompt": "blurry",
    }
}
EOF


time curl -X POST \
    -H "Authorization: Bearer $BEARER" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d @output/image-request.json \
    "https://us-central1-aiplatform.googleapis.com/v1/projects/$PROJECT_ID/locations/us-central1/publishers/google/models/imagegeneration:predict" |
    tee output/image-api-response.json


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
#   "model": "projects/PROJECT_ID/locations/us-central1/models/MODEL_ID",
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
        _base64_decode output/t.base64 "output/image-api-response-$IMAGE_IX.png"
    else
        echo NO: IMAGE_TYPE=$IMAGE_TYPE
    fi
done


echo '👍 Everything is ok. You should now have some 0..8 images (PNG or JPG) in the output/ folder. 🌍 Try from CLI: open output/*.png'
echo 'Note the script doesnt clean up after itself, you might have images from previous invokations since you have no guarantee each invokation yeilds 8 results. Check timestamps like a pro.'

ls -al output/*.png

# opening with browser if you feel lucky :)
#open output/*.png
