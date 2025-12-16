# Prompt: Google Colors Lego 3D Tetris (Mobile First)

Build a 3D Tetris clone using **p5.js** that features Lego-style bricks in the four Google colors (Red, Blue, Green, Yellow). The game must be mobile-friendly with a specific split-screen layout.

## 1. Graphics & Style
*   **Aesthetics:** Futuristic, colorful, and polished.
*   **Lego Pieces:** Do not just render simple boxes. Render "studs" (little cylinders) on top of the blocks so they look like real Lego pieces.
*   **Container:** A 3D grid of size **16x16 (base) x 100 (height)**.
    *   The container walls must be semi-transparent so the player can see inside.
    *   Draw grid lines to help the player align pieces.
*   **Drop Shadow:** Render a "ghost" or shadow of the falling piece at the bottom of the stack to show exactly where it will land.

## 2. Gameplay Mechanics
*   **Pieces:** Randomly generated Lego pieces of varying footprints (1x1, 1x2, 1x4, 2x2, 2x4, etc.) and heights (1 or 3 units).
*   **Logic:**
    *   Pieces fall from the top.
    *   The board memorizes the landed pieces.
    *   **Line Clearing:** When a full horizontal layer (16x16) is occupied, that layer disappears (Tetris style), and the score increases.
    *   **Game Over:** Occurs when the stack reaches the top. Trigger a dramatic, fun camera rotation animation of the built structure.
    *   **Speed:** Game starts slow and accelerates over time.

## 3. Mobile-First Controls & UI
The UI must be explicitly designed for mobile usage to avoid control issues.
*   **Split Screen Layout:**
    *   **Top 85% (View Area):** This is the 3D rendering area. Touches and drags here should **only** control the camera (orbit/pan/zoom, like `p5.easycam`).
    *   **Bottom 15% (Control Deck):** A separate panel at the bottom (separated by a visual line) containing **6 Visual Buttons**.
*   **The 6 Buttons:**
    1.  **Left**
    2.  **Right**
    3.  **Up** (Move "back" into depth)
    4.  **Down** (Move "forward" towards camera)
    5.  **Rotate** (Big, easy to hit - rotates piece 90 degrees)
    6.  **Drop** (Smaller to avoid accidents - instant drop)
*   **Input Handling:**
    *   The on-screen buttons must work with both **Touch** (mobile) and **Mouse clicks** (desktop dev testing).
    *   **Keyboard Fallback:** Keep keyboard controls for desktop (Arrows to move, Enter to rotate, Space to drop).

Please provide the complete, single-file HTML/JS solution (or separating js if better) that implements this mobile-ready design immediately.
