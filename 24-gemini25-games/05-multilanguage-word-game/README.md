## Pointers

* Paolo app: https://teal-georgianne-19.tiiny.site/ (with Lithuanian and Dutch).

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

## still doesnt work... 1.4.3

No, same problem. if it helps:

 the first letter is correctly interecepted. I click on 'G'  and now everywhere I tap over the screen, a yellow "G" appears there. I've tried tapping anywhere in the row where I took it, but it wont work. So it feels like the first action works, the second doesnt.

If I may suggest a refcator, we could do something like this:

1. if you click with mouse or use letters -> keep behaviour as it is, its GREAT

2. If you tap with finger, say "A" in "ABCDE", make A light gray, and turn BCDE pink. Those are the only legal targets for me to land.

3. If my finger touches any of those 4 letters, uncolor all letters and swap A with the touched letter.

Maybe this different behaviour can have its own code and might be easier to test. Just an idea.

## 1.5.0 and it works

AND IT WORKS! YES! One last thing. I'd like to separate business logic from words. Can we move the `const words` somewhere else? You choose whatever it makes more sense! Could be another .js or a JSON file. Ideally we can take it locally (/words.js or /words.json). If this doesnt like, we can also pick it from Github as a public resource. Tell me which implementation you prefer and why so I learn something new. I'm not a great JS or clientside developer, I'm just used to ServerSide coding.


## 1.5.1 refactor and mistake

Initiated loading words.json...
words.json loaded successfully!
Game Setup Complete! v1.5.1
Words array is empty or failed to load after preload!
TypeError: words.filter is not a function

🌸 p5.js says:
[sketch.js, line 93] "filter" could not be called as a function.
Verify whether "words" has "filter" in it and check the spelling, letter-casing (JavaScript is case-sensitive) and its type.

+ More info: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Errors/Not_a_function#What_went_wrong
┌[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:93:30]
	 Error at line 93 in startGame()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:118:761]
	 Called from line 118 in handleStartScreenInput()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:112:185]
	 Called from line 112 in handleMousePressed()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:180:28]
	 Called from line 180 in p.mousePressed()

TypeError: words.filter is not a function

🌸 p5.js says:
[sketch.js, line 93] "filter" could not be called as a function.
Verify whether "words" has "filter" in it and check the spelling, letter-casing (JavaScript is case-sensitive) and its type.

+ More info: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Errors/Not_a_function#What_went_wrong
┌[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:93:30]
	 Error at line 93 in startGame()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:118:761]
	 Called from line 118 in handleStartScreenInput()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:112:185]
	 Called from line 112 in handleMousePressed()
└[blob:https://preview.p5js.org/f85930fb-d2f0-4f6e-a5c1-c11e20789497:180:28]
	 Called from line 180 in p.mousePressed()

### another small bug

it works great! But I see a small bug in p5js editor:



ReferenceError: clearTouchSelectionState is not defined





🌸 p5.js says:

[sketch.js, line 45] "clearTouchSelectionState" is not defined in the current scope. If you have defined it in your code, you should check its scope, spelling, and letter-casing (JavaScript is case-sensitive).



+ More info: https://p5js.org/tutorials/variables-and-change/

┌[blob:https://preview.p5js.org/2854dbea-5739-46b0-b015-a163c97b9ade:45:849]

Error at line 45 in startDragging()

└[blob:https://preview.p5js.org/2854dbea-5739-46b0-b015-a163c97b9ade:38:320]

Called from line 38 in handleMousePressed()

└[blob:https://preview.p5js.org/2854dbea-5739-46b0-b015-a163c97b9ade:127:28]

Called from line 127 in p.mousePressed()


Mouse Drag ended at (338, 830)

Dropped on target: lang 0, letter 0

Swapping lang 0: idx 2 & 0

Resetting mouse dragging state.
