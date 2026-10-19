# Changelog

All notable changes to the Smurfs and Dragons Math Shooter game.

## [2.1.5] - 2026-10-19

### Fixed & Changed
- **Notifiche (Toast) Spostate in Basso (`bottom: 12px`)**:
  - Il banner `#math-coach-toast` ora compare **in basso sotto la squadra del giocatore**, lasciando sempre libera e visibile la parte alta della strada dove arrivano mostri, boss e cancelli!
- **Forza Proporzionale a $\log_2(N)$ & Punti Ferita Draghi / Boss Triplicati**:
  - Introdotta la funzione [`getArmyLogStrength(n)`](file:///Users/ricc/git/genai-googlecloud-scripts/24-gemini25-games/02-smurfs-and-dragons/public/index.html#L1978-L1981) ($1 + 0.35 \cdot \log_2(N)$), così la potenza cresce ad ogni raddoppio di soldati ($1 \to 2 \to 4 \to 8 \to 16 \to 32 \to 64 \to 128 \to 256+$) senza esplodere in modo spropositato.
  - Aumentati sensibilmente gli HP di tutti i Draghi e Boss (Draghi Rubino/Zaffiro `1050–1500 HP`, Ossidiana/Diamante `1350–1900 HP`, Drago Gigantesco di Ale `3000–5500 HP`, Gargamella `650–900 HP`, Saga `850–1200 HP`, Scorpio `1000–1400 HP`, Aphrodite `1200–1650 HP`) così nessun drago muore mai con un colpo solo!
- **Orda di 15 Zombie (e Minion) Tolgono Pezzi Invece di Uccidere Istantaneamente**:
  - Se uno dei 15 zombie (o un puffo/guardia) arriva in fondo anche in modalità Difficile, **non** causa più Game Over immediato ma mangia dei soldati (`🧟 GNAM! -X Soldati!`). Muori solo se i tuoi soldati scendono a `0` (o se un Boss sfonda in modalità Difficile).
- **Cancelli Negativi (`-` vs `÷`) a 50/50 Senza Corridoio Centrale (Scelta Obbligatoria sul Pixel Più Vicino)**:
  - Rimosso lo "scudo centrale" che permetteva di schivare entrambi i cancelli passando in mezzo.
  - I cancelli `-` / `÷` occupano ora **50/50** tutta la carreggiata, e per qualsiasi coppia di cancelli viene sempre applicato il cancello col **centro più vicino in pixel** al giocatore (con sorteggio random in caso di parimerito esatto al centro).

## [2.1.4] - 2026-10-19

### Changed
- **Calcoli Matematici Più Facili e Tondi in Easy & Medium (Scarto Proporzionale per Età)**:
  - **Easy (`🐣 8-10y`)**: scarto ampio (**35%–65%**) rispetto al guadagno/perdita dell'altro cancello e arrotondamento a multipli tondi di `5` o `10` (es. con `30` soldati, contro `×2` propone `+15`, `+20` o `+45`, `+50`, mai `30+33`!).
  - **Medium (`🔥 11-13y`)**: scarto intermedio (**20%–38%**) con numeri puliti (es. con `30` soldati e `×2`, propone `+20` o `+40`).
  - **Hard (`👑 Papa Mode`)**: mantiene lo scarto strettissimo (`±1..3`, tipo `30×2` vs `30+33`) per veri geni della matematica!

## [2.1.3] - 2026-10-19

### Fixed
- **Strict Integer-Only Division for 8-Year-Olds (`n % div === 0`)**:
  - Eliminated all fractional divisions (`1/2`, `1/3`, `7/2`, `10/3`, etc.). Division gates (`÷2`, `÷3`, `÷4`, `÷5`) are now strictly generated ONLY when the current army count is evenly divisible (`n % div === 0`) and `n >= div * 2`.
  - Subtraction gates (`-val`) are strictly bounded to `[1, n - 1]` so standard gate pairs never drop the squad below `1`.
- **Live Mid-Flight Gate Sanitizer (`sanitizeActiveGatesForArmy`)**:
  - If enemy collisions reduce the player's army while a gate is already falling, any active division or subtraction gate automatically adjusts on the fly so the player never faces a fractional division or a division when at `1` soldier.
- **Optimal Gate Evaluation (`1 ÷ 2` vs `1 - 5`)**:
  - Gate comparison uses exact unclamped raw values (`rawOpResult` / `chosenRaw >= otherRaw`), so picking `÷2` (`0.5`) over `-5` (`-4`) when `army = 1` is always recognized as the optimal choice and never triggers a strike or Game Over.
- **Dynamic Negative Gate Rarity (`getNegativeGateProbability`)**:
  - `0%` negative/division gates when `army <= 5` (never get hit with a `÷` or `-` when you only have 1 piece!).
  - Rare (`12%`–`30%`) at small/medium army counts (`6..70`) relative to `+` / `×`.
  - Frequent (`72%`–`85%`) when `army >= 100` to keep piece counts in check.

### Added
- **Automated Unit Tests (`tests/math_gates.test.js`)**:
  - Added Node.js unit test suite (`just test`) verifying optimal choice logic, zero fractional divisions across all tiers/army sizes, zero negative gates at `army <= 5`, dynamic rarity scaling, and mid-flight gate sanitization.
- **Unified Deployment (`just deploy` / `deploy-both.sh`)**:
  - Runs unit tests first, then deploys in sync to **Firebase Hosting** (`https://smurfs-and-dragons.web.app/`), **GitHub Pages** (`gh-pages`), and **Vetrina** (`https://palladius.github.io/vetrina/games/smurfs-and-dragons/`).

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
