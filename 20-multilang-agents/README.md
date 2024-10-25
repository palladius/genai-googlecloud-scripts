A function-calling multi-language demo for Gemini.

It doesn't **seroisuly** get any better than this... apart from my grammar.

## Vision

A **python** weather assistant (`whelper`), listening on port `8080`:

* What date/time
* What GPS coordinates is a city.
* What is the weather in a city.

A **ruby** FileSystem assistant (codename TBD), listening on port `8081`.

* Tells you whats in a folder (eg, `input/`).
* If it's an image, calls Gemini multi-modal to tell you what it is and get a description of it (default="describe whats in it").




Maybe a **concierge** assistant, which talks to both based on user interaction.

* This will probably need some
* Needs some glue code to talk to others via TCP/IP, or configurable via YAML/`.env`.

## POC

See the python script in action: https://www.youtube.com/watch?v=cAY6KUGsxJk

[![The first half - python TCP agent](https://img.youtube.com/vi/cAY6KUGsxJk/0.jpg)](https://www.youtube.com/watch?v=cAY6KUGsxJk)
