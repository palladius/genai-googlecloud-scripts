<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Rogue Emoji 🏰</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #050505;
            overflow: hidden; /* Prevent scrolling on mobile */
            touch-action: none; /* Disable browser zooming/swiping */
            font-family: 'Courier New', Courier, monospace;
        }
        canvas {
            display: block;
            margin: 0 auto;
        }
        /* Hide scrollbars */
        ::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body>

<script>
/**
 * ROGUE EMOJI - p5.js Implementation
 * * A responsive, single-file dungeon crawler with procedural generation,
 * bitmask wall rendering, and cross-platform controls.
 */

// --- CONFIGURATION ---
const COLS = 40; // Logical grid width
const ROWS = 25; // Logical grid height
const UI_HEIGHT_RATIO = 0.85; // Game takes top 85%, HUD bottom 15%
let CELL_SIZE = 20;
let X_OFFSET = 0;
let Y_OFFSET = 0;

// --- STATE MANAGEMENT ---
let gameState = "START"; // START, PLAY, GAME_OVER, HELP
let consoleOpen = false;
let consoleBuffer = "";

// --- GAME OBJECTS ---
let map = [];
let rooms = [];
let entities = [];
let particles = [];
let messages = [];
let player;
let dungeonLevel = 1;

// --- ASSETS & CONSTANTS ---
const WALL_CHARS = {
    0: '⏺', 1: '║', 2: '║', 3: '║',
    4: '═', 5: '╚', 6: '╔', 7: '╠',
    8: '═', 9: '╝', 10: '╗', 11: '╣',
    12: '═', 13: '╩', 14: '╦', 15: '╬'
};

const MONSTER_TYPES = [
    { name: "Mouse", icon: "🐭", hp: 5, dmg: 2, xp: 5, type: 'beast' },
    { name: "Bat", icon: "🦇", hp: 8, dmg: 3, xp: 8, type: 'beast' },
    { name: "Wolf", icon: "🐺", hp: 15, dmg: 5, xp: 15, type: 'beast' },
    { name: "Zombie", icon: "🧟", hp: 20, dmg: 4, xp: 20, type: 'undead' },
    { name: "Skeleton", icon: "💀", hp: 15, dmg: 6, xp: 20, type: 'undead' },
    { name: "Ghost", icon: "👻", hp: 25, dmg: 5, xp: 30, type: 'undead' },
    { name: "Ogre", icon: "👹", hp: 40, dmg: 10, xp: 50, type: 'humanoid' },
    { name: "Troll", icon: "🧌", hp: 60, dmg: 12, xp: 80, type: 'humanoid' },
];

const BOSS_TYPE = { name: "Dragon", icon: "🐉", hp: 200, dmg: 25, xp: 500, type: 'beast' };

// --- INPUT VIRTUAL CONTROLS ---
const CONTROLS = {
    up: { x: 0, y: 0, w: 0, h: 0, label: "▲" },
    down: { x: 0, y: 0, w: 0, h: 0, label: "▼" },
    left: { x: 0, y: 0, w: 0, h: 0, label: "◀" },
    right: { x: 0, y: 0, w: 0, h: 0, label: "▶" },
    btnA: { x: 0, y: 0, w: 0, h: 0, label: "Q", action: "potion" }, // Quaff
    btnB: { x: 0, y: 0, w: 0, h: 0, label: "?", action: "help" },   // Help
    btnC: { x: 0, y: 0, w: 0, h: 0, label: "⏎", action: "enter" }   // Wait/Enter
};

// ==========================================
// P5.JS SETUP & DRAW
// ==========================================

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateLayout();
    
    // Set text alignment properties once
    textAlign(CENTER, CENTER);
    textFont('Courier New');
    
    startNewGame();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateLayout();
}

