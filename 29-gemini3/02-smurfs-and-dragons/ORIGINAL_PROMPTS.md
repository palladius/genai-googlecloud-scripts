## Prompt 1
My kids are 5 and 7, they're learning Maths and I'd like to have them do it by having fun.

The internet is full of clones of the same game which looks like this:

* eternal vertical scrolling app where your character (think of a shoot-em-all app) can only move left-right on the bottom of vertical screen (in doubt, take my phone size which is a Pixel 8 "2400 × 1080 pixel").

* the controls are just left and right.

* In front of you you have an army of, initially, 1 soldier. That army can't grow to more than say 200 (MAX_SOLDIERS). The more soldiers you have the more firepower you have (this could be linear or, probably better, logarithmic in the number of soldier)

* Things will come towards you randomly, usually proposing some cunning choice between Addition and multiplication. Adds and Multiplications should be BLUE (good), and subtractions and divisions would be RED (negative).

* Getting to <1 soldier ends the game, and visualizes your score (you choose an algorithm to decide score, based on killings, or time, or both).

* Game score is visualized on top right in green at all time.

* Every challenge (as two random things, left and right) will come at a given interval (say 5 seconds, initially as `CHALLENGE_INTERVAL`). Decrease the interval slowly over time (say -0.1s every 10 seconds) to make the game harder with time.

* Every CHALLENGE will come in two forms:

* a Left/Right Math choice

* a number of soldiers to fight. If you have 30 soldiers and the soldiers come

* Note on the "random choice between left and right" part:

* If player is presented with a blue/red choice, such as [+10, -10], the choice is kind of obvious. So keep these at a minimum.

* The best choice is something like [+10, *2] or [+30, *4] where the player needs to actively think.

* Shooting at a red decreases its negativity. For instance, shooting at "-20" would make it a -19 and so on until it gets to max +10 (minus half of what it was). Shooting should be signified by a constant arrows to the front of you - you need to hit in the ballpark of the enemy for the damage to be absorbed, or the arrows will go to the end of the schema and will fail.

* Please create Five schema objects of increasing difficulty. As YAML files they'd look like this, but you're welcome to use a native JS object - keep it as succinct as possible because I'll have to maintain that a lot.

```yaml
# schema01.yaml # turn 01
challenges: # User starts at 1 soldier.
- choice: ['+10', '-10'] # Chooses between 11 and -9. If -9, its game over.
- enemies: 5 soldiers # you cant dodge them, you will go to 6.
- choice: ['+10', '*3'] # Now your math skills are at test: better left (16) or right (18)?
- enemies: 12 smurfs # Now you're down to 4 or 6, depending on what you chose.
- choice: [+5, -10] # You can get +5 or shoot at -10 and it gets more and more...
- enemies: 1 dragon # Dragons have 20 HP, and count as 20 enemies.
# ... < you choose. Length should be around 20. >
```

* My soldiers need to be visible on the bottom! I want to see my current army as N good soldiers (say green uniforms).
* **Graphics**. Please make some effort to design some simplistic non-animated figures. Some with dragons, smurfs (blue gnomes) and enemy soldiers (same as me but with red uniforms).

* On the control side, make sure my army is visible on the X axis. My position will determine if I choose left or right when the left/right challenge hits me. Maybe leave a 20% in the middle for me to try avoid both choices (40% left, 20% nothing, 40% right).

Make me a captivating, multi-turn math shooter game. Key instructions are on screen and dissolve after 5 seconds. p5js scene, no HTML. I like medieval style and colorful background. My kids like dragons and smurfs, so please use them as theme, together with simple/boring soldiers with pikes and helmets.

## Prompt 2
this is amazing! My kids are loving it! Two things.

1. At the beginning of the game, ask me for difficulty EASY, MEDIUM, DIFFICULT. Depending on the choice make the speed and interval smaller (current timing is very easy, good for my little one but not for me.)

2. From a visualization side, make sure to increase the font of numbers, add a space between operator and number, and visualize "*2" as "X 2". Ideally I'd like to make the operator font bigger than number font.

## Prompt 3
* Shooting at a red decreases its negativity. For instance, shooting at "-20" would make it a -19 and so on until it gets to max +10 (minus half of what it was). Shooting should be signified by a constant arrows to the front of you - you need to hit in the ballpark of the enemy for the damage to be absorbed, or the arrows will go to the end of the schema and will fail to do any harm (will be basically lost).
