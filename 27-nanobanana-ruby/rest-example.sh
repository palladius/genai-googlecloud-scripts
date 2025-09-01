#!/bin/bash
set -e -E
set -euo pipefail

. .env
echo "REST Nano Banana: $GEMINI_API_KEY"

#GEMINI_API_KEY="$GEMINI_API_KEY"
MODEL_ID="gemini-2.5-flash-image-preview"
GENERATE_CONTENT_API="streamGenerateContent"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "<Drive file: 172E8b23p7le3J7HggBIj2HxD6cF3g4iC>"
            }
          },
          {
            "text": "Adds lots of love and hearts\n"
          },
        ]
      },
      {
        "role": "model",
        "parts": [
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "cover my son face with a banana\n"
          },
        ]
      },
      {
        "role": "model",
        "parts": [
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "INSERT_INPUT_HERE"
          },
        ]
      },
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE", "TEXT", ],
    },
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
