## Prompt 1
Design a 2D tetris clone where you can dump Lego pieces with the 4 colors of Google (red blue green yellow).
Technology: p5js scene, no HTML. Futuristic, colorful background fantasy / color melange style.

Available pieces will be 1x2, 1x4, 1x8, 1x16, each in short (size 1) or tall (size 3). Probability of 1x8 and 1x16 is lower than others.
They board will memorize what you put down in a chessboard which is BOARD_WIDTH=20-wide and say 80 tall.
* Whenever a row (BOARD_WIDTH x 1) is fully occupied by pieces, the pieces will disappear. This will increase the score A LOT (say like lying 1 piece x 100).
*
* **Controls**. You can use your mouse to go in the two directions, and you can turn your piece to rotate 90 degrees (by clicking on the mouse), and force the piece to go down fast.
    * On computer, the controls will be: left/right, space bar (drop) and enter/up (rotate)
    * Om mobile, a drag left/right will move the brick accordingly, and a tap or swipe up will rotate it. A swipe down or double tap will drop it down.
* The game will start slow and it will slowly increase over time, say 1% every 10 sec.
* player loses when the tallest row is occupied. In this case, show the score (and record the top 10 high scores from anonymous players and add YOU in whichever position it is). Keep the score in RAM, doesnt matter if we'll lose it over reloads :)
* **Graphics**:
    * Graphically the legos need to have the little circles above as proper legos, do not just render rectangles, make some graphical effort here. a 1x4 will have for instance 3 bumps which in 2D are pretty easy to signify - use some shading of the original colors to mimic this effect.
    * The big container wil show the tetris "chessboard", and some sort of grids will need to be visible to help the player make their choices.
    * Some sort of gray shadow (or darker brick's color) will help the player understand where the piece is going to land, in the 2-dimensions. This can be hard to see, given the space.
* Upon game over, have a dramatic and fun rotation of my creation.
* Since we have thin (1 in the Z-dimension) and thick bricks (3 in Z-dimension), the game can be messy. Therefore, let's add a fun "3 consecutive thing bricks" rule:
    * If three EQUAL thin pieces land on each other (say 3 thin 1x3 in perfect line one above each other, or 3 1x8 thin bricks in perfect line, and so on), there will be a little explosive graphical effect (or blur, whichever you prefer) and then destroy the whole row of those 3 Z-coordinates.

Again, design a p5js script, with simple/no HTML interaction.
The app needs to work both on browser and on mobile.
