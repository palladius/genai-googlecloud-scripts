# Changelog

All notable changes to the Smurfs and Dragons Math Shooter game.

## [2.1.0] - 2026-10-16

### Added
- **Il Drago Gigantesco di Ale (Titan Final Boss)**:
  - Massive final boss at Wave 10 with a 260px wingspan, burning dragon corona, golden crown, and multi-layered health bar (1000-2000 HP).
- **I 5 Draghi Elementali**:
  - Draghi Rubino (Rosso), Zaffiro (Blu), Ossidiana (Nero), Diamante (Bianco), and Smeraldo (Verde) with distinct color auras, element names, and health scaling across waves 7 and 9.
- **Scorpio Milo (Cavalieri dello Zodiaco / Saint Seiya)**:
  - Wave 6 boss featuring the **Cuspide Scarlatta** (Scarlet Needle).
  - Aiming red laser tracer with warning reticle and 0.75s countdown, strictly dodgeable sideways by steering the squadron (+50 pts bonus for dodging).
- **Fish / Aphrodite dei Pesci (Saint Seiya)**:
  - Wave 8 boss throwing floating **Rose Rosse e Rose Nere** (2-4 roses depending on difficulty).
  - Roses drift with sinusoidal wobble, deal touch damage, but are **destructible mid-air** by player shots (+30 pts).
- **Orda di 15 Zombie (da Ale)**:
  - Wave 3 fast swarm of 15 green zombies rushing down in swarm formation.
- **Truxton Power-Up Meter & Accumulation Progression**:
  - `[P]` power capsules accumulate: 3 pills to reach Level 2 (3x fire rate & power), and 5 additional pills to reach Level 3 (5x power).
  - Live HUD badge showing progress (`POW L1 (1x) [■■□]`).
- **Pausa Tattica (Tasto P & Pulsante HUD)**:
  - Tasto rapido `P` ed `Escape`, oltre al pulsante HUD `⏸️ Pausa`, per mettere in pausa la partita.
  - Schermata semitrasparente con riepilogo soldati, punteggio, ondata e pulsante per riprendere o ricominciare.
- **Numero di Base del Party in Basso a SX (Visual Mental Math)**:
  - Widget fluttuante in basso a sinistra con cifre giganti (36px, colore celeste neon ad alto contrasto) con animazione pop pulsante ad ogni variazione.
  - Scomposizione abaco rapida `👑 Centinaia | 🛡️ Decine | 🐧 Unità` per facilitare il calcolo visivo istantaneo all'apparizione dei cancelli matematici.
- **Musica Medievale del Bardo**:
  - Procedurally synthesized lute/acoustic guitar arpeggiated music via Web Audio API in A Dorian mode.
  - Dedicated "🎵 Bardo: ON/OFF" HUD button and hotkey `B`.
- **100% Genuine Italian Audio Engine**:
  - Fixed SpeechSynthesis to enforce `lang = 'it-IT'` with fallback to Italian voice queries.
  - Pure Italian coaching quips ("Mamma mia!", "Attenzione!", "Ottima scelta!", etc.).
- **Cheat & Test Hotkeys**:
  - `1`, `2`, `3`: Select Vulcan, Spread, or Thunder weapon.
  - `P`: Instant Level Up.
  - `B`: Toggle Bard BGM.
  - `M`: Spawn Scorpio Milo.
  - `F`: Spawn Fish Aphrodite.
  - `T`: Spawn Titan Dragon di Ale.
  - `Z`: Spawn Zombie Horde.
  - `S` / `G`: Spawn Gemini Saga.

## [2.0.0] - 2026-10-15

### Added
- **Truxton / Tatsujin Weapons System**:
  - 🔴 Red Vulcan (Piercing concentrated beam, high single-target DPS).
  - 🔵 Blue Spread (Radial multi-way fan shot covering whole lanes).
  - 🟢 Green Thunder (Homing crackling lightning curving mid-air toward nearest enemy).
  - Floating glowing Power-Up orbs (`[P]`, `[RED]`, `[BLUE]`, `[GREEN]`).
  - HUD weapon switcher buttons and hotkeys (`1`, `2`, `3`, `P`).
- **3-Strikes Math Rule**:
  - Top HUD strikes counter (`❌ 0/3`).
  - Implemented 3rd suboptimal gate choice instant Game Over.
- **Base-10 Army Visual Breakdown**:
  - King Titans (scale 1.85, `👑 100`) for hundreds.
  - Captains (scale 1.25, `🛡️ 10`) for tens.
  - Puffini (scale 0.78, `🐧 1`) for units.
  - Real-time abacus breakdown display (`👑 Hx100 + 🛡️ Tx10 + 🐧 Ux1 = N`).
- **New Enemies & Bosses**:
  - Puffi Neri (fast zig-zag hops, double bite damage "GNAP! GNAP!").
  - Gargamella (wizard boss with dark potion attacks and dedicated HP bar at waves 4 and 7).
  - Easter Egg: Gemini Saga (Saint Seiya) appearing at wave 5 or via `S`/`G` keys, featuring "Another Dimension" teleportation & invulnerability phase.
- **iPad Fullscreen Support**:
  - Removed artificial `max-width: 540px` and `max-height: 920px` to fit 100% full vertical viewport on tablets.

### Changed
- Re-architected math gates to eliminate trivial `+` vs `-`. Only growth (`+` vs `×`) and damage mitigation (`-` vs `÷`).
- Repositioned difficulty tiers:
  - `🐣 9-10y`: New baseline.
  - `🔥 11-13y`: Fast sneaky calculations with narrow margins.
  - `👑 Papa Mode`: Ultra-fast (+75% speed), advanced multipliers/divisors (`×3`, `×4`, `÷3`, `÷4`, `÷5`).
