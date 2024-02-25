

# Change these to your ids.
ENDPOINT_ID="6294864597715255296"
PROJECT_NUMBER="980606839737"
INPUT_DATA_FILE="gemma-input-generic.json"
OUTPUT_DATA_FILE="gemma-output-generic.json"
TMP_SUBSITUTED_FILE="$(mktemp)"

SANITIZED_INPUT=$(echo "$*" | sed -e s/\"//g )

#cat "$INPUT_DATA_FILE" | sed -e "s/_MY_PROMPT_/$*/"
cat "$INPUT_DATA_FILE" | sed -e "s/_MY_PROMPT_/$SANITIZED_INPUT/" > $TMP_SUBSITUTED_FILE

#exit 41

cat "$TMP_SUBSITUTED_FILE"

curl \
    -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_NUMBER}/locations/us-central1/endpoints/${ENDPOINT_ID}:predict \
    -d "@${TMP_SUBSITUTED_FILE}" 2>/dev/null | tee "$OUTPUT_DATA_FILE"

PREDICTION=$(cat "$OUTPUT_DATA_FILE" | jq .predictions[0])

echo -en "$PREDICTION\n"
