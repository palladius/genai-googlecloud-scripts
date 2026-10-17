# Changelog

All notable changes to the Smurfs and Dragons Math Shooter game.

## [2.1.2] - 2026-10-17

### Added
- **Zombie Cutie (Nanobanana 2.1)**:
  - Generato nuovo sprite 2D in stile sticker cartoon chibi ad altissima definizione con Nanobanana: baby zombie verde con occhi grandi e scintillanti, tutina viola a toppe, cornetti e ossicino carino.
  - Scontornato con trasparenza alpha al 100% (zero artefatti o sfondi finti).
  - Proporzioni corrette (aspect ratio 162x256) con animazione hop e oscillazione dinamica.
  - Aggiunto anche allo showcase interattivo dei personaggi nella schermata del titolo.
- **Supporto PWA per Tablet e iPad**:
  - Web App Manifest (`manifest.json`) completo con supporto per display fullscreen, orientamento e tema.
  - Icona dell'app ufficiale in stile AAA cartoon generata con Nanobanana (Re Puffin, Puffo e Drago volante) esportata a 192x192, 512x512, apple-touch-icon (180x180) e favicon.
  - Service Worker (`sw.js`) per caching offline degli asset, aggiornamenti veloci e prompt di installazione su home screen di tablet e smartphone.
- **Colonna Sonora Rock con Google Lyria 3 (`musicgen-lyria3`)**:
  - Sostituito il liuto procedurale con una colonna sonora rock energica generata con il modello Google Lyria 3 (`bgm_rock_full.mp3`).
  - Chitarre elettriche ritmiche, basso incalzante, batteria arcade e cori festosi ("Ale e Sebi combattono draghi e puffi...").
  - Integrazione audio HTML5 loop con gestione pausa tattica e pulsante HUD `🎸 Rock: ON/OFF` (scorciatoia `B`).
- **Scaling Dinamico della Velocità con la Difficoltà**:
  - La velocità del gioco aumenta sensibilmente con la difficoltà scelta:
    - *Tier 1 (9-10 anni)*: 1.0x (Normale) / 1.25x (Difficile).
    - *Tier 2 (11-13 anni)*: 1.35x (Normale) / 1.65x (Difficile).
    - *Tier 3 (Papa Mode / 14+ anni)*: 1.75x (Normale) / 2.20x (Difficile).
  - Velocità applicata a: scorrimento strada, elementi dello sfondo/scenari, discesa dei cancelli matematici, avanzata dei nemici e moto orizzontale dei boss.

### Changed
- **Widget Party Solo Numero**:
  - Rimosso qualsiasi testo o etichetta (`👥 SQUADRA`): il widget in basso a sinistra mostra esclusivamente il numero pulito, gigante (40px) e celestiale ad alto contrasto.
- **Bilanciamento Arma Truxton Thunder (-50% Danno)**:
  - Per equilibrare l'incredibile vantaggio strategico dei fulmini a curvatura e ricerca automatica (auto-homing), il danno inflitto dal Thunder Verde è stato ridotto del 50%.
  - In questo modo, l'arma resta visivamente spettacolare e perfetta per eliminare nemici sfuggenti, ma premia l'abilità di mira del giocatore quando si usano il Vulcan pesante o lo Spread ad ampio raggio contro i boss.
- **Pausa Trasparente Hover**:
  - La schermata di pausa tattica è ora un banner fluttuante in alto con oltre il 90% di trasparenza sullo schermo e senza blur, ideale per scattare screenshot della partita in corso.

## [2.1.1] - 2026-10-17

### Fixed
- **Risolto Bug Matematico (1 ÷ 2 vs 1 - 5)**:
  - Implementata la funzione di confronto a precisione reale `getMathValue` per evitare che la divisione intera e il troncamento considerino erroneamente un cancello ottimale come un errore.
  - Salvaguardia nella generazione cancelli: per eserciti con meno di 6 soldati vengono generati esclusivamente cancelli di crescita (`+` vs `×`), eliminando trappole numeriche insolubili.
  - La divisione non azzera più l'esercito se il giocatore imbocca il cancello matematicamente migliore.

### Changed
- **Semplificato Widget Esercito in Basso a SX**:
  - Eliminati tutti i numeri superflui e la scomposizione abaco dal widget e dal canvas sotto la squadra.
  - Ora mostra unicamente il numero pulito, gigante e nitido (es. `22`) con etichetta `👥 SQUADRA`.
- **Pausa Trasparente "Hover" (90%+ Schermo Visibile)**:
  - Rimosso il blur a schermo intero e il fondo scuro opaco.
  - La schermata di pausa è ora un banner compatto fluttuante in alto su sfondo trasparente al 90%, ideale per catturare screenshot puliti del gioco fermo.
- **Danni e Difficoltà Ricalibrati**:
  - **Facile (9-10y / Normal)**: ogni colpo subito erode esattamente **1 soldato** (`-1`).
  - **Media (11-13y)**: ogni colpo subito erode il **10% dei soldati** (`Math.round(army * 0.10)`).
  - **Difficile (Papa Mode / HARD)**: ogni colpo subito **uccide istantaneamente** la squadra (Game Over immediato).
  - Applicato a collisioni coi nemici, alla Cuspide Scarlatta di Scorpio e alle Rose di Fish.

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
