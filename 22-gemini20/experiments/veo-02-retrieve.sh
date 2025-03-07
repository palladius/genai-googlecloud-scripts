#!/bin/bash

set -euo pipefail

#OPERATION_DFLT="projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/7c57f594-5f3e-40aa-b9cd-6f6edb719b8c"
#OPERATION_DFLT="7c57f594-5f3e-40aa-b9cd-6f6edb719b8c"
OPERATION_DFLT="projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/b4f3af2e-ff44-4fce-aecd-c4775aa6ac2a"

#OPERATION_ID="${1:$OPERATION_DFLT}"
OPERATION_ID="$OPERATION_DFLT"
PROJECT_ID="veo-testing"
LOCATION_ID="us-central1"
API_ENDPOINT="us-central1-aiplatform.googleapis.com"
MODEL_ID="veo-2.0-generate-001"

yellow "Retrieving: $OPERATION_ID"



cat << EOF > fetch02.json
{
    "operationName": "${OPERATION_ID}"
}
EOF

echodo curl \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
"https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:fetchPredictOperation" -d '@fetch02.json' |
    tee response-with-videoz.json


