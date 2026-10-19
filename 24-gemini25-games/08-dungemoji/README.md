# 🐉 Dungemoji v8.0 — 1980s D&D Red Box Edition (NanoBanana 2D + Room Zoom + 3D Crawler)

Play live: **https://dungemoji.web.app/**

## ✨ Features in v8.0.0
- **3-Way Real-Time View Switcher (`[V]` key or HUD button)**:
  1. 🗺️ **2D Tactical Map + Room Zoom Inspector**: Explore procedural dungeons (`╔═╗║` double-line walls + torch Fog of War) with an automatic **Room Zoom** window showing magnified **NanoBanana 2D monsters**, HP bars, and D&D stats.
  2. 🕹️ **1980s Pixel 3D Dungeon Crawler (*Eye of the Beholder / Wizardry* Mode)**: First-person perspective stone walls, flickering torches, depth-buffered NanoBanana monsters & treasures, and a top-right 2D radar minimap.
  3. 👾 **Classic 1980s Rogue Mode**: Pure retro ASCII box-drawing + Emoji aesthetic with CRT scanlines.
- **27 Embedded NanoBanana 2D Sprites**:
  - **Classic 13**: Giant Rat 🐀, Vampire Bat 🦇, Goblin 👺, Venom Spider 🕷️, Skeleton 💀, Dire Wolf 🐺, **Plague Zombie** 🧟, Orc Berserker 👹, Green Slime 🦠, Ghost Specter 👻, Ogre Brute 🦍, Cave Troll 🧌, **Red Dragon Boss** 🐉.
  - **1980s D&D Legends**: **Beholder** 👁️, **Chest Mimic** 📦, **Mind Flayer (Illithid)** 🦑, **Gelatinous Cube** 🟩, **Owlbear** 🦉, **Demogorgon** 👑.
  - **Special Cameo**: **Il Mitico Pupurabbu** 🌟 (summon anytime with `[P]` or `^pupurabbu`!).
- **🎲 Simil-3D Icosahedron (D20) Saving Throws**:
  - Mathematical 3D 20-sided die with facet lighting and physics bounce, triggering on classic **1980s D&D BECMI Saving Throws** (*Save vs. Dragon Breath, Poison/Death Ray, Paralysis/Acid, Mind Blast Spells, and Pupurabbu's Fate Roll*).
- **🎹 1980s Synthwave & Dungeon Synth WebAudio Soundtrack**:
  - Procedural arpeggiated sawtooth bassline, dark synth pads, lead melody, dynamic Boss Battle music, and retro SFX.

## 🚀 Local Run & Deploy
- Local preview: `python3 -m http.server 8088 --directory public`
- Deploy to Firebase: `just deploy`