function calculateLayout() {
    // Determine cell size to fit grid in the playable area
    const availableHeight = height * UI_HEIGHT_RATIO;
    const cellW = width / COLS;
    const cellH = availableHeight / ROWS;
    CELL_SIZE = Math.floor(Math.min(cellW, cellH));
    
    // Center the map
    X_OFFSET = Math.floor((width - (COLS * CELL_SIZE)) / 2);
    Y_OFFSET = Math.floor((availableHeight - (ROWS * CELL_SIZE)) / 2);

    // Setup Mobile Controls Layout
    const btnSize = Math.min(width / 6, 80);
    const padX = btnSize * 1.5;
    const padY = height - btnSize * 1.5;
    
    // D-Pad
    CONTROLS.up = { x: padX, y: padY - btnSize, w: btnSize, h: btnSize, label: "▲" };
    CONTROLS.down = { x: padX, y: padY + btnSize, w: btnSize, h: btnSize, label: "▼" };
    CONTROLS.left = { x: padX - btnSize, y: padY, w: btnSize, h: btnSize, label: "◀" };
    CONTROLS.right = { x: padX + btnSize, y: padY, w: btnSize, h: btnSize, label: "▶" };
    
    // Action Buttons
    const actX = width - btnSize * 1.5;
    CONTROLS.btnA = { x: actX, y: padY - btnSize, w: btnSize, h: btnSize, label: "💊", action: "potion" };
    CONTROLS.btnB = { x: actX - btnSize * 1.2, y: padY + btnSize/2, w: btnSize, h: btnSize, label: "❓", action: "help" };
    CONTROLS.btnC = { x: actX + btnSize * 0.2, y: padY + btnSize/2, w: btnSize, h: btnSize, label: "Wait", action: "wait" };
}

function draw() {
    background(10); // Dark background

    if (gameState === "START") {
        drawTitleScreen();
    } else if (gameState === "PLAY") {
        updateFogOfWar();
        drawMap();
        drawEntities();
        drawParticles();
        drawHUD();
        drawTouchControls();
        drawConsole();
    } else if (gameState === "HELP") {
        drawHelpScreen();
    } else if (gameState === "GAME_OVER") {
        drawGameOver();
    }
}

// ==========================================
// GAME LOGIC GENERATION
// ==========================================

function startNewGame() {
    dungeonLevel = 1;
    messages = [];
    logMessage("Welcome to the Dungeon!", "#FFD700");
    generateLevel();
    
    // Reset Player Stats
    player.hp = 20;
    player.maxHp = 20;
    player.lvl = 1;
    player.xp = 0;
    player.nextLvl = 1000;
    player.potions = 1;
    player.gold = 0;
    player.weapon = 2; // base damage
    
    gameState = "PLAY";
}

function nextLevel() {
    dungeonLevel++;
    logMessage(`Descending to Level ${dungeonLevel}...`, "#00FFFF");
    generateLevel();
}

function generateLevel() {
    map = [];
    rooms = [];
    entities = [];
    particles = [];

    // 1. Initialize empty map
    for (let y = 0; y < ROWS; y++) {
        let row = [];
        for (let x = 0; x < COLS; x++) {
            row.push({ 
                type: 'wall', 
                seen: false, 
                visible: false, 
                char: ' ',
                color: '#444'
            });
        }
        map.push(row);
    }

    // 2. Place Rooms
    const MAX_ROOMS = 10;
    for (let i = 0; i < 30; i++) { // Try 30 times
        if (rooms.length >= MAX_ROOMS) break;
        
        const w = Math.floor(random(4, 10));
        const h = Math.floor(random(4, 8));
        const x = Math.floor(random(1, COLS - w - 1));
        const y = Math.floor(random(1, ROWS - h - 1));
        
        const newRoom = { x, y, w, h, cx: Math.floor(x + w/2), cy: Math.floor(y + h/2) };
        
        // Check overlap
        let overlap = false;
        for (let r of rooms) {
            if (x < r.x + r.w + 1 && x + w + 1 > r.x &&
                y < r.y + r.h + 1 && y + h + 1 > r.y) {
                overlap = true;
                break;
            }
        }
        
        if (!overlap) {
            createRoom(newRoom);
            rooms.push(newRoom);
        }
    }

    // 3. Connect Rooms
    for (let i = 0; i < rooms.length - 1; i++) {
        connectRooms(rooms[i], rooms[i+1]);
    }

    // 4. Calculate Wall Graphics (Bitmasking)
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (map[y][x].type === 'wall') {
                let mask = 0;
                if (y > 0 && map[y-1][x].type === 'wall') mask += 1; // North
                if (y < ROWS-1 && map[y+1][x].type === 'wall') mask += 2; // South
                if (x < COLS-1 && map[y][x+1].type === 'wall') mask += 4; // East
                if (x > 0 && map[y][x-1].type === 'wall') mask += 8; // West
                
                // Only use box drawing if it's actually part of the structure (has neighbors)
                // Otherwise it's void space
                if (mask > 0) map[y][x].char = WALL_CHARS[mask] || '#';
                else map[y][x].char = ' '; // Hide isolated walls in void
            } else if (map[y][x].type === 'floor' || map[y][x].type === 'corridor') {
                map[y][x].char = '·';
                map[y][x].color = '#333';
            } else if (map[y][x].type === 'stairs') {
                map[y][x].char = '🪜';
            }
        }
    }

    // 5. Place Player
    const startRoom = rooms[0];
    if (!player) player = new Entity(startRoom.cx, startRoom.cy, "🧙‍♂️", "Player");
    else {
        player.x = startRoom.cx;
        player.y = startRoom.cy;
    }

    // 6. Place Stairs (Last Room)
    const endRoom = rooms[rooms.length - 1];
    map[endRoom.cy][endRoom.cx].type = 'stairs';
    map[endRoom.cy][endRoom.cx].char = '🪜';

    // 7. Place Monsters & Items
    for (let i = 1; i < rooms.length; i++) { // Skip start room
        const r = rooms[i];
        // Chance for Monster
        if (random() < 0.7) {
            let mData = random(MONSTER_TYPES);
            // Dragon on level 10+
            if (dungeonLevel >= 10 && i === rooms.length - 1) mData = BOSS_TYPE;

            // Simple difficulty scaling
            let count = 1;
            if (dungeonLevel > 5 && random() > 0.5) count = 2;

            for(let j=0; j<count; j++) {
                let mx = Math.floor(random(r.x + 1, r.x + r.w - 1));
                let my = Math.floor(random(r.y + 1, r.y + r.h - 1));
                if (isPassable(mx, my)) {
                    let m = new Entity(mx, my, mData.icon, mData.name);
                    m.stats = { ...mData };
                    m.hp += Math.floor(dungeonLevel * 1.5); // Scale HP
                    entities.push(m);
                }
            }
        }
        
        // Chance for Items
        if (random() < 0.5) {
            let ix = Math.floor(random(r.x + 1, r.x + r.w - 1));
            let iy = Math.floor(random(r.y + 1, r.y + r.h - 1));
            if (isPassable(ix, iy)) {
                let type = random() < 0.7 ? 'gold' : 'potion';
                let item = new Entity(ix, iy, type === 'gold' ? '💰' : '🍷', type);
                entities.push(item);
            }
        }
    }
}

