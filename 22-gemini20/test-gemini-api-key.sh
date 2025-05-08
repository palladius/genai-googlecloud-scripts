#!/bin/bash


GEMINI_API_KEY="$1"

echo "Testing on Gemini 2.- flash this: GEMINI_API_KEY=$GEMINI_API_KEY"

echo "=== 1. Showing curl full output. ==="

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works in max 200 words and use emojis"}]
    }]
   }' | tee t.json

echo
echo "=== 2. Showing just beautified text, if all is good so far ==="
echo

cat t.json | jq  -r .candidates[0].content.parts[0].text
