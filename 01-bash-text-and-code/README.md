## Text generation

This is a hello world inspired by
[Google's official GenAI Quickstart](https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstarts/quickstart-text).

To call this you just need a Project ID with billing enabled.

```bash
curl -X POST \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d @request.json \
    "<https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/text-bison:predict>"
```

This script is inspired by `jaskier`, in @palladius sakura repository:
<https://github.com/palladius/sakura/blob/master/bin/jaskier>

Here's a possible output for the script.

![Alt text](../assets/genai-text-sample.png?raw=true "Sample invokation of script for a poetic text")

For debug reasons, it creates a sample `.tmp.lastsong` file where you can read and use your prompt output in case you
need.

## Code generation

It's easy to generate code snippets! 


You can also generate code simply. In the  script `` we exemplify a code snippet which should return TWO examples.

![Alt text](../assets/genai-code-generation.png?raw=true "Title")





Docs here: https://cloud.google.com/vertex-ai/docs/generative-ai/code/code-completion-prompts#complete-test-function 