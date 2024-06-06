# RAG example

# The problem
I like to swim. However, in Zurich, water temperature can be a bit off for most tastes (not my friend Yves, he likes it
16 degrees). I like it from 20deg on.

Problem is, Switzerland exposes water temperatures in multiple websites, but it doesn't expose an API.

# The Solution

I'm too lazy to build a deterministic one, how about I ask Gemini to do the magic mojo for me? I'll use a RAG pattern
to do so.

The scripts do the following:

* curl information from a swiss website, say https://www.stadt-zuerich.ch/ssd/de/index/sport/schwimmen/wassertemperaturen.html
* feed this curl into a RAG ruby ERB template (JINJA python equivalent, just better ;) ).
* Ask `Gemma` to read this and produce an output.

Why Gemma? This processing is so simple I don't need Gemini to solve it. Once it gets a bit more complex, of course
I'd resort to Gemini to do this. Something more complex like: ```read this whole article ({{rag}}). What do you reckon is the average sea temperature for Zurich see? Explain your reasoning```. For a task like this, I'd definitely use Gemini 1.5.
Maybe I would also feed a visual map of it.

## Result

These are the two closest beaches to my apartment. Thanks Gemma!

```
{
    "Seebad Enge": "17°C",
    "Seebad Utoquai": "18°C"
}
```

![Screenshot of water temperature on 6th June 2024](zurich-see-screenshot.png)
