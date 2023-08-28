This is a hello world inspired by Google's official <https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstarts/quickstart-text>.

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

For debug reasons, it creates a sample `.tmp.lastsong` file where you can read and use your prompt output in case you
need.
