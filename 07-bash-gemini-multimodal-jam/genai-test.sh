#!/bin/bash

# copiato da CURL export!
# https://pantheon.corp.google.com/vertex-ai/generative/language/locations/us-central1/prompts/7362726783285723136?e=-13802955&mods=logs_tg_staging&project=ric-cccwiki

API_ENDPOINT="us-central1-aiplatform.googleapis.com"
PROJECT_ID="ric-cccwiki"
MODEL_ID="text-bison"
LOCATION_ID="us-central1"

curl \
-X POST \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H "Content-Type: application/json" \
"https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predict" -d \
$'{
    "instances": [
        {
            "content": "Take a deep breath before you start.
Here\'s what I want you to do, as accurately as possible:

- Generate a multiple choice trivia quiz in JSON format about \\"Genesis music band\\".
- One and only one response should be correct for each question.
- The quiz should have 8 questions and each question  should have 4 responses.
- All questions should be hard to solve.
- All questions and responses should be in English.
- Quote the sources for each question. Put one or more HTTP permalinks (at least one) where a human can easily validate your answer.
- Avoid repetition - vary the style of the questions and make them unique for each question.

The JSON output should be structured like this (without the \\"json\\" prefix):

[
    {{
        \\"question\\": \\"question goes here\\",
        \\"responses\\": [
            \\"response1\\",
            \\"response2\\",
            \\"response3\\",
            \\"response4\\",
        ],
        \\"correct\\": \\"correct response goes here\\",
        \\"sources\\": [
                   \\"wikipedia link source 1\\",
                   \\"another source 2\\",
       ],
    }},
    ...
]"
        }
    ],
    "parameters": {
        "candidateCount": 1,
        "maxOutputTokens": 1024,
        "temperature": 0.2,
        "topP": 0.8,
        "topK": 40
    }
}'

