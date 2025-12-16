## Prompt 1
I have two kids who are 5 and 7 and they're native in English, Italian and German; the big one is also leaarning French (!). I would like to build a fun game which they can play on a mobile. I was thinking of an anagram game where they need to position the words correctly when they start anagrammed. Since they're starting to read, I think giving them a visual feedback of what they're trying to build could help. You will have a list of words in the three languages, for each you'll have a structure like this:

words = [
    {emoji: '🍎', it: 'mela', en: 'apple', de: 'apfel', fr: 'pomme' },
    {emoji: '👀', it: 'occhi', en: 'eyes', de: 'eigen', fr: 'yeux' },
]

## Prompt 2
I noticed the game does work perfectly on my computer but on mobile it doesnt. This is because a drag and drop on the letter on my android is consiedered me trying to resize the page. Please play with CSS or HTML so the page is STATIC and i cant increase or decrease it. This will hopefully fix the drag and drop problem on mobile.

## Prompt 3
even with your fix, I get this error on https://editor.p5js.org/ console:
TypeError: p.preventDefault is not a function

please paste the WHOLE new sketch.js - Im afraid I might do it wrong.

## Prompt 4
Interesting. The keyboard pressed works on p5js.org editor, but in the version I pushed. It seems the only difference is the viewport line on index.html which I have on my local comptuer (and pushed via firebase). I removed that and it works! Fixed. Just take note I had to remove the viewport.

Lets change the behaviour of the keyboard pressed. When you press the first -> yellow -> I like that. When you press the second, do not wait for ENTER. Just swap! So we can remove the enter binding and simplify the coding.

Lets explicitly add a version in JS we bump every time we improve the code. This gives me a good visual feedback loop and help me understand if I refreshed the version online (browsers are quite cache-greedy you know!). Let's start with 1.4.0.

## Prompt 5
The drag and drop on mobile functionality is STILL broken. Actually, I click on letter "U" and I got a letter "U" chich follows my finger anywhere and I can't press anything else, even the reset game. This is clearly malfunctioning.

## Prompt 6
No, same problem. if it helps:

the first letter is correctly interecepted. I click on 'G' and now everywhere I tap over the screen, a yellow "G" appears there. I've tried tapping anywhere in the row where I took it, but it wont work. So it feels like the first action works, the second doesnt.

If I may suggest a refcator, we could do something like this:

1. if you click with mouse or use letters -> keep behaviour as it is, its GREAT

2. If you tap with finger, say "A" in "ABCDE", make A light gray, and turn BCDE pink. Those are the only legal targets for me to land.

3. If my finger touches any of those 4 letters, uncolor all letters and swap A with the touched letter.

Maybe this different behaviour can have its own code and might be easier to test. Just an idea.

## Prompt 7
AND IT WORKS! YES! One last thing. I'd like to separate business logic from words. Can we move the `const words` somewhere else? You choose whatever it makes more sense! Could be another .js or a JSON file. Ideally we can take it locally (/words.js or /words.json). If this doesnt like, we can also pick it from Github as a public resource. Tell me which implementation you prefer and why so I learn something new. I'm not a great JS or clientside developer, I'm just used to ServerSide coding.
