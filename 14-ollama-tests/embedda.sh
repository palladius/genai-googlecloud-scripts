#!/bin/bash

set -euo pipefail
F="$1"
echo "4. Computing Ollama Embeddings for file '$F' .." >&2

curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "$(cat $F)"
}'
# > embeddings-nomic-embed-text.json
