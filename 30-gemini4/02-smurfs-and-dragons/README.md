# 🐉 Smurfs and Dragons: Gemini 4 Architecture (2026 Revamp)

## 🎯 Overview

`30-gemini4/02-smurfs-and-dragons` represents the 2026 full architectural revamp of **Smurfs and Dragons**, upgrading the original Gemini 2.5/3 codebase to the **Gemini 4** multi-modal stack.

## 📝 Story & Player Requirements (Alessandro & Sebastian)

Derived from playtesting sessions with Alessandro (8 years old, P3) and Sebastian (6 years old) on Samsung Galaxy Tab S10 Ultra (recorded via Ghita Bishu 🦆):

### 1. 💀 Bestiary & Wave Mechanics
- **15-Zombie Wave (`🧟 GNAM!`)**: Fast-moving hordes advancing in formation, requiring army fire concentration. If zombies breach the backline, they eat individual soldiers instead of triggering an instant game over.
- **6 Bullet-Sponge Mini-Bosses**: High HP armored monsters that test sustained DPS.
- **Giant Boss Colossus**: Full-lane titan with dedicated boss health bar.

### 2. 🏛️ Zodiac Boss Encounters (Requested by Sebi)
- **🦂 Milo dello Scorpione (Scorpio)**: Fires *Scarlet Needle* (Cuspide Scarlatta / red piercing lightning). High fatal damage requiring fast lane-swapping dodge maneuvers.
- **🌹 Aphrodite dei Pesci (Fish)**: Attacks with *Royal Demon Roses* (red) and *Piranha Roses* (black) with destructive touch mechanics.

### 3. ⚡ Mathematical Runner Engine & Balance
- **Army Power Curve**: $\text{Damage} = 1 + 0.35 \cdot \log_2(N)$ preventing exponential runaway damage while rewarding every army doubling ($1 \to 2 \to 4 \to 8 \to 16 \dots$).
- **Strict Integer Arithmetic for 8-Year-Olds**: No fractional divisions (`1/2`, `1/3`, `7/2`). Division gates strictly check `n % div === 0` and `n >= div * 2`.
- **Kid-Friendly Spreads**: In Easy/Medium tiers, gate options have clear 35%–65% spreads rounded to clean multiples of 5 or 10.
- **"Modalità Ale" / Extreme Difficulty**: Ultra-fast vertical scrolling, tighter spawn intervals, and punishment for mathematical hesitation.

### 4. 📱 Hardware & Controls Target
- Primary target: Samsung Galaxy Tab S10 Ultra (14.6" AMOLED, 120Hz touch).
- Controls: Fluid touch swipe on bottom lane, toast notifications anchored at the bottom (`#math-coach-toast`) leaving top approach lanes clear.

## 🚀 Deployment
- Firebase Hosting: `https://smurfs-and-dragons.web.app/`
- Vetrina GitHub Pages: `https://palladius.github.io/vetrina/games/smurfs-and-dragons/`
