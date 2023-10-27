# genai-googlecloud-scripts

This repo contains my GenAI scripts and templates, to be then merged into the proper Google GenAI repo upon proper inspection :)

| Requirement | Application Name | Technologies Used |
|---|---|---|
|Invoke a textual prompt with pure Bash: text, code and embeddings. This is a convenient wrap around public docs |[01-bash-text-code-embeddings/](01-bash-text-code-embeddings/) | Bash, Palm API (Text/Code/Embeddings)|
|Invoke a visual prompt with pure Bash: image generation. Again, wrapper around public docs |[02-bash-images/](02-bash-images/) | Bash, Palm API (Vision)|
|Fetch Medium articles, summarize them and learn about topics and author |[03-ruby-medium-article-slurper/](03-ruby-medium-article-slurper/) | Ruby, Palm API (Text)|
|Find embeddings for 5 sentences, find the 2 closest. Super simple REST API call from Ruby, with some simple and fun maths to demonstrate vicinity between sentences |[05-ruby-embedding-matrix/](05-ruby-embedding-matrix/) | Ruby, Palm API (Embeddings)|
|Invoke a textual prompt with pure Ruby: text, code images and embeddings. This is a Ruby wrap around public bash docs |[06-ruby-text-code-embeddings-images/](06-ruby-text-code-embeddings-images/) | Ruby, Palm API (Text/Code/Embeddings/Images)|

If you have any ideas, send them my way and [file an 🐛 issue](https://github.com/palladius/genai-googlecloud-scripts/issues/new)!

## Thanks

* Thanks [@rominirani](https://github.com/rominirani) and his repo <https://github.com/rominirani/genai-apptemplates-googlecloud/>. This repo was inspired by him!
* Thanks [@dazuma](https://github.com/dazuma) for inspiration and helping me getting started with Ruby GenAI APIs (in the 6-th folder).
