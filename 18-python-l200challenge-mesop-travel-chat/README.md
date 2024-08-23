
As part of an internal Google code challenge go/ricc-devrel-challenge-l200
I'm trying to create a python chat app.

## Architecture / Tech stack

* Language: `python`
* Chat library: `mesop`
* AI model: `Gemma2`
* Endpoint: Vertex AI Endpoint.
* region: `us-west1`

## Desired outcome

You are a developer at a travel marketing company, and your sales department has decided that they need a new chat application to keep up with the bigger booking and search companies. They’ve also heard about generative AI, but they don’t know that much about it other than they’ve seen it do some trip generation in videos. Other departments have heard about this initiative, and they’re curious how this might also help their customer experience.

You need to build them an application that:

* Helps users ask questions about travel, book travel, and learn about places they are going to go
* Provides users ways to get help about their specific travel plans
* Provides all this in a production quality way (multiple environments, logging and monitoring, etc.)

You’ll also need to make sure you use generative AI appropriately, and that you can explain things like costs and other items that people who are unfamiliar with the new technologies may not know (the CFO is terrified of a big bill).

## Nice reads

* [Serve Gemma on Vertex AI (notebook)](https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/community/model_garden/model_garden_gemma_deployment_on_vertex.ipynb)
