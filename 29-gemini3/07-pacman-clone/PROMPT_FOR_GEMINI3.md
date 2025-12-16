# Prompt: Resizable Pacman Clone (Mobile First)

Create a robust **p5.js** clone of the classic *Pacman* game within a single `sketch.js` file (compatible with the p5.js editor). The game must be bug-free and fully playable on both Desktop and Mobile.

## Core Gameplay Mechanics

1.  **Map Logic & Fixes:**
    *   **Ghost House:** Ensure the central cage (Ghost House) has a proper exit so ghosts can enter the maze.
    *   **Collision:** Fix any off-by-one errors to ensure Pacman can navigate every valid square, including those adjacent to walls.
    *   **Teleport Tunnels (4-way):**
        *   **Standard Horizontal:** Create open "tunnels" on the left and right edges. Moving into one side instantly transports the character to the opposite side.
        *   **Vertical Tunnels:** Add custom vertical tunnels on the top and bottom edges with the same teleportation logic (a feature request to fool ghosts!).
2.  **Controls:**
    *   **Desktop:** Use Arrow Keys (Up, Down, Left, Right).
    *   **Mobile (Swipe/Touch):**
        *   Implement a robust **Swipe Detection** system for mobile.
        *   Avoid small, hard-to-hit buttons. Tapping or swiping anywhere on the screen should reliably translate to direction changes.

## Mobile Responsiveness & Rendering

*   **Responsive Canvas:**
    *   The game canvas should **NOT** be a fixed small square (e.g., 400x400).
    *   It must dynamically adapt to the device width/height. On mobile, it should take up **100% of the available width** and be centered vertically/horizontally as appropriate.
    *   Ensure the maze scales correctly without breaking grid alignment or gameplay speed.
*   **Touch Interface:** Ensure touches do not scroll or zoom the page (`touch-action: none` equivalent in p5.js setup/CSS).

Please provide the complete `sketch.js` code that incorporates all these fixes (teleports, ghost house, collision) and the responsive mobile design.
