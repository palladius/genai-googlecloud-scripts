
Downloaded Ollama for Mac

```
ollama run llama2 # ??gb
ollama run llama3 # 4.7GB the most capable to datye
ollama run gemma # default: 8G
ollama run codegemma #
#NO! ollama run nomic-embed-text  # embeddings

curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "The sky is blue because of Rayleigh scattering"
}'
```

## invokations

```
echo 'Whats the meaning of indigo? ' | ollama run gemma
```


## Errors

```
echo ciao | ollama run nomic-embed-text
Error: embedding models do not support generate
```
