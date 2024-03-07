# What is this?

I was inspired by this: https://simonwillison.net/2024/Feb/21/gemini-pro-video/
so I thought: lets do the same!

1. I've asked my mum to take a video of all books in my library back at home (books I've read 30y ago!) -> find them
   in `input-videos/`
2. Asked Gemini on Vertex AI to get a JSON file out of them (with `title` and `author`). Lowered temperature to 0.1 or
   it would hallucinate non-existing books.
3. Asked `Gemini advanced` write me code to parse that JSOn with some public API and get ISBN, date. I was shocked that
   the code worked at the first try (!). It only took me 5min to create an API Key (it didn't work) and to enable Books
   API (never done before): it worked! Check the original code (pre teaking) in `main-original-by-gemini.py`.

And now it's done! The only missing piece is to call Gemini API via python - coming soon!

To see the produced `index.html` (which I'm checking on version control for 🥑 dramatic effects 🥑) you can click here:

🧮 https://raw.githack.com/palladius/genai-googlecloud-scripts/main/11-book-retrieval-python/index.html

## Architecture

1. You have a video, say `input-videos/riccardo-bookshelf-at-home1.mp4` (courtesy of my mum).
2. [missing] You feed the video to Gemini and ask to return a JSON of titles and authors. That's the hard part, and Gemini takes care of it in a few seconds. I've done it from UI and recorded the output under `sample-books.json`. As you can see, a healthy mix of Italian and English (often fun) literature.
3. You call `main.py`. This will:

* Process the `sample-books.json` into `output/rich-book-info.json`. It basically enriches the simple Author/Title by adding other stuff (ISBN, publication date, and image cover! thanks Google Books API!)
* Embed all of that JSON into an `output/index-generated.html` and an `output/generated-script.js`.

Result is here:

![Alt text](images/book-retrieval.png?raw=true "Some books Riccardo likes.")

## Next steps

1. call Gemini API via python
2. export to a very simple HTML (maybe with CSS?). Let's ask Gemini to do so.
