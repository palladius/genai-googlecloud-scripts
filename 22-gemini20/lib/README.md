

'''Video generation with Veo.

Sample code in CURL mode:

cat << EOF > request.json
{
    "endpoint": "projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001",
    "instances": [
        {
            "prompt": "This code enters a rocket ship and flies into the Cloud, the rocket ship enters a new world of rainbows, and mechanical cogwheels where everything runs in perfection and moden unison, evocative and utopic view of the future.",
            "image": {
                "bytesBase64Encoded": "iVB....mCC",
                "mimeType": "image/png",
            },
        }
    ],
    "parameters": {
        "aspectRatio": "16:9",
        "sampleCount": 4,
        "durationSeconds": "8",
        "fps": "24",
        "personGeneration": "allow_adult",
        "enablePromptRewriting": true,
        "addWatermark": true,
        "includeRaiReason": true,
    }
}
EOF

PROJECT_ID="veo-testing"
LOCATION_ID="us-central1"
API_ENDPOINT="us-central1-aiplatform.googleapis.com"
MODEL_ID="veo-2.0-generate-001"

OPERATION_ID=$(curl \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
"https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predictLongRunning" -d '@request.json' | grep '"name": .*'| sed 's|"name":\ ||g')

echo "OPERATION_ID: ${OPERATION_ID}"

'''
