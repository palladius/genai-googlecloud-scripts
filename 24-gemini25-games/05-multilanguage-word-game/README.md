## initial prompt

I have two kids who are 5 and 7 and they're native in English, Italian and German; the big one is also leaarning French (!). I would like to build a fun game which they can play on a mobile. I was thinking of an anagram game where they need to position the words correctly when they start anagrammed. Since they're starting to read, I think giving them a visual feedback of what they're trying to build could help. You will have a list of words in the three languages, for each you'll have a structure like this:

words = [
    {emoji: '🍎', it: 'mela', en: 'apple', de: 'apfel', fr: 'pomme' },
    {emoji: '👀', it: 'occhi', en: 'eyes', de: 'eigen', fr: 'yeux' },
]

## 2. first correction


1. I noticed the game does work perfectly on my computer but on mobile it doesnt. This is because a drag and drop on the letter on my android is consiedered me trying to resize the page. Please play with CSS or HTML so the page is STATIC and i cant increase or decrease it. This will hopefully fix the drag and drop problem on mobile.

2. even with your fix, I get this error on https://editor.p5js.org/ console:

```
TypeError: p.preventDefault is not a function

🌸 p5.js says:

[sketch.js, line 662] "preventDefault" could not be called as a function.

Verify whether "p" has "preventDefault" in it and check the spelling, letter-casing (JavaScript is case-sensitive) and its type.



+ More info: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Errors/Not_a_function#What_went_wrong

┌[blob:https://preview.p5js.org/a850d3b5-2295-4aba-875e-09102620f5ea:662:12]

Error at line 662 in handleKeyPressed()

└[blob:https://preview.p5js.org/a850d3b5-2295-4aba-875e-09102620f5ea:791:26]

Called from line 791 in p.keyPressed()
```

## 3. Reiterate I want the whole code, not the delta: I'm not *that* smart

please paste the WHOLE new sketch.js - Im afraid I might do it wrong.

## 4. ...


## 5. -> v1.4.0

1. Interesting. The keyboard pressed works on p5js.org editor, but in the version I pushed. It seems the only difference is the viewport line on index.html which I have on my local comptuer (and pushed via firebase). I removed that and it works! Fixed. Just take note I had to remove the viewport.

2. Lets change the behaviour of the keyboard pressed. When you press the first -> yellow -> I like that. When you press the second, do not wait for ENTER. Just swap! So we can remove the enter binding and simplify the coding.


3. Lets explicitly add a version in JS we bump every time we improve the code. This gives me a good visual feedback loop and help me understand if I refreshed the version online (browsers are quite cache-greedy you know!). Let's start with 1.4.0.

## TODO refactor the words in a different file.

1. In 1.4.1, please add the version to "Word Scramble fun" -> "Word Scramble Fun v{VERSION}".

2. The drag and drop on mobile functionality is STILL broken. Actually, I click on letter "U" and I got a letter "U" chich follows my finger anywhere and I can't press anything else, even the reset game. This is clearly malfunctioning.
