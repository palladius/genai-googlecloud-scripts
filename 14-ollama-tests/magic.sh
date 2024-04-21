#!/bin/bash

echo '1. Asking Gemma..'
cat question.txt | ollama run gemma > answer-gemma.txt
echo '2. Asking Llama2..'
cat question.txt | ollama run llama2 > answer-llama2.txt
echo '3. Asking Llama3..'
cat question.txt | ollama run llama3 > answer-llama3.txt

# doesnt work ollama run nomic-embed-text
echo '4. Computing Ollama Embeddings..'
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "$(cat question.txt)"
}' > embeddings-nomic-embed-text.json

cat embeddings-nomic-embed-text.json |
    jq .embedding |
        tee embeddings-nomic-embed-text.txt
