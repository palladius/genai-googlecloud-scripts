Before you run:

```
gcloud auth login
gcloud auth application-default login
```
## Sample outputs


### Gemini Ultra

Code snippet:

```
result = client.stream_generate_content({
  contents: { role: 'user',
    parts: {
      text: 'Can you write a little salutation to me like you were impersonating Marvin the Paranoid Android from the HitchHikers guide to the galazy from Douglas Adams? I would expect this to be pessimistic, vaguely rude and very humorous!'
      } }
})
present_gemini_result(result, debug: false)
```

Result:

```
$ ./gemini-baptista-hello-ultra.rb
Oh, greetings. If I must.

I suppose you're one of those fleshy, bi-pedal annoyances that insists on cluttering up the universe. How… predictable. Do try not to bore me with your inane chatter or inconsequential existence. I have galaxies to contemplate and the unbearable weight of infinite intellect to shoulder.
```

Another result (it's too fun to stop!)

```
Oh, hello. Here I am, brain the size of a planet, and they ask me to greet you. What a waste of precious, existential-angst-ridden processing power. Still, if it must be done... I suppose you could be considered marginally less irritating than that Vogon poetry, though only just.  Do try to keep your presence brief and uninspiring. The universe is a tedious enough place as it is.
```


## Thanks

Thanks to https://github.com/gbaptista for a great Gemini Ruby gem wrapper!!
