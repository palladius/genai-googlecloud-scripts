# Prompt: Multilanguage Anagram for Kids

I need a mobile-friendly Anagram/Spelling game for my kids (ages 5 and 7) who are learning English, Italian, German, and French.

## Core Features

*   **Goal:** Reassemble scrambled words in the chosen language.
*   **Visual Aid:** Display an emoji corresponding to the word (e.g., Apple 🍎) to help them understand what they are building.
*   **Data Structure:** Separate the word list into a dedicated file (e.g., `words.js` or `words.json`) for cleaner separation of concerns.
    *   Format: `[{emoji: '🍎', it: 'mela', en: 'apple', de: 'apfel', fr: 'pomme' }, ...]`
*   **Version Display:** Clearly show a version number (start at v1.5.0) on the screen to help verify cache updates.

## Technical Requirements

*   **Framework:** p5.js.
*   **Mobile Considerations:**
    *   **Viewport:** Ensure the page is static and cannot be zoomed/resized. Use appropriate CSS/HTML settings (careful with `<meta name="viewport">` if it causes conflicts in some p5.js views, but generally ensure `user-scalable=no`).
    *   **Drag & Drop:** Prevent default behaviors that interpret drags as page scrolling/refreshing.

## Interaction Design (Crucial)

The game must handle input differently for Desktop and Mobile to ensure usability.

### 1. Desktop (Mouse/Keyboard)
*   **Selection:** Click a letter to select it (highlight Yellow).
*   **Swap:** Click a second letter to **immediately** swap it with the first selected letter.
*   **No "Enter" key:** Do not require pressing Enter to confirm actions. Auto-swap on the second click.

### 2. Mobile (Touch)
*Previous attempts at drag-and-drop were buggy. We will use a "Tap-to-Swap" model:*
*   **Tap 1 (Source):** Tap a letter (e.g., 'A' in 'ABCDE').
    *   Visual Feedback: The selected letter 'A' turns **Light Gray**.
    *   Target Hints: All other valid target letters ('BCDE') turns **Pink**.
*   **Tap 2 (Target):** Tap one of the pink target letters.
    *   Action: Immediately swap the first letter ('A') with the touched target letter.
    *   Cleanup: Uncolor all letters and wait for the next input.

Please provide the complete, robust code (HTML + Sketch.js + Words file) implementing this specific logic to ensure it works flawlessly on both devices.
