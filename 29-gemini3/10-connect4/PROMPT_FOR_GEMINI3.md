# Prompt: Responsive Connect 4 (P5.js)

Create a 2-player **Connect 4** game using **p5.js** that works seamlessly on both Desktop and Mobile.

## Visuals & Animation
*   **Board:** Classic Design - Blue base with 7 columns and 6 rows.
*   **Pieces:** Red and Yellow balls.
*   **Animation:** Use a smooth but **fast** animation (e.g., 60% faster than standard easing) for pieces dropping from the top.
*   **Win State:** When a player wins:
    *   Highlight the winning 4 visible pieces clearly.
    *   Visually de-emphasize the rest of the board (e.g., turn loser/empty slots gray or blur the background) so the victory is obvious to children.

## Controls & Platform Independence

### Desktop
*   **Keyboard:** Keys `1` through `7` drop a piece in the respective column.
*   **Undo:** A "Back" / "Undo" button (or `Backspace` key) to revert the last move (useful for accidental clicks).

### Mobile (Touch)
*   **Responsiveness:**
    *   Ensure the entire grid (7 cols) stays visible and doesn't get cut off.
    *   **Direct Touch Interaction:** Instead of separate buttons below the board, allow the player to **tap directly on any column** of the board to drop a piece there. This is much more intuitive for kids.
*   **Layout:** Ensure the canvas fits 100% of the width and is centered.

## Technical Implementation
*   **Single File:** Provide the solution in a single `sketch.js` file suitable for the p5.js editor.
*   **Winner Detection:** Implement standard Connect 4 logic (horizontal, vertical, diagonal).

Please provide the complete, clean code implementing these unified requirements.
