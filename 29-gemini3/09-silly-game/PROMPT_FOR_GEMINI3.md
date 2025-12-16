# Prompt: Pixel Dino Endless Runner (Mobile First)

Create a captivating, mobile-friendly **Endless Runner** game using **p5.js**.

## Core Concept
A pixel-art Dinosaur running through a changing, interesting landscape. The game should be simple, addictive, and visually appealing.

## Gameplay Mechanics
1.  **Character:** A pixelated Dinosaur.
    *   **Action:** It runs automatically.
    *   **Controls:**
        *   **Tap / Click:** Jump.
        *   **Hold:** Jump slightly higher (variable jump height is nice but simple tap to jump is essential).
        *   **Double Tap:** Double Jump? (Optional, stick to single jump first if it feels tighter). **Decision:** Stick to a solid **Single Jump** physics identical to the offline dino game.
2.  **Obstacles:**
    *   Ground obstacles (cacti, rocks).
    *   Aerial obstacles (birds, pterodactyls).
    *   Obstacles speed up over time.
3.  **Background:**
    *   Parallax scrolling background with multiple layers (e.g., distant mountains, clouds, foreground trees).
    *   Dynamic day/night cycle or shifting colors to keep it visually "interesting" as requested.
4.  **UI/HUD:**
    *   Display Score (Distance traveled).
    *   "Tap to Jump" instruction clearly visible at the start.
    *   Game Over screen with "Tap to Restart".

## Technical Requirements
*   **Mobile First:**
    *   **Canvas:** Full screen, responsive to window size.
    *   **Input:** Ensure `touchStarted` and `mousepPressed` (p5.js events) trigger the jump reliably. Prevent double-firing events.
    *   **No Scrolling:** Prevent default touch behavior so the screen doesn't move when tapping.
*   **Single File:** All logic, collisions, and simple pixel-art *sprites* (use simple `rect()` or procedural drawing if actual images aren't loaded, OR base64 encode minimal sprites if you want to look fancy. Procedural pixel art is preferred for a single-file solution).

Please create the complete `sketch.js` that implements this polished endless runner with responsive controls.
