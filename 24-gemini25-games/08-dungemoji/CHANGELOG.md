# Changelog — Dungemoji (1980s D&D NanoBanana Edition)

All notable changes to the **Dungemoji** Roguelike Dungeon Crawler.

## [9.0.2] - 2026-10-27

### Fixed & Tested (TDD Playability & Raspberry Pi 400 Hotfix — [GHI #6](https://github.com/palladius/genai-googlecloud-scripts/issues/6))
- **🍓👾 [GHI #6] Raspberry Pi 400 Modality 3 (`CLASSIC_EMOJI` — Classic 1980s Rogue) Invisible Character/Monsters & `[▯ ♂]` Tofu Fix**:
  - **Root cause #1 (`ctx.fillStyle = '#0C0A09'` pitch-black leak)**: `drawSeamlessDoubleBoxWall()` left `ctx.fillStyle = '#0C0A09'` after Pass 2. On macOS/Windows/Ubuntu desktops with color bitmap emoji fonts (`sbix`/`CBDT`), `ctx.fillText()` ignores `ctx.fillStyle` RGB values and paints full-color emojis anyway. On **Raspberry Pi 400** (Raspberry Pi OS / Debian without `fonts-noto-color-emoji`), Chromium falls back to monochrome outline fonts (`DejaVu Sans`) and `.notdef` Tofu boxes, which **obey `ctx.fillStyle`** — rendering all full-HP monsters, items, stairs, and the player in pitch-black `#0C0A09` (invisible!) until a monster took damage (`m.hp < m.maxHp`) and its green HP bar (`#10B981`) leaked green `fillStyle` into `5. Draw Player`!
  - **Root cause #2 (`🧙‍♂️` ZWJ Decomposition into `▯ ♂` & Missing Astral Emojis on Raspberry Pi OS)**: `DejaVu Sans` on Raspberry Pi OS lacks Supplemental Multilingual Plane (`U+1F000..U+1FAFF`) emojis (`🧙`, `🐀`, `🦇`, `👺`, `🕷️`, `🧟`, `🧌`, `🪜`, `🧪`, `💰`), while Basic Multilingual Plane `♂` (`U+2642`) is present — causing `'🧙‍♂️'` (`\u{1F9D9}\u200D\u2642\uFE0F`) to split across the Zero-Width Joiner into `.notdef` Tofu `▯` + `♂` (`▯ ♂`).
  - **Fix**:
    1. Restored `ctx.fillStyle` inside `drawSeamlessDoubleBoxWall()` and explicitly set high-contrast `ctx.fillStyle` before every `ctx.fillText()` call across all renderers.
    2. Added `Noto Color Emoji` webfont to Google Fonts `<link>` in `<head>` and replaced `'🧙‍♂️'` with single-codepoint `'🧙'` + `@`.
    3. Implemented runtime Canvas Tofu detector **`canCanvasRenderEmoji(glyph)`** + **`ROGUE_ASCII_BY_KEY`**: when the OS lacks color emoji fonts (Raspberry Pi 400), Modality 3 never passes astral `U+1Fxxx` Tofu glyphs to `ctx.fillText`, and automatically renders the embedded NanoBanana sprites (`SPRITES.hero`, `SPRITES[m.key]`, `SPRITES[it.key]`) paired with classic 1980s Rogue ASCII tokens (`@`, `r`, `b`, `g`, `s`, `Z`, `T`, `D`, `!`, `$`, `+`, `^`, `>`).
- **🪜 [Bug #2] Dungeon Level 1 (`B1F`) Missing / Invisible / Unreachable Exit Stairs to L2 Fix**:
  - **Visual rendering**: Added `drawStairsCell()` to render a high-contrast golden staircase portal with 3 stepped stone treads (`#38BDF8` / `#FDE047`) and `'🪜'` (or `'>'` on Raspberry Pi 400).
  - **Reachability & non-overwrite guarantee**: Fixed `generateDungeonFloor()` so `locked_door` (`🚪`) placement verifies via BFS (`hasPathFromPlayerToTile`) that `keyRoom` (`🗝️`) remains reachable without passing through a locked door, plus an emergency carved path from `player` to `stairs` if needed. Protected `'stairs'` tiles from ever being overwritten when summoning 2×2 companions (`summonPupurabbuNearPlayer`).
- **🧪 Automated Unit Test Runner (`test_dungemoji.mjs` + `TEST 6`, `TEST 7`, `TEST 8` in `runMobilityUnitTests`)**:
  - Added **TEST 6** (Modality 3 `CLASSIC_EMOJI` player visibility), **TEST 7** (L1 exit stairs existence, non-overwrite, 80-seed BFS reachability, high-contrast Canvas rendering, and `B1F -> B2F` transition), and **TEST 8** (Raspberry Pi 400 Tofu-free `canCanvasRenderEmoji` fallback for Hero `@`, full-HP Goblin `g`, items, and embedded sprites) — **69/69 assertions passing** via `just test`.

## [9.0.1] - 2026-10-19

### Added & Improved
- **🎬😂 Nuovi Video di Morte Tragicomici Stile *Dragon's Lair* ("Corridoio Scuro -> Porta -> Stanza 3×3 col Mostro al Centro")**:
  - Sostituito il vecchio template con l'arcata aperta con 3 nuovi video generati tramite **`veo-3.1-generate-preview`** ambientati interamente sottoterra in un corridoio scuro di pietra che si apre con una porta in legno su una stanza chiusa `3×3`, dove il Paladino entra **di spalle** e muore in modo **tragicomico**:
    - 🐉 **`death_default.mp4` (Drago Rosso)**: il Paladino apre la porta e si ritrova davanti il Drago Rosso sul mucchio d'oro; una vampata di fuoco lo trasforma in una sagoma nera di fuliggine con due occhioni bianchi stile *Dragon's Lair* che si sgretola in un mucchietto di cenere con l'elmo sopra!
    - 👁️ **`death_eyes.mp4` (Occhi Rossi nel Buio / Bestia del Dungeon)**: il Paladino apre la porta nel buio, due occhi rossi si accendono al centro della stanza `3×3` e un mostro corazzato gli molla una zampata titanica che fa schizzare via i pezzi d'armatura lasciandolo spiaccicato a faccia in giù sul pavimento!
    - 🧟 **`death_zombie.mp4` (Zombie & Scheletro)**: il Paladino entra nella cripta `3×3`, uno Scheletro gli dà una clavata sull'elmo mentre lo Zombie gli tira il tappeto di muschio da sotto i piedi, facendolo stramazzare in un volo tragicomico mentre **Zombie e Scheletro si battono il cinque (High-Five)** sopra di lui!

## [9.0.0] - 2026-10-19

### Added & Improved
- **🏷️ Versione Dinamica Sempre Visibile (`v9.0.0 RED BOX`)**:
  - Risolto il problema della versione hardcoded (`v8.2`): ora `build_game.py` legge direttamente il file `VERSION` (`9.0.0`) e mostra il badge luminoso **`v9.0.0 RED BOX`** nell'header in alto a sinistra (`#version-badge`), nel titolo principale (`#title-modal`), nel `<title>` della pagina e nella barra inferiore (`#bottom-hud`).
- **👦⚔️ Guida Rapida in 3 Mosse per Alessandro (`[H]` / `👦 GUIDA [H]`)**:
  - Aggiunto un pannello verde smeraldo chiaro e immediato nella schermata iniziale/Help che spiega a colpo d'occhio cosa è **davvero necessario** per giocare (**solo `Frecce/WASD` per muoversi, attaccare e scendere le scale + `Q` per curarsi**!) e cosa fanno i tasti extra opzionali (`E`, `F`, `C`, `B`, `V`).
- **🕵️‍♂️ Stanze Segrete nel Negativo (`carveSecretRoomInNegativeSpace()` + `discoverSecretRoom()`)**:
  - Ogni piano scava matematicamente una stanza segreta `3×3` nello **spazio negativo non scavato** tra le stanze/corridoi, chiusa da una porta segreta mimetizzata nel muro (`secret_door`) che blocca la visuale finché non viene scoperta.
  - **Come scoprirla**: **10% di probabilità** camminando sulla casella adiacente alla porta segreta, **35% bussando** contro il muro segreto, oppure **100% istantaneo** leggendo una **Pergamena delle Stanze Segrete (`📜`, tasto `[F]`)** o lanciando l'incantesimo *Protection & Secrets* (`[C]` -> `[3]`)!
- **✨ [GHI #4] Libro degli Incantesimi del Paladino (`[C]` / `✨ SPELLS [C]`)**:
  - 4 incantesimi divini con Cariche di Fede (`mana`) che si ricaricano ad ogni piano: **[1] Lay on Hands** (`+25 HP`), **[2] Turn Undead D20** (Tiro Sacro D20 che polverizza Scheletri, Zombie e Fantasmi), **[3] Protection & Secrets** (`+3 AC` per tutto il piano + rivela trappole e Stanza Segreta), e **[4] Holy Avenger Smite** (Folgore Divina su tutti i nemici visibili).
- **🛒 Mercante Nano del Dungeon (`[B]` / `🛒 SHOP [B]`)**:
  - Permette di spendere l'Oro (`💰`) raccolto per acquistare Pozioni Rosse (`🧪`), Pergamene delle Stanze Segrete (`📜`), Chiavi d'Oro (`🗝️`), Pozioni Sparkle (`✨`), Scudo Red Box (`+1 AC` e `+5 Max HP` permanenti) e Affilatura Vorpal (`+2 ATK` permanente).
- **🗝️ Porte Chiuse (`🚪`), Chiavi d'Oro (`🗝️`) & Trappole D&D (`⚠️`)**:
  - Porte chiuse apribili con una Chiave d'Oro (`🗝️`) o sfondabili con una prova di Forza sul D20 (`DC 14`), e trappole nascoste con Tiro Salvezza D20 sui Riflessi.
- **🎬 [GHI #3] 3 Video di Morte Cinematografici Veo 3.1 Non-Pixellosi (`getDeathVideoForKiller`)**:
  - Seleziona automaticamente il video Veo 3.1 (`veo-3.1-generate-preview`, dipinto ad olio dark fantasy anni '80 senza pixellosità) in base al mostro che uccide il Paladino:
    - `audio/death_default.mp4`: **Drago Rosso / Demogorgon** (incenerimento completo in cenere fumante — **9.9/10**).
    - `audio/death_zombie.mp4`: **Non-Morti** (*Zombie*, *Skeleton*, *Ghost* — orda scheletrica/necrotica nella cripta).
    - `audio/death_eyes.mp4`: **Due Occhi Rossi nel Buio** (balzo letale della bestia dagli occhi rossi per tutti gli altri mostri del dungeon).

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
