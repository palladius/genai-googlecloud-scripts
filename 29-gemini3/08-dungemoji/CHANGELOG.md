# Changelog — Dungemoji (1980s D&D NanoBanana Edition)

All notable changes to the **Dungemoji** Roguelike Dungeon Crawler.

## [8.2.0] - 2026-10-19

### Added, Fixed & Improved
- **🧸 Il Mitico Pupurabbu (2×2 IF-Style All-Purple Gentle Bear)**:
  - Re-imagined and regenerated **Il Mitico Pupurabbu** as a tall, cuddly, 100% uniform all-purple gentle bear-like friend (`tileSpan: 2`, inspired by *Blue* from the movie *IF*), with a warm kind smile and a glowing golden D20 in his paw.
- **🕹️ 3D Crawler Camera Alignment Fix, 180° U-Turn (`BACK`) & Mobility Unit Tests (`runMobilityUnitTests`)**:
  - Fixed the 1-tile perspective shift in 3D Crawler mode by positioning the first-person camera near the rear of the player's current cell (`get3DCamera` at `0.42` offset with `~87°` FOV) paired with an exact DDA grid raycaster (`cast3DRay`), ensuring side openings in the current cell `(x, y)` vs `(x+1, y)` are always accurately visible.
  - Added live tactical side-passage HUD indicators (`◀ [A/←] SVOLTA SX APERTA (QUI!)` vs `↖ SVOLTA SX TRA 1 PASSO`).
  - Changed `BACK` (`S` / `↓` / `↶`) in 3D Crawler mode into a pure **180° in-place U-Turn** (`(player.dir + 2) % 4`) without stepping into walls behind the hero.
  - Added an automated 39-assertion **Mobility & 3D Raycast Unit Test Suite** (`runMobilityUnitTests()`, runnable via `^test` or Playwright CI).
- **🧱 Stone Grey & Earthy Brown Dungeon Walls (No Purple)**:
  - Replaced all purple wall/floor tones across the 3D Crawler, 2D Map, and Room Zoom Inspector with medieval granite stone grey (`#76716A`, `#3A3F47`) and warm earthy sandstone brown (`#806952`, `#4A3525`).
- **🚪 `ESC` Quit / Save Confirmation Modal & Auto-Save**:
  - Pressing `ESC` during gameplay opens a confirmation dialog (`#quit-modal`: *"Uscire dal Dungeon? Are you sure?"*) and automatically saves progress to `localStorage` (`dungemoji_save_v82`) with a **Resume Saved Game** button on the Title screen.
- **🎸 Level 5 (`L5`) Medieval Epic Metal MP3 Soundtrack (Lyria 3.5)**:
  - Generated `audio/epic_metal_l5.mp3` via `musicgen-lyria3` and wired `Synth80sAudio.syncMusicForLevel()` so Levels 1–4 play the lightweight 80s synth while reaching **Level 5 (`LV 5`) or Floor `B5F`** (or running `^metal`) automatically unleashes the **Medieval Epic Metal MP3**!
- **💀 3-Act 1980s Pixel-Art Death Cutscene (Adversarial Swarm `Gygaxiano Allupato '83` — Rated 9.4/10, GHI #3)**:
  - When the Paladin perishes (`drawGameOverOverlay`), plays a 3-Act pixel-art cutscene featuring the fallen wooden torch whose flame bends at 45° from the monster's draft, a vintage red D20 rolling onto a blood puddle on a Natural `1`, **Two Mysterious Glowing Red Eyes in the Dark** lunging with a triple claw slash (plus specialized Dragon Fire Cone, Necrotic Zombie Hands, and Beholder Death Ray variants), and filed [GitHub Issue #3](https://github.com/palladius/genai-googlecloud-scripts/issues/3) with the full Adversarial Swarm report.

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
- **3-Way Real-Time View Toggle (`[V]` key / HUD Switcher)**, **27 NanoBanana 2D Sprites**, **Simil-3D D20 Saving Throws**, and **1980s Synthwave Audio**.
