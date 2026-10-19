# Changelog — Dungemoji (1980s D&D NanoBanana Edition)

All notable changes to the **Dungemoji** Roguelike Dungeon Crawler.

## [8.3.2] - 2026-10-19

### Added & Improved
- **📈 Progressione Mostri per Piano del Dungeon (`getEligibleMonstersForFloor` & `getStairsGuardForFloor`)**:
  - **Piano `B1F` (Solo Roba Piccola `1×1`, `minLvl === 1`)**: Al primo piano compaiono esclusivamente mostri piccoli `1×1` (*Giant Rat* 🐀, *Vampire Bat* 🦇, *Goblin Cutter* 👺, *Venom Spider* 🕷️), incluso il guardiano delle scale (*Goblin* o *Spider*), senza mai generare mostri grandi `2×2` (eccetto l'eventuale cameo amichevole del *Mitico Pupurabbu* 💜).
  - **Piani `B2F–B3F` (Non-Morti & Bruti `1×1`)**: Compaiono *Skeleton* 💀, *Dire Wolf* 🐺, *Plague Zombie* 🧟, *Orc Berserker* 👹, *Chest Mimic* 📦 e *Green Slime* 🦠, mentre ratti e pipistrelli del `B1F` spariscono gradualmente.
  - **Piani `B4F–B6F` (Grandi Mostri `2×2` & Underdark)**: Esordiscono i mostri grandi `2×2` (*Gelatinous Cube* 🟩 al `B4F`, *Owlbear* 🦉 e *Ogre Brute* 🦍 al `B5F` insieme all'Epic Metal, *Cave Troll* 🧌 e *Mind Flayer* 🦑 al `B6F`).
  - **Piani `B7F+` (Boss Leggendari `2×2`)**: Guardiani delle scale *Beholder* 👁️ (`B7F`), *Red Dragon* 🐉 (`B8F`) e *Demogorgon* 👑 (`B9F+`), più cheat comando `^floor <N>` e 7 nuove asserzioni nella suite di unit test (`46/46` asserzioni totali).

## [8.3.1] - 2026-10-19

### Fixed & Improved
- **🔥 Nuovo Video di Morte Cinematografico Dark Fantasy Non-Pixelloso (`death_default.mp4` — Veo 3.1 Full v5)**:
  - Sottoposto il primo video ai **frame reali** dell'agente avversariale `dnd-grognard-critic` (*Gygaxiano Allupato '83*), che lo ha bocciato con **2.2/10** per il dado cubico D6 coi pallini, l'elmo duplicato e la finta pixel-art.
  - Rigenerato con **`veo-3.1-generate-preview`** in stile **dipinto ad olio dark fantasy cinematografico anni '80 (Larry Elmore D&D Red Box, zero pixellosità)** focalizzato su: **Due Occhi Rossi nel buio dell'arcata -> Drago Rosso Antico che emerge -> Soffio di Fuoco che travolge, frantuma e incenerisce il Paladino riducendolo a un cumulo di cenere fumante, braci e armatura carbonizzata** (valutato **9.8/10** sui frame reali!).
  - Aggiunto in basso a sinistra nel riquadro Game Over (`drawMiniIcosahedron`) il vero **D20 Icosaedrico matematico a 20 facce triangolari** piantato su **`1` (`NAT 1`)**.
- **🧹 Rimossa la scritta `(2x2)` dai nomi dei mostri**:
  - I mostri grandi e Boss (`Il Mitico Pupurabbu`, `Red Dragon`, `Beholder`, `Demogorgon`, `Owlbear`, `Ogre Brute`, `Cave Troll`) mantengono l'ingombro tattico `tileSpan: 2` sulla griglia ma mostrano i loro nomi puliti senza `(2x2)` sia in 3D Crawler sia in Room Zoom.

## [8.3.0] - 2026-10-19

### Added & Improved
- **🎬 Veo 3.1 1980s Pixel-Art Death Video MP4 (`audio/death_default.mp4`)**:
  - Generated the official **Catch-All Death Video MP4** (`5.7 MB`, 8s 16-bit VGA pixel-art animation with dungeon SFX & monster roar) via `veo-3.1-fast-generate-preview` using the **9.4/10** prompt approved by the `dnd-grognard-critic` Adversarial Swarm ([GHI #3](https://github.com/palladius/genai-googlecloud-scripts/issues/3)).
  - Embedded `deathVideoEl` (`audio/death_default.mp4`) directly into `drawGameOverOverlay()` and `checkPlayerDeath()` so the live Veo 3.1 video plays inside the Red Box Game Over viewport whenever the Paladin perishes (or via the `^die` cheat)!
- **🖼️ Vetrina Showcase (`~/git/vetrina`) & Repo README Refresh**:
  - Updated `~/git/vetrina` (`data/games.yaml`, `assets/screenshots/dungemoji.png`, `assets/screenshots/dungemoji_gameplay.gif`) and `24-gemini25-games/README.md` with new high-res 2D Tactical + Room Zoom & 3D Crawler screenshots.

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
