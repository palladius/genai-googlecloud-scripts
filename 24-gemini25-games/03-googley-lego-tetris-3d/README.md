## Meta

*   **Date:** April 5, 2025
*   **Model:** Gemini 2.5
*   **Technology:** p5.js with an HTML/CSS overlay for UI
*   **Rendered in:** [p5.js editor](https://editor.p5js.org/)
*   **Status:** The model generated a good foundation, but the code required manual integration of the HTML UI.
*   **Video:** https://youtu.be/9Tz4HJxsKU4
*   **App:** https://gugley-3d-tetris.web.app

## Description

This project is a 3D Tetris-style game where the player drops Lego-like pieces with the four Google colors (red, blue, green, yellow) onto a 10x10x20 board. The goal is to complete horizontal layers of the board, which then disappear, increasing the player's score. The game ends when the pieces stack up to the top of the board.

## Gameplay

*   **Objective:** Complete horizontal layers (10x10x1) of the board by strategically dropping pieces.
*   **Scoring:** Points are awarded for each layer cleared. Clearing multiple layers at once results in a higher score.
*   **Losing:** The game ends when a new piece is spawned and it's already blocked by the existing pieces on the board.

### Pieces

The game uses a variety of Lego-like pieces, including:

*   1x2
*   2x2
*   3x2
*   4x2

### Controls

The game can be controlled with a mouse, keyboard, or touch screen.

*   **Mouse/Touch on Canvas:**
    *   **Drag:** Rotate the camera view.
    *   **Scroll/Pinch:** Zoom in and out.
*   **On-Screen Buttons:**
    *   **Arrow Buttons:** Move the current piece left, right, forward, and backward.
    *   **Rotate Button:** Rotate the current piece 90 degrees.
    *   **Drop Button:** Instantly drop the current piece to the bottom.
*   **Keyboard:**
    *   **Arrow Keys:** Move the current piece.
    *   **Enter/Return:** Rotate the current piece.
    *   **Space Bar:** Hard drop the current piece.

## Development prompts

The initial prompt for this project was:

> Design a 3D tetris clone where you can dump Lego pieces with the 4 colors of Google (red blue green yellow).
> Technology: p5js scene, no HTML. Futuristic, colorful style.
> Available pieces will be 1x1, 1x2, 1x4, 1x8, 2x1, 2x2, 2x4, 2x8, short (size 1) or tall (size 3).
> They board will memorize what you put down in a chessboard which is 16x16 and say 100 tall.
> * Whenever a slice of the surface (16x16x1) is fully occupied by pieces, the pieces will disappear (tetris side). This will increase the score.
> * **Controls**. You can use your mouse to go in the four direction, and you can turn your piece to rotate 90 degrees (by clicking on the mouse), and force the piece to go down fast.
>     * On computer, the controls will be: left/right/up/down, space bar (drop) and enter (rotate)
>     * Om mobile, a drag left/right/top/bottom will move the brick, and a tap will rotate it. A double tap will drop it down.
> * The game will start slow and it will slowly increase over time.
> * player loses when the tallest size is occupied.
> * **Graphics**:
>     * Graphically the legos need to have little circles, do not just render parallelepipeds, make some graphical effort here.
>     * The big container 16x16x100 will need to be half transparent to allow user to see through, and some sort of grids will need to be visible to help the player make their choices.
>     * Some sort of gray shadow (or darker brick's color) will help the player understand where the piece is going to land, in the three-dimensions. This can be hard to see, given the space.
> * Upon game over, have a dramatic and fun rotation of my creation.

Later, the following prompt was used to add the on-screen controls:

> ok I pushed to mobile and indeed there are areas where I can move up and left, but they're totally invisible. I think we should break down the touchscreen in two parts, like:
>
> - 85% on top: where the bricks go down and container and everything. Here tapping would produce tilting of the 3d as the Easycam tab is designed to do.
>
> - 15% below (well separated from a horizontal gray line). Here you put the 6 controls: left/right, up/down, rotate (big), and drop fast (small button - if pressed by mistake its error prone).
>
> Please give me the code that visualizes those 6 buttons in ALL visualizations, and its clickable by mouse in normal mode, since the developer feedback loop for mouse and click on Desktop is immediate (seconds), on phone its longer (I need to just trust, deploy, free cache, test omn mobile, so it takes one minute).