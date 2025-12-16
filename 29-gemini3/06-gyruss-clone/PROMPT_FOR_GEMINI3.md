# Prompt: Google Colors Gyruss Clone

Create a **p5.js** clone of the classic arcade shooter *Gyruss*. The game must be playable on both Desktop (Keyboard) and Mobile (Touch).

## Game Mechanics

1.  **Player Ship:**
    *   Visual: A white letter **'G'**.
    *   Movement: Constrained to move in a circle around the center of the screen (360 degrees).
    *   Action: Fires bullets towards the center of the screen (or "deep" into the screen depending on 2D/3D perspective choice, but standard Gyruss is circular motion shooting inwards/outwards). Let's assume shooting **inwards** towards enemy spawn or **outwards** from center if enemies come from deep space. *Interpretation:* Gyruss usually has enemies emerging from the center. Player rotates on the periphery shooting at them.
2.  **Enemies:**
    *   Visual: Spaceships colored in one of the 4 Google colors: **Red, Blue, Green, Yellow**.
    *   Behavior: Spawn from the center and spiral outwards/move towards the player.
    *   **Special Enemy:** 1 in 5 ships is a **"Fast Ship"**. It moves significantly faster and is worth **3x points** when destroyed.
3.  **Combat:**
    *   Shooting an enemy causes a small **explosion effect** and increases the score.
    *   Game Over if an enemy collides with the player.

## Controls

*   **Desktop:**
    *   **Arrow Keys (Left/Right):** Move the ship clockwise/counter-clockwise around the circle.
    *   **Spacebar:** Shoot.
*   **Mobile:**
    *   **Tap sides of screen:** Tap left side to move Counter-Clockwise, Tap right side to move Clockwise.
    *   **Auto-fire or dedicated button:** Since simple tapping handles movement, implement **Auto-fire** when moving, or a large zone at the bottom center to shoot. *Preference:* Tap left/right to move, auto-shoot while moving, or tap center to shoot. Let's go with **Tap left/right to move & shoot**.

Please provide the complete, single-file HTML/JS solution using p5.js.
