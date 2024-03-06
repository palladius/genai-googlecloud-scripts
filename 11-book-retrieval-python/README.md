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

1. You have a video, say ``.
2. You call `main.py`, and process the `sample-books.json` into `output/rich-book-info.json`
3. You call `json2html.py` and embed that info into `index.html`.

## Next steps

1. call Gemini API via python
2. export to a very simple HTML (maybe with CSS?). Let's ask Gemini to do so.


