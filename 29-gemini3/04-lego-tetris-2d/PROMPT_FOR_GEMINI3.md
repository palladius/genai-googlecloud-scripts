# Prompt: Google Colors Lego 2D Tetris

Design a 2D Tetris clone using **p5.js** (no external HTML interaction) where you manipulate Lego pieces in the four Google colors (Red, Blue, Green, Yellow). The style should be futuristic, featuring a colorful fantasy/melange background.

## Gameplay Mechanics

*   **Board:** A 20-wide by 80-tall grid.
*   **Pieces:**
    *   Dimensions: 1x2, 1x4, 1x8, 1x16 (width x height logic).
    *   Depth/Thickness: "Short" (size 1) or "Tall" (size 3).
    *   Spawn Probability: 1x8 and 1x16 pieces should appear less frequently.
*   **Scoring & Clearing:**
    *   **Standard Tetris:** When a row (width 20) is fully occupied, it disappears, granting a significant score bonus (e.g., 100x the points of placing a single piece).
    *   **"3 Consecutive Thin Bricks" Special Rule:** Since there are thin (size 1) and thick (size 3) bricks, if **three identical thin pieces** stack perfectly on top of each other (same x-position, same width), they act as a "combo". Trigger a small graphical explosion/blur and destroy those 3 rows immediately.
*   **Game Over:** Losing occurs when the stack reaches the top. Show a game over screen with the score and a local (RAM-only) Top 10 High Score leaderboard. Add a dramatic, fun rotation animation of the final construction.
*   **Difficulty:** Game speed increases slowly over time (e.g., ~1% every 10 seconds).

## Controls (Mobile & Desktop)

The game must support both platforms seamlessly.
*   **Desktop:**
    *   Left/Right Arrows: Move piece.
    *   Enter or Up Arrow: Rotate piece 90 degrees.
    *   Space Bar: Fast drop.
*   **Mobile:**
    *   Drag Left/Right: Move piece.
    *   Tap or Swipe Up: Rotate.
    *   Swipe Down or Double Tap: Fast drop.

## Graphics

*   **Lego Aesthetic:** Do not just render rectangles. Render 2D "bumps" (studs) on top of the blocks to simulate Lego bricks (e.g., use shading/circles).
*   **UI:**
    *   The board should display a subtle grid to aid placement.
    *   **Ghost Piece:** Show a semi-transparent "ghost" shadow at the bottom to indicate where the piece will land.

Ensure the final code is a single p5.js script that works responsively on both browser and mobile.