function createRoom(r) {
    for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
            map[y][x].type = 'floor';
        }
    }
}

function connectRooms(r1, r2) {
    let x = r1.cx;
    let y = r1.cy;
    while (x !== r2.cx) {
        x += (x < r2.cx) ? 1 : -1;
        map[y][x].type = 'corridor';
    }
    while (y !== r2.cy) {
        y += (y < r2.cy) ? 1 : -1;
        map[y][x].type = 'corridor';
    }
}

// ==========================================
// ENTITY SYSTEM
// ==========================================

class Entity {
    constructor(x, y, char, name) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.name = name;
        this.stats = {}; // hp, damage, etc
    }
}

function isPassable(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    // Check map tiles
    if (map[y][x].type === 'wall') return false;
    // Check entities (collision)
    for (let e of entities) {
        if (e.x === x && e.y === y) return e; // Return the entity blocking
    }
    if (player.x === x && player.y === y) return player;
    return true;
}

function movePlayer(dx, dy) {
    if (player.hp <= 0) return;

    const nx = player.x + dx;
    const ny = player.y + dy;
    
    const blocker = isPassable(nx, ny);
    
    // 1. Attack Monster
    if (blocker instanceof Entity && blocker !== player) {
        if (blocker.name === 'gold' || blocker.name === 'potion') {
            // Pick up item logic
            if (blocker.name === 'gold') {
                let amt = Math.floor(random(10, 50));
                player.gold += amt;
                player.xp += Math.floor(amt * 0.5); // Gold to XP
                logMessage(`Found ${amt} gold!`, '#FFD700');
            } else {
                player.potions++;
                logMessage(`Found a potion!`, '#FF69B4');
            }
            // Remove item
            entities = entities.filter(e => e !== blocker);
            player.x = nx;
            player.y = ny;
        } else {
            // Combat
            attack(player, blocker);
        }
        endTurn();
        return;
    }

    // 2. Move
    if (blocker === true) {
        player.x = nx;
        player.y = ny;
        
        // Check Stairs
        if (map[ny][nx].type === 'stairs') {
            nextLevel();
            return; 
        }
        endTurn();
    }
}

