#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <json_file>"
    echo "  Example: $0 duffie-duck.response2.json"
    exit 1
fi

JSON_FILE="$1"
# Extracts the inlineData.data from the last element of the JSON array
B64_DATA=$(jq -r '.[-1].candidates[0].content.parts[0].inlineData.data' "$JSON_FILE")
# Extracts the mimeType from the last element of the JSON array
MIME_TYPE=$(jq -r '.[-1].candidates[0].content.parts[0].inlineData.mimeType' "$JSON_FILE")
# Replaces slashes with dots for the extension
EXTENSION=$(echo "$MIME_TYPE" | sed 's/image\///')
# Creates a filename based on the input file, and the extension
FILENAME="$(basename "$JSON_FILE" .json).$EXTENSION"

echo "$B64_DATA" | base64 --decode > "$FILENAME"

echo "Image extracted to $FILENAME"
