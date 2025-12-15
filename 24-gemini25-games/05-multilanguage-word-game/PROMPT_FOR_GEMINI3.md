I have two kids who are 5 and 7 and they're native in English, Italian and German; the big one is also leaarning French (!). I would like to build a fun game which they can play on a mobile. I was thinking of an anagram game where they need to position the words correctly when they start anagrammed. Since they're starting to read, I think giving them a visual feedback of what they're trying to build could help. You will have a list of words in the three languages, for each you'll have a structure like this:

words = [
    {emoji: '🍎', it: 'mela', en: 'apple', de: 'apfel', fr: 'pomme' },
    {emoji: '👀', it: 'occhi', en: 'eyes', de: 'eigen', fr: 'yeux' },
]

1. if you click with mouse or use letters -> keep behaviour as it is, its GREAT

2. If you tap with finger, say "A" in "ABCDE", make A light gray, and turn BCDE pink. Those are the only legal targets for me to land.

3. If my finger touches any of those 4 letters, uncolor all letters and swap A with the touched letter.
