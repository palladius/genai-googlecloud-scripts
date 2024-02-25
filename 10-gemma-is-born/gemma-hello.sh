

# Change these to your ids.
ENDPOINT_ID="6294864597715255296"
PROJECT_NUMBER="980606839737"
INPUT_DATA_FILE="gemma-input-hello.json"
OUTPUT_DATA_FILE="gemma-output-hello.json"

curl \
    -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_NUMBER}/locations/us-central1/endpoints/${ENDPOINT_ID}:predict \
    -d "@${INPUT_DATA_FILE}" | tee "$OUTPUT_DATA_FILE"

PREDICTION=$(cat "$OUTPUT_DATA_FILE" | jq .predictions[0])

echo -en "$PREDICTION\n"
