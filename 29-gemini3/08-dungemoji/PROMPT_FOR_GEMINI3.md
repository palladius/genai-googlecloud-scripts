# Prompt: Dungemoji - The Emoji Roguelike

Create a **p5.js** clone of a classic 80s CLI dungeon crawler (like Rogue or NetHack) but modernized with Emojis and full-screen browser responsiveness.

## Core Features
1.  **Dungeon Generation:**
    *   Procedural generation of rooms (varying sizes 2x2 to ~5x8) connected by corridors.
    *   Rooms/corridors should not overlap messily.
    *   **One Staircase** per dungeon level to descend deeper.
2.  **Fog of War:**
    *   The player starts in a random room.
    *   Visibility radius: 2-3 tiles (configurable).
    *   Explored areas stay visible (fog of war logic).
3.  **Visuals:**
    *   **Walls:** Do not use simple `#`. Use proper **Box Drawing Characters** (e.g., `║`, `═`, `╔`, `╗`, `╚`, `╝`) for connected walls. Ensure horizontal walls do not have gaps.
    *   **Entities:** Use Emojis for Player, Monsters, Treasures, and Potions.
    *   **Monsters:**
        *   Classic Fantasy only: Ogre, Mouse, Wolf, Troll 🧌, Ghost 👻, Zombie 🧟, Giant Bat 🦇.
        *   **Dragon:** A super big boss that appears only on lower floors.
    *   **Difficulty:** 1 monster every ~3 rooms on average. No monsters in the starting room.

## RPG Systems
1.  **Leveling:**
    *   Max Level: 36.
    *   Exponential XP curve (e.g., 2000 for L2, 4000 for L3...).
    *   Identify a ratio for Gold-to-XP (e.g., 1 Gold = 0.5 XP).
    *   Leveling up increases HP and Damage.
2.  **Combat & Items:**
    *   Turn-based combat (bump to attack).
    *   **Potions:** 'Q' to Quaff.
        *   *Sparkle Potion:* Instantly kills all **Undead** (Skeleton, Ghost, Zombie) within 10 tiles.
    *   HUD: Display HP, Equipment, and Level at the bottom.
3.  **Easter Eggs (Console):**
    *   Press `^` to open a command input.
    *   `showoff`: Reveals the entire map.
    *   `killemall`: Kills all monsters on the level (leaves loot).

## Controls & Platform Independence
The game must be playable on **both** Desktop and Mobile.

*   **Desktop:** Full keyboard support (Arrows to move, letters for actions like 'Q'uaff).
*   **Mobile:**
    *   Since mobile keyboards are unreliable for games, implement an **On-Screen Virtual Keyboard**.
    *   **D-Pad:** Large Arrow keys for movement.
    *   **Action Keys:** specific buttons for essential actions (Help, Potion, Interact).
*   **Help Screen:** Pressing 'H' overlays a full-screen help menu (pausing the game). Pressing 'H' again closes it.

## Technical Requirements
*   **Responsive:** The game canvas must resize correctly to 100% of the browser window. Handle window resize events (`windowResized`) to reconstruct the view without "going black".
*   **Single File:** Provide the complete solution in a single `sketch.js` file (plus HTML wrapper if needed, but logic in one place).

Please provide the complete, robust code implementing all the above rpg mechanics, generation logic, and the dual-control scheme.