function attack(attacker, defender) {
    // Damage Calc
    let dmg = attacker === player ? player.weapon + Math.floor(player.lvl/2) : attacker.stats.dmg;
    // Variation
    dmg += Math.floor(random(-1, 2)); 
    if (dmg < 1) dmg = 1;

    defender.stats.hp -= dmg;
    
    // Visual FX
    addParticle(defender.x, defender.y, `-${dmg}`, '#FF0000');

    // Log
    if (attacker === player) {
        logMessage(`Hit ${defender.name} for ${dmg} dmg.`, '#FFF');
    } else {
        logMessage(`${attacker.name} hits you for ${dmg} dmg!`, '#FF5555');
    }

    // Death Check
    if (defender.stats.hp <= 0) {
        if (defender === player) {
            gameState = "GAME_OVER";
            logMessage("You died...", "#F00");
        } else {
            logMessage(`${defender.name} died! +${defender.stats.xp} XP`, '#0F0');
            player.xp += defender.stats.xp;
            entities = entities.filter(e => e !== defender);
            checkLevelUp();
        }
    }
}

function checkLevelUp() {
    if (player.xp >= player.nextLvl) {
        player.lvl++;
        player.maxHp += 5;
        player.hp = player.maxHp;
        player.weapon += 1;
        player.xp -= player.nextLvl;
        player.nextLvl = Math.floor(player.nextLvl * 1.5);
        addParticle(player.x, player.y, "LEVEL UP!", "#FFFF00");
        logMessage(`Level Up! You are now Lvl ${player.lvl}`, "#FFFF00");
    }
}

function usePotion(type) {
    if (player.potions > 0) {
        player.potions--;
        if (type === 'sparkle') {
            logMessage("Sparkle Potion! Undead burn!", "#FFF");
            // Kill all undead within 10 tiles
            let hit = false;
            entities = entities.filter(e => {
                let dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
                if (dist < 10 && e.stats.type === 'undead') {
                    addParticle(e.x, e.y, "BURN!", "#FFF");
                    hit = true;
                    return false; // Remove
                }
                return true;
            });
            if(!hit) logMessage("Nothing happened.", "#888");
        } else {
            // Heal
            let heal = 10 + player.lvl * 2;
            player.hp = Math.min(player.hp + heal, player.maxHp);
            logMessage(`Quaffed potion. +${heal} HP.`, "#0F0");
            addParticle(player.x, player.y, "♥", "#F00");
        }
        endTurn();
    } else {
        logMessage("No potions left!", "#888");
    }
}

function endTurn() {
    // Monsters Move
    for (let e of entities) {
        if (e.name === 'gold' || e.name === 'potion') continue; // Items don't move
        
        // Simple AI: If close and visible, move towards player
        let dist = Math.abs(e.x - player.x) + Math.abs(e.y - player.y);
        
        // Only act if active (within some range)
        if (dist < 15) { 
            let dx = 0; 
            let dy = 0;
            if (e.x < player.x) dx = 1;
            else if (e.x > player.x) dx = -1;
            
            if (e.y < player.y) dy = 1;
            else if (e.y > player.y) dy = -1;
            
            // Try diagonal, then axis
            let tx = e.x + dx;
            let ty = e.y + dy;
            
            // Very dumb pathfinding: just try to reduce distance
            let blocked = isPassable(tx, ty);
            
            if (blocked === player) {
                attack(e, player);
            } else if (blocked === true) {
                 // Move diagonal
                e.x = tx; e.y = ty;
            } else {
                // Try X only
                if (isPassable(e.x + dx, e.y) === true) e.x += dx;
                // Else Try Y only
                else if (isPassable(e.x, e.y + dy) === true) e.y += dy;
            }
        }
    }
}

// ==========================================
// VISUALS & RENDERING
// ==========================================

function updateFogOfWar() {
    // Reset visible
    for(let y=0; y<ROWS; y++) {
        for(let x=0; x<COLS; x++) {
            map[y][x].visible = false;
        }
    }
    
    // Raycast or Distance Check
    const SIGHT = 8; // Radius
    for(let y = -SIGHT; y <= SIGHT; y++) {
        for(let x = -SIGHT; x <= SIGHT; x++) {
            let tx = player.x + x;
            let ty = player.y + y;
            if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
                if (x*x + y*y <= SIGHT*SIGHT) { // Circle
                     map[ty][tx].visible = true;
                     map[ty][tx].seen = true;
                }
            }
        }
    }
}

