# Changelog — Dungemoji (1980s D&D NanoBanana Edition)

All notable changes to the **Dungemoji** Roguelike Dungeon Crawler.

## [8.1.0] - 2026-10-19

### Added & Improved
- **Seamless CP437 Double-Line Box-Drawing Walls (`drawSeamlessDoubleBoxWall`)**:
  - Replaced spaced font characters with a 2-pass geometric double-rail Canvas renderer (`╔═══╦═══╗` / `║`) so horizontal and vertical walls connect edge-to-edge with **zero gaps** in both the 2D Tactical Map and the Room Zoom Inspector.
- **2×2 Multi-Tile Monster Footprints (`tileSpan: 2`)**:
  - Large monsters and Bosses (**Red Dragon** 🐉, **Demogorgon** 👑, **Beholder** 👁️, **Gelatinous Cube** 🟩, **Owlbear** 🦉, **Cave Troll** 🧌, **Ogre Brute** 🦍) now occupy a full **2×2 square footprint** (`4 tiles`) on the dungeon grid, complete with 2×2 tactical base highlights, multi-tile melee collision (`getMonsterAt`), and multi-tile AI adjacency (`getMonsterDistanceToPlayer`).
- **Dedicated Non-Overlapping Control Deck (`#bottom-hud`)**:
  - Moved the yellow navigation D-Pad (`◀ ▲ ▼ ▶ ⏳`) and quick-action buttons (`🧪 Heal [Q]`, `✨ Purge [E]`, `👁️ 2D/3D [V]`, `🎲 Roll D20 [R]`) into a dedicated footer bar outside `#viewport` so they never overlap the dungeon canvas.

## [8.0.0] - 2026-10-17

### Added
- **3-Way Real-Time View Toggle (`[V]` key / HUD Switcher)**:
  - 🗺️ **2D Tactical Map + Room Zoom Inspector**: Full procedural dungeon map (`╔═╗║` box-drawing walls, torch-lit Fog of War) with an interactive **Room Zoom** panel magnifying the current room with animated **NanoBanana 2D sprites**, HP bars, and status badges.
  - 🕹️ **1980s Pixel 3D Dungeon Crawler (*Eye of the Beholder / Wizardry* Mode)**: First-person raycast/step-grid 3D viewport with textured stone walls, flickering torches, depth-buffered **NanoBanana monster & treasure billboards**, and a top-right 2D radar minimap.
  - 👾 **Classic 1980s Emoji/ASCII Rogue Mode**: Pure retro terminal aesthetic with CRT scanlines.
- **27 NanoBanana 2D Sprites (Embedded Offline Atlas)**:
  - **Hero**: 1980s D&D Red Box Paladin-Mage.
  - **13 Classic Monsters**: Giant Rat 🐀, Giant Bat 🦇, Goblin 👺, Giant Spider 🕷️, Skeleton 💀, Dire Wolf 🐺, **Zombie** 🧟, Orc 👹, Acid Slime 🦠, Ghost Specter 👻, Ogre Brute 🦍, Cave Troll 🧌, **Red Dragon Boss** 🐉.
  - **6 Iconic 1980s D&D Monsters**: **Beholder** 👁️, **Mimic** 📦, **Mind Flayer (Illithid)** 🦑, **Gelatinous Cube** 🟩, **Owlbear** 🦉, **Demogorgon** 👑.
  - **Special Cameo**: **Il Mitico Pupurabbu** 🌟 (rare encounter & summonable via `^pupurabbu` or `[P]`).
  - **Loot & Equipment**: Healing Potion 🧪, Sparkle Potion of Undead Purging ✨, Bag o' Gold 💰, Shiny Diamond 💎, Royal Crown 👑, Vorpal Magic Sword +1 ⚔️.
- **🎲 Simil-3D Icosahedron (D20) Dice Roller & 1980s D&D Saving Throws**:
  - Mathematical 3D icosahedron (12 vertices, 20 triangular facets) with dynamic 3D rotation, facet lighting, and physics bounce.
  - Automatically triggers on the **5 Classic 1980s D&D Red Box Saving Throws**:
    1. 🔥 *Save vs. Dragon Breath* (Red Dragon / Demogorgon fire breath)
    2. ☠️ *Save vs. Poison / Death Ray* (Giant Spider venom, Zombie plague bite, Beholder Death Ray)
    3. 🟩 *Save vs. Paralysis / Acid* (Gelatinous Cube engulf, Ghost touch, Mimic bite)
    4. 🧠 *Save vs. Spells / Mind Blast* (Mind Flayer psionic wave)
    5. 🌟 *Pupurabbu Blessing / Arcane Chest Roll*
  - **NAT 20 Critical Success** (golden explosion, 2× counter-damage, synth brass fanfare) & **NAT 1 Critical Fail**.
- **🎹 1980s Synthwave & Dungeon Synth WebAudio Soundtrack**:
  - Multi-track procedural synthesizer with 16th-note arpeggiated analog bassline, dark poly-synth pad, 80s lead melody, dynamic Boss Battle theme, and full retro SFX.
