A function-calling multi-language demo for Gemini.

It doesn't **seroisuly** get any better than this... apart from my grammar.

## Vision

A **python** `weather` assistant (`whelper`), listening on port `8081`:

* What date/time
* What GPS coordinates is a city.
* What is the weather in a city.

A **ruby** `FileSystem` assistant (codename TBD), listening on port `8082`.

* Tells you whats in a folder (eg, `input/`).
* If it's an **image**, calls Gemini multi-modal to tell you what it is and get a description of it (default="describe whats in it").
* If it's a **PDF**, we might want to tell what it talks about :).


Maybe a **concierge** assistant, which talks to both based on user interaction.

* This will probably need some
* Needs some glue code to talk to others via TCP/IP, or configurable via YAML/`.env`.

And since this is a demo, I want to make it funny. Each agent will have a personality.

* `whelp`: speaks French, a bit posh.
* `ruby`: speaks Italian, funny and down to earth.
* `concierge`: speaks British English, formal.

The dream is to observe them talking together in different languages and saying "I dont understand you, please rephrase in English". The French one will be programmed to NEVER switch to English, even if it can :)

## POC

See the python script in action: https://www.youtube.com/watch?v=cAY6KUGsxJk

[![The first half - python TCP agent](https://img.youtube.com/vi/cAY6KUGsxJk/0.jpg)](https://www.youtube.com/watch?v=cAY6KUGsxJk)

## INSTALL

Python part

```bash
# 1. Select your virtualenv or whatever
make install # pip install deps
make auth    # gcloud auth
PORT=8081 bin/weather-tcp-agent-threaded.py
```

.. and bingo!

```
(.venv) ricc@derek:~/git/genai-googlecloud-scripts/20-multilang-agents$ make run-whelper
PORT=8081 bin/weather-tcp-agent-threaded.py
♊ VertexAI configured with GCP_PROJECT=ricc-genai, GCP_PROJECT_LOCATION=us-central1
[whelper v1.1b] 🧵 MAIN: Threaded super-duper thingy listening on PORT=8081
[whelper v1.1b] Server loop running in 🧵 thread: Thread-1 (serve_forever)
```