function drawMap() {
    push();
    translate(X_OFFSET, Y_OFFSET);
    textSize(CELL_SIZE);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            let cell = map[y][x];
            let px = x * CELL_SIZE + CELL_SIZE/2;
            let py = y * CELL_SIZE + CELL_SIZE/2;
            
            if (cell.visible) {
                fill(cell.color);
                text(cell.char, px, py);
            } else if (cell.seen) {
                fill('#222'); // Dimmed memory
                text(cell.char, px, py);
            }
        }
    }
    pop();
}

function drawEntities() {
    push();
    translate(X_OFFSET, Y_OFFSET);
    textSize(CELL_SIZE);
    
    // Draw Loot & Monsters
    for (let e of entities) {
        // Only draw if visible
        if (map[e.y][e.x].visible) {
            let px = e.x * CELL_SIZE + CELL_SIZE/2;
            let py = e.y * CELL_SIZE + CELL_SIZE/2;
            text(e.char, px, py);
        }
    }
    
    // Draw Player
    text(player.char, player.x * CELL_SIZE + CELL_SIZE/2, player.y * CELL_SIZE + CELL_SIZE/2);
    pop();
}

function drawParticles() {
    push();
    translate(X_OFFSET, Y_OFFSET);
    textSize(CELL_SIZE * 0.8);
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        fill(p.color);
        text(p.txt, p.x * CELL_SIZE + CELL_SIZE/2, p.y * CELL_SIZE + CELL_SIZE/2 - p.life/2);
        p.life++;
        if (p.life > 20) particles.splice(i, 1);
    }
    pop();
}

function addParticle(x, y, txt, color) {
    particles.push({x, y, txt, color, life: 0});
}

function drawHUD() {
    // Background for HUD
    fill(0);
    rect(0, height * UI_HEIGHT_RATIO, width, height * (1 - UI_HEIGHT_RATIO));
    
    // Separator Line
    stroke(100);
    line(0, height * UI_HEIGHT_RATIO, width, height * UI_HEIGHT_RATIO);
    noStroke();

    let hudY = height * UI_HEIGHT_RATIO + 20;
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    
    let stats = `HP: ${player.hp}/${player.maxHp}  Lvl: ${player.lvl}  XP: ${player.xp}  Gold: ${player.gold}  Dungeon: ${dungeonLevel}`;
    text(stats, 10, hudY);
    
    let inv = `Potions: ${player.potions} [Q]`;
    text(inv, 10, hudY + 25);
    
    // Messages
    textAlign(RIGHT, TOP);
    for(let i=0; i<Math.min(3, messages.length); i++) {
        fill(messages[i].color);
        text(messages[i].text, width - 10, hudY + (i*20));
    }
}

function logMessage(text, color="#FFF") {
    messages.unshift({text, color});
    if (messages.length > 20) messages.pop();
}

function drawTouchControls() {
    // Only draw if on a touch device OR for testing (always drawing for this demo)
    // Draw Semi-transparent buttons
    for (let key in CONTROLS) {
        let b = CONTROLS[key];
        
        noStroke();
        fill(255, 30);
        if (dist(mouseX, mouseY, b.x, b.y) < b.w) fill(255, 60); // Highlight hover
        
        if (['▲','▼','◀','▶'].includes(b.label)) {
            // Draw Arrow shape or Circle for D-Pad
            ellipse(b.x, b.y, b.w);
        } else {
            // Action buttons
            ellipse(b.x, b.y, b.w);
        }
        
        fill(255, 200);
        textSize(24);
        textAlign(CENTER, CENTER);
        text(b.label, b.x, b.y);
    }
}

function drawTitleScreen() {
    fill('#0f0');
    textSize(40);
    textAlign(CENTER);
    text("ROGUE EMOJI 🏰", width/2, height/3);
    
    textSize(20);
    fill('#fff');
    text("Press ANY KEY to Start", width/2, height/2);
    
    textSize(14);
    fill('#aaa');
    text("Desktop: Arrows/WASD | Mobile: On-Screen", width/2, height/2 + 40);
}

function drawGameOver() {
    fill('#f00');
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", width/2, height/3);
    
    textSize(20);
    fill('#fff');
    text(`Reached Level ${dungeonLevel}`, width/2, height/2);
    text(`Gold: ${player.gold}`, width/2, height/2 + 30);
    
    text("Press R to Restart", width/2, height/2 + 80);
}

