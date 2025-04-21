#!/bin/bash
# sbrodola.sh - Generates the Kids' Games HTML page and supporting files

set -euo pipefail

echo "🧹 Cleaning up old files if they exist..."
rm -rf ricclib

echo "🛠️ Creating directories..."
mkdir -p ricclib/web
mkdir -p ricclib/utils

echo "🎨 Generating Python Color Utility (ricclib/utils/color.py)..."
cat << 'EOF' > ricclib/utils/color.py
# -*- coding: utf-8 -*-
"""
Simple ANSI color codes for terminal output.
Because life's too short for monochrome! 😉
"""
from typing import Final

# --- Basic Colors ---
BLACK: Final[str] = "\033[30m"
RED: Final[str] = "\033[31m"
GREEN: Final[str] = "\033[32m"
YELLOW: Final[str] = "\033[33m"
BLUE: Final[str] = "\033[34m"
MAGENTA: Final[str] = "\033[35m"
CYAN: Final[str] = "\033[36m"
WHITE: Final[str] = "\033[37m"
# --- Bright Colors ---
BRIGHT_BLACK: Final[str] = "\033[90m" # Often Gray
BRIGHT_RED: Final[str] = "\033[91m"
BRIGHT_GREEN: Final[str] = "\033[92m"
BRIGHT_YELLOW: Final[str] = "\033[93m"
BRIGHT_BLUE: Final[str] = "\033[94m"
BRIGHT_MAGENTA: Final[str] = "\033[95m"
BRIGHT_CYAN: Final[str] = "\033[96m"
BRIGHT_WHITE: Final[str] = "\033[97m"

# --- Styles ---
RESET: Final[str] = "\033[0m"
BOLD: Final[str] = "\033[1m"
UNDERLINE: Final[str] = "\033[4m"
DIM: Final[str] = "\033[2m" # Not always supported

# --- Helper Function ---
def colorize(text: str, color: str = WHITE, bold: bool = False, underline: bool = False) -> str:
    """Applies color and style to text."""
    style = ""
    if bold:
        style += BOLD
    if underline:
        style += UNDERLINE
    return f"{style}{color}{text}{RESET}"

# --- Example Usage ---
if __name__ == "__main__":
    print("✨ Color Palette Showcase ✨")
    print(colorize("Classic Red", RED))
    print(colorize("Bold Green", GREEN, bold=True))
    print(colorize("Underlined Blue", BLUE, underline=True))
    print(colorize("Bold Yellow Underlined", YELLOW, bold=True, underline=True))
    print(colorize("Bright Magenta", BRIGHT_MAGENTA))
    print(colorize("Dim Cyan (may not work)", CYAN + DIM)) # Combine manually if needed
    print(f"This is {colorize('important', BRIGHT_RED, bold=True)}!")
    print("Normal text again.")

EOF

echo "📄 Generating CSS Stylesheet (ricclib/web/style.css)..."
cat << 'EOF' > ricclib/web/style.css
/* style.css - Simple styles for the Kids' Games page */

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f8ff; /* AliceBlue - sounds kid-friendly! */
    color: #333;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 20px auto; /* Center the content */
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #4a90e2; /* A nice friendly blue */
    text-align: center;
    margin-bottom: 30px;
}

ul {
    list-style-type: none; /* Remove default bullets */
    padding: 0;
}

li {
    margin-bottom: 25px; /* Space out the list items */
    padding-left: 10px;
    border-left: 4px solid #4a90e2; /* Add a little accent */
    transition: background-color 0.3s ease; /* Smooth hover effect */
}

li:hover {
    background-color: #eaf4ff; /* Light blue on hover */
}

li span.emoji {
    font-size: 1.5em; /* Make emojis slightly bigger */
    margin-right: 10px;
    vertical-align: middle;
}

li a {
    font-weight: bold;
    color: #d9534f; /* A contrasting red/coral for links */
    text-decoration: none; /* No underlines by default */
    transition: color 0.3s ease;
}

li a:hover,
li a:focus {
    color: #c9302c; /* Darker red on hover/focus */
    text-decoration: underline; /* Add underline on hover/focus */
}

li p {
    margin: 5px 0 0 35px; /* Indent description slightly */
    font-size: 0.95em;
    color: #555;
}

/* Optional: Fun footer */
footer {
    text-align: center;
    margin-top: 40px;
    font-size: 0.8em;
    color: #888;
}
EOF

echo "📄 Generating HTML Page (ricclib/web/index.html)..."
cat << 'EOF' > ricclib/web/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riccardo's Kid's Awesome Games! 🕹️</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Super Fun Game Zone! 🤩</h1>

        <ul>
            <li>
                <span class="emoji">🏃‍♂️</span>
                <a href="https://incandescent-inferno-1052.web.app/" target="_blank" rel="noopener noreferrer">Dungeon Runner</a>
                <p>An endless runner featuring family members. Sounds… *unique*. 😉</p>
            </li>
            <li>
                <span class="emoji">🍄➕</span>
                <a href="https://smurfs-and-dragons.web.app/" target="_blank" rel="noopener noreferrer">Smurfs & Dragons (Math Shooter)</a>
                <p>Math practice with a Smurf/Dragon theme! Now that's what I call Edutainment™! 🤓</p>
            </li>
            <li>
                <span class="emoji">🧱🎲</span>
                <a href="https://gugley-3d-tetris.web.app/" target="_blank" rel="noopener noreferrer">3D Googley Lego Tetris</a>
                <p>Tetris with Google-coloured Lego in 3D. A spectacular creation, apparently. ✨</p>
            </li>
            <li>
                <span class="emoji">🧱👾</span>
                <a href="https://legoey-2d-carlessian-tetris.web.app/" target="_blank" rel="noopener noreferrer">2D Legoey Tetris</a>
                <p>The 2D version, for those of us who find 3D *too* stimulating. Back to basics! 😎</p>
            </li>
            <li>
                <span class="emoji">🌍🔤</span>
                <a href="https://zurigram.web.app" target="_blank" rel="noopener noreferrer">Multilingual Anagrams</a>
                <p>Anagram game in multiple languages! Kate *must* see this! 🗣️</p>
            </li>
             <li>
                <span class="emoji">✨🇱🇹🇳🇱</span>
                <a href="https://teal-georgianne-19.tiiny.site/" target="_blank" rel="noopener noreferrer">Paolo's Game (with Dutch/Lithuanian)</a>
                <p>Riccardo's friend Paolo's cool game, now even more international! 🌍</p>
            </li>
        </ul>

        <footer>
            <p>Have fun playing! 🎉 - Built with ❤️</p>
        </footer>
    </div>
</body>
</html>
EOF

chmod +x sbrodola.sh

echo "✅ All done! Files generated in the 'ricclib' directory."
echo "👉 Run './sbrodola.sh' to create the files."
echo "👉 Then open 'ricclib/web/index.html' in your browser to see the page!"

