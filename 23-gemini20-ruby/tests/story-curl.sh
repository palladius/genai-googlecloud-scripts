API_KEY="$GEMINI_API_KEY"
INPUT="Generate a story about a cute baby giraffe in a 3d digital art style. For each scene, generate an image."

echo "Gemini key: $GEMINI_API_KEY"
echo "Input: $INPUT"
unalias curl

\curl \
  -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${API_KEY} \
  -H 'Content-Type: application/json' \
  -d @<(echo '{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Generate a story about a cute baby turtle in a 3d digital art style. For each scene, generate an image."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 1,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 88192,
    "responseMimeType": "application/json"
  }
}') | tee response.json

cat response.json | jq .candidates[0].content.parts[0].text -r