function drawHelpScreen() {
    background(0, 0, 0, 240);
    fill('#0ff');
    textSize(30);
    textAlign(CENTER);
    text("HELP / CONTROLS", width/2, 50);
    
    fill('#fff');
    textSize(16);
    textAlign(LEFT);
    let x = width/2 - 150;
    let y = 100;
    let lines = [
        "Move: Arrow Keys / WASD",
        "Interact/Wait: Enter / Space",
        "Potion: Q",
        "Help: H",
        "Console: ^ (Shift+6)",
        "",
        "SYMBOLS:",
        "🧙‍♂️ You",
        "🧟 Monsters",
        "💰 Gold (XP)",
        "🍷 Potion (Heal)",
        "🪜 Stairs",
        "",
        "CONSOLE COMMANDS:",
        "showoff - Reveal Map",
        "killemall - Kill Monsters"
    ];
    
    for(let l of lines) {
        text(l, x, y);
        y += 25;
    }
    
    textAlign(CENTER);
    text("Press H to Close", width/2, height - 50);
}

function drawConsole() {
    if (!consoleOpen) return;
    
    fill(0, 0, 0, 200);
    rect(0, height/2 - 25, width, 50);
    fill(0, 255, 0);
    textAlign(LEFT, CENTER);
    text("> " + consoleBuffer + (frameCount % 60 < 30 ? "_" : ""), 20, height/2);
}

// ==========================================
// INPUT HANDLING
// ==========================================

function keyPressed() {
    if (gameState === "START" || gameState === "GAME_OVER") {
        if (key === 'r' || key === 'R' || gameState === "START") startNewGame();
        return;
    }

    // Console Logic
    if (consoleOpen) {
        if (keyCode === ENTER) {
            processCommand(consoleBuffer);
            consoleOpen = false;
            consoleBuffer = "";
        } else if (keyCode === BACKSPACE) {
            consoleBuffer = consoleBuffer.slice(0, -1);
        } else if (key.length === 1) {
            consoleBuffer += key;
        }
        return;
    }
    
    // Trigger Console
    if (key === '^') {
        consoleOpen = true;
        return;
    }

    if (key === 'h' || key === 'H') {
        gameState = gameState === "HELP" ? "PLAY" : "HELP";
        return;
    }
    
    if (gameState !== "PLAY") return;

    if (keyCode === UP_ARROW || key === 'w') movePlayer(0, -1);
    else if (keyCode === DOWN_ARROW || key === 's') movePlayer(0, 1);
    else if (keyCode === LEFT_ARROW || key === 'a') movePlayer(-1, 0);
    else if (keyCode === RIGHT_ARROW || key === 'd') movePlayer(1, 0);
    else if (key === 'q' || key === 'Q') usePotion('health');
}

function processCommand(cmd) {
    if (cmd === 'showoff') {
        for(let r of map) for(let c of r) { c.visible = true; c.seen = true; }
        logMessage("Map Revealed!", "#0FF");
    } else if (cmd === 'killemall') {
        for(let e of entities) {
            if (e.name !== 'gold' && e.name !== 'potion') e.stats.hp = 0;
            addParticle(e.x, e.y, "💀", "#666");
        }
        // Force cleanup next turn or immediately
        entities = entities.filter(e => e.name === 'gold' || e.name === 'potion');
        logMessage("Smite thee all!", "#F00");
    } else if (cmd === 'sparkle') {
         player.potions++;
         usePotion('sparkle');
    } else {
        logMessage("Unknown command", "#888");
    }
}

function touchStarted() {
    if (gameState === "START" || gameState === "GAME_OVER") {
        startNewGame();
        return false;
    }
    
    if (gameState === "HELP") {
        gameState = "PLAY";
        return false;
    }

    // Check virtual buttons
    for (let key in CONTROLS) {
        let b = CONTROLS[key];
        // Simple circular hit detection
        if (dist(mouseX, mouseY, b.x, b.y) < b.w/2 + 20) { // generous hitbox
            handleVirtualInput(key);
            return false; // Prevent default
        }
    }
    return false;
}

function handleVirtualInput(key) {
    if (gameState !== "PLAY") return;
    
    if (key === 'up') movePlayer(0, -1);
    else if (key === 'down') movePlayer(0, 1);
    else if (key === 'left') movePlayer(-1, 0);
    else if (key === 'right') movePlayer(1, 0);
    else if (key === 'btnA') usePotion('health'); // Potion
    else if (key === 'btnB') gameState = "HELP";
    else if (key === 'btnC') endTurn(); // Wait
}

</script>
</body>
</html>