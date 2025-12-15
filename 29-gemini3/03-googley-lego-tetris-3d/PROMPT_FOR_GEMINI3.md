## Prompt 1
Design a 3D tetris clone where you can dump Lego pieces with the 4 colors of Google (red blue green yellow).
Technology: p5js scene, no HTML. Futuristic, colorful style.
Available pieces will be 1x1, 1x2, 1x4, 1x8, 2x1, 2x2, 2x4, 2x8, short (size 1) or tall (size 3).
They board will memorize what you put down in a chessboard which is 16x16 and say 100 tall.
* Whenever a slice of the surface (16x16x1) is fully occupied by pieces, the pieces will disappear (tetris side). This will increase the score.
* **Controls**. You can use your mouse to go in the four direction, and you can turn your piece to rotate 90 degrees (by clicking on the mouse), and force the piece to go down fast.
    * On computer, the controls will be: left/right/up/down, space bar (drop) and enter (rotate)
    * Om mobile, a drag left/right/top/bottom will move the brick, and a tap will rotate it. A double tap will drop it down.
* The game will start slow and it will slowly increase over time.
* player loses when the tallest size is occupied.
* **Graphics**:
    * Graphically the legos need to have little circles, do not just render parallelepipeds, make some graphical effort here.
    * The big container 16x16x100 will need to be half transparent to allow user to see through, and some sort of grids will need to be visible to help the player make their choices.
    * Some sort of gray shadow (or darker brick's color) will help the player understand where the piece is going to land, in the three-dimensions. This can be hard to see, given the space.
* Upon game over, have a dramatic and fun rotation of my creation.

## Prompt 2
ok I pushed to mobile and indeed there are areas where I can move up and left, but they're totally invisible. I think we should break down the touchscreen in two parts, like:

- 85% on top: where the bricks go down and container and everything. Here tapping would produce tilting of the 3d as the Easycam tab is designed to do.

- 15% below (well separated from a horizontal gray line). Here you put the 6 controls: left/right, up/down, rotate (big), and drop fast (small button - if pressed by mistake its error prone).

Please give me the code that visualizes those 6 buttons in ALL visualizations, and its clickable by mouse in normal mode, since the developer feedback loop for mouse and click on Desktop is immediate (seconds), on phone its longer (I need to just trust, deploy, free cache, test omn mobile, so it takes one minute).
