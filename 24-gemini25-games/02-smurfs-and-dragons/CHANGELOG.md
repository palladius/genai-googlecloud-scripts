# Changelog

All notable changes to the Smurfs and Dragons Math Shooter game.

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
