// sketch.js - Your Emoji Rogue-like Adventure! V8 (Fix Black Screen & Button Layout)

// --- Configurable Stuff & Constants ---
let visibilityRadius = 2;
const minRoomSize = 2;
const maxRoomSize = 7;
const numRoomsTry = 100;
const GOLD_TO_XP_RATIO = 0.5;
const UI_ROWS = 7; // Increased rows reserved for UI and virtual controls
const BUTTON_SIZE = 40; // Standard button size
const ARROW_BUTTON_SIZE = 55; // Larger size for arrow buttons
const DEBUG_MAP_AREA = false; // SET TO true TO DRAW A RED RECTANGLE OVER MAP AREA

// ASCII Wall Characters
const WALL_V = '║'; const WALL_H = '═'; const WALL_TL = '╔'; const WALL_TR = '╗'; const WALL_BL = '╚'; const WALL_BR = '╝'; const WALL_TJ = '╦'; const WALL_BJ = '╩'; const WALL_LJ = '╠'; const WALL_RJ = '╣'; const WALL_X = '╬';

// Monster Definition
const monsterTypes = [
    // name, char, hp, xpValue, damage, minLevel, isUndead?
    { name: 'Giant Rat',   char: '🐀', hp: 3,  xpValue: 5,  damage: 1, minLevel: 1 },
    { name: 'Giant Bat',   char: '🦇', hp: 4,  xpValue: 7,  damage: 1, minLevel: 1 },
    { name: 'Goblin',      char: '👺', hp: 6,  xpValue: 10, damage: 1, minLevel: 1 },
    { name: 'Giant Spider',char: '🕷️', hp: 5,  xpValue: 12, damage: 2, minLevel: 2 },
    { name: 'Skeleton',    char: '💀', hp: 10, xpValue: 30, damage: 2, minLevel: 3, isUndead: true }, // Undead
    { name: 'Wolf',        char: '🐺', hp: 8,  xpValue: 18, damage: 2, minLevel: 3 },
    { name: 'Zombie',      char: '🧟', hp: 15, xpValue: 25, damage: 2, minLevel: 4, isUndead: true }, // Undead
    { name: 'Orc',         char: '👹', hp: 12, xpValue: 25, damage: 3, minLevel: 4 },
    { name: 'Slime',       char: '🦠', hp: 15, xpValue: 20, damage: 1, minLevel: 5 },
    { name: 'Ghost',       char: '👻', hp: 10, xpValue: 40, damage: 3, minLevel: 5, isUndead: true }, // Undead
    { name: 'Ogre',        char: '🦍', hp: 25, xpValue: 50, damage: 4, minLevel: 6 },
    { name: 'Troll',       char: '🧌', hp: 35, xpValue: 70, damage: 5, minLevel: 7 },
    { name: 'DRAGON',      char: '🐉', hp: 100, xpValue: 500, damage: 10, minLevel: 10 }
];

// Item Definitions
const treasureTypes = [
    { char: '💰', name: 'Bag o\' Gold', value: 10 },
    { char: '💎', name: 'Shiny Diamond', value: 50 },
    { char: '👑', name: 'Lost Crown', value: 100 }
];
const potionTypes = [
    { char: '🧪', name: 'Healing Potion', effect: 'heal', power: 15 },
    { char: '✨', name: 'Potion of Purging', effect: 'purgeUndead', power: 10 } // power is range
];

// --- Game State Variables ---
let grid = [];
let cols, rows;
let tileSize = 20;
let player;
let monsters = [];
let items = [];
let stairs = null;
let rooms = [];
let currentLevel = 1;
let messageLog = ["...", "..."];
let maxMessages = 3; // Fewer messages to save space
let showAll = false;
let easterEggInput = '';
let gameState = 'playing'; // 'playing', 'help', 'gameOver', 'easterEggInput', 'error'
let errorMessage = "";
let virtualButtons = [];

// --- Player Definition & XP functions ---
function createPlayer(x, y) {
    return {
        x: x,
        y: y,
        char: '🧑‍🚀',
        hp: 30,
        maxHp: 30,
        inventory: [],
        gold: 0,
        level: 1,
        xp: 0,
        xpToNextLevel: calculateXpForLevel(2),
        baseDamage: 2
    };
}

function calculateXpForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 200;
    return calculateXpForLevel(level - 1) * 2;
}

function calculatePlayerDamage(playerLevel) {
    // Ensure player exists before calculating
    if (!player) return 1; // Default damage if no player
    return player.baseDamage + floor(playerLevel / 3);
}


// --- p5.js Core Functions ---
function setup() {
    textFont('monospace');
    if (windowWidth < tileSize * 15 || windowHeight < tileSize * (15 + UI_ROWS)) { // Check height too
        errorMessage = "Window is too small!"; gameState = 'error';
        createCanvas(max(windowWidth, tileSize * 15), max(windowHeight, tileSize * (15 + UI_ROWS)));
    } else {
        createCanvas(windowWidth, windowHeight);
        calculateGridSize();
        if (cols < 10 || rows < 10) { errorMessage = `Grid (${cols}x${rows}) too small!`; gameState = 'error'; }
        else {
            defineVirtualButtons(); // Define buttons based on size
            startGame();
        }
    }
    console.log(`Setup finished. Initial state: ${gameState}, cols: ${cols}, rows: ${rows}`);
}

function windowResized() {
    console.log("windowResized: Called.");
    let newWidth = max(windowWidth, tileSize * 15);
    let newHeight = max(windowHeight, tileSize * (15 + UI_ROWS));
    resizeCanvas(newWidth, newHeight);
    console.log(`Canvas resized to ${newWidth}x${newHeight}`);

    let oldCols = cols; let oldRows = rows;
    calculateGridSize();

    if (cols < 10 || rows < 10) {
        errorMessage = `Resized window too small (${cols}x${rows})!`; gameState = 'error'; console.error(errorMessage);
        virtualButtons = []; // Clear buttons in error state
    } else {
        defineVirtualButtons(); // Redefine buttons for new size
        if (gameState === 'error') { console.log("Size OK, restarting."); startGame(); }
        else if (gameState !== 'gameOver' && gameState !== 'help') { addMessage("Resized - Regenerating level..."); console.log("Regenerating level..."); generateLevel(); console.log("Regen finished."); }
        else { console.log("Game paused/over, not regenerating."); }
    }
}

function draw() {
    background(0);

    if (gameState === 'error') { drawErrorScreen(); }
    else if (gameState === 'gameOver') { displayGameOver(); }
    else if (gameState === 'help') { drawHelpScreen(); }
    else { // 'playing' or 'easterEggInput'
        updateVisibility();
        drawMap();
        drawItems();
        drawMonsters();
        drawPlayer();
        drawUI();
        // Draw controls only when playing or in easter egg input (to allow cancelling)
        if (gameState === 'playing' || gameState === 'easterEggInput') {
             drawVirtualControls();
        }
        if (gameState === 'easterEggInput') { drawEasterEggInput(); }
    }
}

// --- Input Handling ---
function executePlayerAction(actionFn) {
    if (gameState !== 'playing') return; // Only act when playing

    let turnTaken = actionFn(); // Execute the action (e.g., doPlayerMove)

    // If the action resulted in a turn being taken, let monsters move
    if (turnTaken && gameState === 'playing') { // Check gameState again
        handleMonsterTurns();
        // Check for game over after monsters moved
        if (player && player.hp <= 0 && gameState === 'playing') {
            gameState = 'gameOver';
            player.char = '☠️';
            addMessage("💀 You have died! 💀");
        }
    }
}

function keyPressed() {
    if (gameState === 'error' || gameState === 'gameOver') return;
    if (gameState === 'help') { if (key === 'h' || key === 'H' || keyCode === ESCAPE) { doToggleHelp(); } return; }
    if (gameState === 'easterEggInput') { handleEasterEggInput(key, keyCode); return; }

    // --- gameState must be 'playing' ---
    if (keyCode === UP_ARROW || key === 'k' || key === 'K') { executePlayerAction(() => doPlayerMove(0, -1)); }
    else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') { executePlayerAction(() => doPlayerMove(0, 1)); }
    else if (keyCode === LEFT_ARROW || (key === 'h' && key !== 'H')) { executePlayerAction(() => doPlayerMove(-1, 0)); }
    else if (keyCode === RIGHT_ARROW || key === 'l' || key === 'L') { executePlayerAction(() => doPlayerMove(1, 0)); }
    else if (key === 'q' || key === 'Q') { executePlayerAction(doQuaffPotion); }
    else if (key === 'g' || key === 'G') { executePlayerAction(doGetItem); }
    else if (key === '>' || key === '.') { executePlayerAction(doDescendStairs); }
    else if (key === 'H') { doToggleHelp(); }
    else if (key === '^') { doEnterEasterEggMode(); }
}

function mousePressed() {
    handleTapOrClick(mouseX, mouseY);
    return false; // Prevent default browser action
}

function touchStarted() {
    // Use the first touch point for simplicity
    if (touches.length > 0) {
        handleTapOrClick(touches[0].x, touches[0].y);
    }
    return false; // Prevent default browser action (like scrolling)
}

function handleTapOrClick(px, py) {
     if (gameState !== 'playing' && gameState !== 'easterEggInput') {
         if (gameState === 'help') { /* Optional: Tap outside box to close? */ }
         return;
     }

    let buttonPressed = false;
    for (let btn of virtualButtons) {
        if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
            console.log("Button pressed:", btn.label);
            // Special handling for ESC in easter egg mode
            if (gameState === 'easterEggInput' && btn.keyChar === 'ESC') {
                doCancelEasterEgg(); buttonPressed = true; break;
            }
            // Execute action for playing state
            if (gameState === 'playing') {
                 executePlayerAction(btn.action); buttonPressed = true; break;
            }
        }
    }
}

// --- Game Initialization ---
function calculateGridSize() {
    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - UI_ROWS; // Reserve more space
    cols = max(0, cols);
    rows = max(0, rows);
}

function startGame() {
    console.log("startGame: Called.");
    currentLevel = 1; showAll = false; easterEggInput = ''; errorMessage = "";
    if (!player) { player = createPlayer(0, 0); } // Ensure player exists
    // Reset player stats
    player.level = 1; player.xp = 0; player.xpToNextLevel = calculateXpForLevel(2); player.maxHp = 30; player.hp = player.maxHp; player.baseDamage = 2; player.gold = 0; player.inventory = []; player.char = '🧑‍🚀';
    messageLog = ["Welcome, brave 🧑‍🚀!", "Dungeon Level " + currentLevel + ". Press 'H' for help."];
    gameState = 'playing'; generateLevel();
    if (gameState === 'error') { console.error("startGame: Generation failed immediately."); } else { console.log("startGame: Finished successfully."); }
}

function generateLevel() {
    console.log(`generateLevel (Dungeon Level ${currentLevel}): Started. Grid target: ${cols}x${rows}`);
    if (cols < 10 || rows < 10) { errorMessage = `Grid size too small (${cols}x${rows})`; gameState = 'error'; console.error(errorMessage); return; }
    rooms = []; monsters = []; items = []; stairs = null; grid = new Array(rows);
    for (let r = 0; r < rows; r++) { grid[r] = new Array(cols); for (let c = 0; c < cols; c++) { grid[r][c] = { type: 'wall', char: '#', discovered: false, visible: false, blockMove: true, blockSight: true }; } }
    for (let i = 0; i < numRoomsTry; i++) { createRoom(); } if (rooms.length === 0) { errorMessage = `Failed to place any rooms`; gameState = 'error'; console.error(errorMessage); return; }
    for (let i = 1; i < rooms.length; i++) { let r1=rooms[i], r2=rooms[i-1]; if(!r1||!r2) continue; let x1=floor(r1.x+r1.w/2), y1=floor(r1.y+r1.h/2), x2=floor(r2.x+r2.w/2), y2=floor(r2.y+r2.h/2); createCorridor(x1,y1,x2,y2); }
    if (!player) player = createPlayer(0,0); let startRoom = rooms[0]; player.x = floor(startRoom.x + startRoom.w / 2); player.y = floor(startRoom.y + startRoom.h / 2); player.x = constrain(player.x, 0, cols - 1); player.y = constrain(player.y, 0, rows - 1);
    console.log(`generateLevel: Player placed at ${player.x}, ${player.y}`);
    let endRoom = rooms[rooms.length - 1]; placeStairs(endRoom); if (!stairs) { errorMessage = `Failed to place stairs`; gameState = 'error'; console.error(errorMessage); return; }
    placeEntities(monsters, monsterTypes, floor(rooms.length/3), currentLevel, true); placeEntities(items, treasureTypes, floor(rooms.length*0.5), currentLevel, false); placeEntities(items, potionTypes, floor(rooms.length*0.7), currentLevel, false);
    updateVisibility(); console.log(`generateLevel: Finished. ${rooms.length} rooms, ${monsters.length} monsters.`);
}

// --- Dungeon Generation Helpers ---
function createRoom() {
    let w = floor(random(minRoomSize, maxRoomSize + 1));
    let h = floor(random(minRoomSize, maxRoomSize + 1));
    let x = floor(random(1, max(2, cols - w - 1)));
    let y = floor(random(1, max(2, rows - h - 1)));
    if (x < 0 || y < 0 || x+w >= cols || y+h >= rows) return; // Check validity

    let newRoom = { x: x, y: y, w: w, h: h };
    let overlaps = false;
    for (let otherRoom of rooms) { if (rectOverlap(newRoom, otherRoom, 1)) { overlaps = true; break; } }
    if (!overlaps) {
        for (let r = y; r < y + h; r++) { for (let c = x; c < x + w; c++) {
            // We already checked bounds roughly, but constrain for safety
             if (r >= 0 && r < rows && c >= 0 && c < cols) {
                 grid[r][c] = { type: 'floor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
             }
        } } rooms.push(newRoom);
    }
}

function rectOverlap(r1, r2, padding = 0) {
    return (r1.x < r2.x + r2.w + padding && r1.x + r1.w + padding > r2.x && r1.y < r2.y + r2.h + padding && r1.y + r1.h + padding > r2.y);
}

function createCorridor(x1, y1, x2, y2) {
    x1 = constrain(x1, 0, cols - 1); y1 = constrain(y1, 0, rows - 1); x2 = constrain(x2, 0, cols - 1); y2 = constrain(y2, 0, rows - 1);
    let currentX = x1, currentY = y1;
    while (currentX !== x2) { if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') { grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; } currentX += (x2 > x1) ? 1 : -1; }
    if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') { grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; }
    while (currentY !== y2) { if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') { grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; } currentY += (y2 > y1) ? 1 : -1; }
    if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') { grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; }
}

function placeStairs(room) {
    if (!room) { if (rooms.length > 0) room = random(rooms); else { console.error("No rooms for stairs!"); return; } }
    let placed = false, attempts = 0; while (!placed && attempts < 200) { let sx = floor(random(room.x, room.x + room.w)); let sy = floor(random(room.y, room.y + room.h)); if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type === 'floor') { grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false }; stairs = { x: sx, y: sy }; placed = true; console.log("Stairs placed at", sx, sy); } attempts++; }
    if (!placed) { let sx = floor(room.x + room.w / 2); let sy = floor(room.y + room.h / 2); sx = constrain(sx, 0, cols-1); sy = constrain(sy, 0, rows-1); if (grid[sy][sx].type === 'floor') { grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false }; stairs = { x: sx, y: sy }; console.warn("Fallback stairs center", sx, sy); placed = true; } else { console.error("FATAL: No stairs generated."); stairs = null; } }
}

function placeEntities(entityList, sourceTypes, maxCount, dungeonLevel, skipStartRoom = false) {
    let placedCount = 0, attempts = 0; let startRoom = rooms.length > 0 ? rooms[0] : null;
    let availableTypes = sourceTypes; if (sourceTypes === monsterTypes) { availableTypes = sourceTypes.filter(type => dungeonLevel >= type.minLevel); if (availableTypes.length === 0) return; }
    if (rooms.length === 0) return;
    while (placedCount < maxCount && attempts < maxCount * 20) { let roomIndex = floor(random(rooms.length)); let room = rooms[roomIndex]; if (skipStartRoom && room === startRoom) { attempts++; continue; }
        let ex = floor(random(room.x, room.x + room.w)); let ey = floor(random(room.y, room.y + room.h));
        if (ey >= 0 && ey < rows && ex >= 0 && ex < cols && grid[ey][ex].type === 'floor' && !(player && ex === player.x && ey === player.y) && !(stairs && ex === stairs.x && ey === stairs.y) && !isOccupied(ex, ey)) {
            let type = random(availableTypes); if (!type) { attempts++; continue; }
            let newEntity = { x: ex, y: ey, char: type.char, name: type.name, ...(type.hp && { hp: type.hp, maxHp: type.hp, damage: type.damage, xpValue: type.xpValue, isUndead: type.isUndead || false }), ...(type.value && { value: type.value, type: 'treasure' }), ...(type.effect && { effect: type.effect, power: type.power, type: 'potion' }) };
            entityList.push(newEntity); placedCount++; } attempts++; }
}

function isOccupied(x, y) {
    for (let m of monsters) { if (m.x === x && m.y === y) return true; } for (let i of items) { if (i.x === x && i.y === y) return true; } return false;
}

// --- Drawing Functions ---
function isWallOrBoundary(c, r) {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return true; if (!grid || !grid[r] || !grid[r][c]) return true; return grid[r][c].type === 'wall';
}

function drawMap() {
    if (frameCount < 5 || frameCount % 300 === 0) { console.log(`drawMap: Drawing grid ${cols}x${rows}. Player at ${player ? player.x : '?'},${player ? player.y : '?'}`); }
    if (DEBUG_MAP_AREA) { push(); fill(50, 0, 0, 150); noStroke(); rect(0, 0, cols * tileSize, rows * tileSize); pop(); }
    textAlign(CENTER, CENTER); textSize(tileSize * 0.85);
    for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { if (!grid || !grid[r] || !grid[r][c]) continue;
        let tile = grid[r][c]; let x = c * tileSize + tileSize / 2; let y = r * tileSize + tileSize / 2; let charToDraw = '?'; let tileColor = color(50);
        let isVisible = showAll || tile.visible; let isDiscovered = tile.discovered; if (!isVisible && !isDiscovered) continue;
        if (isVisible) { if (tile.type === 'wall') tileColor = color(200, 200, 200); else if (tile.type === 'floor') tileColor = color(100, 100, 100); else if (tile.type === 'corridor') tileColor = color(130, 110, 90); else if (tile.type === 'stairs') tileColor = color(255, 255, 0); else tileColor = color(200); }
        else { if (tile.type === 'wall') tileColor = color(100, 100, 100); else if (tile.type === 'floor') tileColor = color(50, 50, 50); else if (tile.type === 'corridor') tileColor = color(60, 50, 40); else if (tile.type === 'stairs') tileColor = color(100, 100, 0); else tileColor = color(50); }
        if (tile.type === 'wall') { let wallAbove=isWallOrBoundary(c,r-1), wallBelow=isWallOrBoundary(c,r+1), wallLeft=isWallOrBoundary(c-1,r), wallRight=isWallOrBoundary(c+1,r); let code = (wallAbove*1)|(wallBelow*2)|(wallLeft*4)|(wallRight*8);
            switch (code) { case 0: charToDraw = '█'; break; case 1: case 2: case 3: charToDraw = WALL_V; break; case 4: case 8: case 12: charToDraw = WALL_H; break; case 5: charToDraw = WALL_BR; break; case 6: charToDraw = WALL_TR; break; case 7: charToDraw = WALL_RJ; break; case 9: charToDraw = WALL_BL; break; case 10: charToDraw = WALL_TL; break; case 11: charToDraw = WALL_LJ; break; case 13: charToDraw = WALL_BJ; break; case 14: charToDraw = WALL_TJ; break; case 15: charToDraw = WALL_X; break; default: charToDraw = '?'; } if(code === 0) charToDraw = '█';
        } else if (tile.type === 'floor' || tile.type === 'corridor') { charToDraw = '.'; } else if (tile.type === 'stairs') { charToDraw = '🔽'; } else { charToDraw = tile.char; }
        fill(tileColor); text(charToDraw, x, y); } }
}

function drawPlayer() {
    if (!player) return; fill(255); textAlign(CENTER, CENTER); textSize(tileSize * 0.8); text(player.char, player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
}

function drawMonsters() {
     fill(255, 100, 100); textAlign(CENTER, CENTER); textSize(tileSize * 0.8);
     for (let monster of monsters) { let monsterVisible = showAll; if (!monsterVisible && grid && grid[monster.y] && grid[monster.y][monster.x]) monsterVisible = grid[monster.y][monster.x].visible; if (monsterVisible) { text(monster.char, monster.x * tileSize + tileSize / 2, monster.y * tileSize + tileSize / 2); } }
}

function drawItems() {
     textAlign(CENTER, CENTER); textSize(tileSize * 0.8);
     for (let item of items) { let itemVisible = showAll; if (!itemVisible && grid && grid[item.y] && grid[item.y][item.x]) itemVisible = grid[item.y][item.x].visible; if(itemVisible) { if (item.type === 'treasure') fill(255, 215, 0); else if (item.type === 'potion') fill(0, 255, 255); else fill(200); text(item.char, item.x * tileSize + tileSize / 2, item.y * tileSize + tileSize / 2); } }
}

function drawUI() {
    let uiY = rows * tileSize; let statsEndY = uiY + 35; let msgY = statsEndY + 5; let msgMaxHeight = UI_ROWS * tileSize - (statsEndY - uiY) - 5;
    fill(0); noStroke(); rect(0, uiY, width, height - uiY); fill(20, 20, 20); rect(0, uiY, width, statsEndY - uiY);
    if (!player) return;
    let line1Y = uiY + 5; let hpBarWidth=150, barHeight=15; fill(100,0,0); rect(10,line1Y,hpBarWidth,barHeight); fill(0,200,0); let currentHpWidth=map(player.hp,0,player.maxHp,0,hpBarWidth); rect(10,line1Y,max(0,currentHpWidth),barHeight); fill(255); textSize(14); textAlign(LEFT,TOP); text(`HP: ${player.hp}/${player.maxHp} | Lvl: ${player.level} | D Lvl: ${currentLevel} | Gold: ${player.gold}`, 15+hpBarWidth, line1Y);
    let line2Y = uiY + 23; let xpBarWidth=150; fill(50,50,100); rect(10,line2Y,xpBarWidth,barHeight); fill(100,100,255); let currentXpWidth=0; if(player.level<36 && player.xpToNextLevel > 0) { currentXpWidth=map(player.xp,0,player.xpToNextLevel,0,xpBarWidth); } else if (player.level>=36) { currentXpWidth=xpBarWidth; } rect(10,line2Y,max(0,currentXpWidth),barHeight); fill(255); textAlign(LEFT,TOP); let xpText=`XP: ${player.xp}/${player.xpToNextLevel}`; if(player.level>=36) xpText="XP: MAX LEVEL"; text(xpText, 15+xpBarWidth, line2Y);
    textSize(12); textAlign(LEFT, TOP); let linesDrawn = 0;
    for (let i = 0; i < messageLog.length; i++) { let currentMsgY = msgY + linesDrawn * 14; if (currentMsgY + 14 <= uiY + UI_ROWS * tileSize) { fill(200); text(messageLog[i], 10, currentMsgY); linesDrawn++; } else { break; } }
}

function addMessage(msg) {
    console.log("Message:", msg); messageLog.unshift(msg); if (messageLog.length > maxMessages) { messageLog.pop(); }
}

function drawEasterEggInput() {
    let boxWidth = 300; let boxHeight = 40; let boxX = width / 2 - boxWidth / 2; let boxY = height / 2 - boxHeight / 2;
    fill(50, 50, 150, 200); stroke(255); rect(boxX, boxY, boxWidth, boxHeight); fill(255); noStroke(); textSize(16); textAlign(LEFT, CENTER); text(`> ${easterEggInput}_`, boxX + 10, boxY + boxHeight / 2);
}

function drawHelpScreen() {
    fill(0, 0, 0, 200); noStroke(); rect(0, 0, width, height); fill(255); textSize(24); textAlign(CENTER, CENTER); text("--- Controls & Help ---", width / 2, height * 0.15); textSize(16); textAlign(LEFT, TOP);
    let helpText = `\n    Movement / Attack:\n        Arrow Keys or H, J, K, L\n        On-Screen Buttons\n\n    Actions:\n        G / [G] Button: Get item\n        Q / [Q] Button: Quaff potion\n        > / [>] Button: Use stairs\n\n    Other:\n        H / [H] Button: Toggle Help\n        ^ / [^] Button: Easter Egg Mode\n        [Esc] Button: Cancel Easter Egg\n\n    Goal:\n        Descend, defeat monsters, get loot,\n        level up, and survive! Good luck!\n\n    (Press H, ESC, or [H] Button to close)\n    `;
    text(helpText, width * 0.2, height * 0.25, width * 0.6, height * 0.6);
}

function displayGameOver() {
    fill(150, 0, 0, 200); noStroke(); rect(0, 0, width, height); fill(255); textSize(48); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 2 - 40); textSize(24);
    let playerLevelStr = player ? player.level : '?'; let playerGoldStr = player ? player.gold : '?'; text(`You reached player level ${playerLevelStr} on dungeon level ${currentLevel}.`, width / 2, height / 2 + 10); text(`Final Gold: ${playerGoldStr}.`, width / 2, height / 2 + 40);
    textSize(18); text("Press F5 or Refresh to play again!", width / 2, height / 2 + 80); noLoop();
}

function drawErrorScreen() {
    background(30, 0, 0); fill(255, 100, 100); textSize(24); textAlign(CENTER, CENTER); text("ERROR", width / 2, height * 0.3); textSize(16);
    text(errorMessage, width / 2, height * 0.5, width * 0.8, height * 0.4); textSize(14); text("Please resize the window to be larger or refresh the page (F5).", width/2, height*0.8);
}

// --- Virtual Controls ---
function drawVirtualControls() {
    for (let btn of virtualButtons) { stroke(200); fill(50, 50, 50, 200); rect(btn.x, btn.y, btn.w, btn.h, 5); fill(220); noStroke(); textSize(btn.h * 0.5); textAlign(CENTER, CENTER); text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2); }
}

function defineVirtualButtons() {
    virtualButtons = []; let uiTopY = rows * tileSize; let availableHeight = height - uiTopY; let margin = 10; let btnSize = BUTTON_SIZE; let arrowSize = ARROW_BUTTON_SIZE; let arrowPad = 5;
    // Action Buttons (Right)
    let startX = width - margin - btnSize; let btnY1 = height - margin - btnSize; let btnY0 = btnY1 - btnSize - margin;
    virtualButtons.push({ label: 'Esc', x: startX, y: btnY1, w: btnSize, h: btnSize, action: doCancelEasterEgg, keyChar: 'ESC' }); virtualButtons.push({ label: 'H', x: startX - (btnSize + margin), y: btnY1, w: btnSize, h: btnSize, action: doToggleHelp, keyChar: 'H' }); virtualButtons.push({ label: '^', x: startX - (btnSize + margin) * 2, y: btnY1, w: btnSize, h: btnSize, action: doEnterEasterEggMode, keyChar: '^' });
    virtualButtons.push({ label: '>', x: startX, y: btnY0, w: btnSize, h: btnSize, action: doDescendStairs, keyChar: '>' }); virtualButtons.push({ label: 'Q', x: startX - (btnSize + margin), y: btnY0, w: btnSize, h: btnSize, action: doQuaffPotion, keyChar: 'q' }); virtualButtons.push({ label: 'G', x: startX - (btnSize + margin) * 2, y: btnY0, w: btnSize, h: btnSize, action: doGetItem, keyChar: 'g' });
    // Arrow Buttons (Left - Diamond)
    let arrowClusterHeight = arrowSize * 2 + arrowPad; let arrowClusterTopY = height - margin - arrowClusterHeight;
    let leftArrowX = margin; let midArrowX = leftArrowX + arrowSize + arrowPad; let rightArrowX = midArrowX + arrowSize + arrowPad;
    let topArrowY = arrowClusterTopY; let midArrowY = topArrowY + arrowSize/2 + arrowPad/2; let bottomArrowY = topArrowY + arrowSize + arrowPad;
    virtualButtons.push({ label: '↑', x: midArrowX, y: topArrowY, w: arrowSize, h: arrowSize, action: () => doPlayerMove(0, -1), keyChar: 'k' }); virtualButtons.push({ label: '↓', x: midArrowX, y: bottomArrowY, w: arrowSize, h: arrowSize, action: () => doPlayerMove(0, 1), keyChar: 'j' }); virtualButtons.push({ label: '←', x: leftArrowX, y: midArrowY, w: arrowSize, h: arrowSize, action: () => doPlayerMove(-1, 0), keyChar: 'h' }); virtualButtons.push({ label: '→', x: rightArrowX, y: midArrowY, w: arrowSize, h: arrowSize, action: () => doPlayerMove(1, 0), keyChar: 'l' });
    console.log("Defined virtual buttons. Left arrow X:", leftArrowX);
}

// --- Game Logic ---
function doPlayerMove(dx, dy) {
    if (!player || !grid) return false; let newX=player.x+dx, newY=player.y+dy; if (newX<0||newX>=cols||newY<0||newY>=rows) { addMessage("Ouch! Bumped edge."); return false; } if (!grid[newY]||!grid[newY][newX]) { addMessage("Error: Invalid move target."); return false; } if (grid[newY][newX].blockMove) { addMessage("Bonk! A wall."); return false; } let targetMonster=null; for (let m of monsters) { if (m.x===newX && m.y===newY) { targetMonster=m; break; } } if (targetMonster) { attackMonster(player, targetMonster); return true; } player.x=newX; player.y=newY; if (stairs && newX===stairs.x && newY===stairs.y) { addMessage("Stairs down... ('>' to use)"); } let itemHere=null; for(let i of items) { if(i.x===newX && i.y===newY) { itemHere=i; break; } } if(itemHere) { addMessage(`See a ${itemHere.name} (${itemHere.char}). ('g' to get)`); } return true;
}

function doQuaffPotion() {
    if (!player) return false; let potionToQuaff = null; let potionIndex = -1;
    for (let i=0; i<player.inventory.length; i++) { if (player.inventory[i] && player.inventory[i].type === 'potion') { potionToQuaff = player.inventory[i]; potionIndex = i; break; } }
    if (potionToQuaff) { addMessage(`Quaff ${potionToQuaff.name} (${potionToQuaff.char})...`); if (potionToQuaff.effect === 'heal') { let healAmount=min(player.maxHp-player.hp, potionToQuaff.power); player.hp+=healAmount; addMessage(`+${healAmount} HP`); } else if (potionToQuaff.effect === 'purgeUndead') { let range=potionToQuaff.power; let purgedCount=0; addMessage("A holy light flashes!"); for(let i=monsters.length-1; i>=0; i--){ let m=monsters[i]; if(m.isUndead && dist(player.x,player.y,m.x,m.y)<=range){ addMessage(`The ${m.name} is destroyed!`); monsters.splice(i,1); purgedCount++; } } if(purgedCount===0) addMessage("No nearby undead affected."); else addMessage(`Purged ${purgedCount} undead.`); } else if (potionToQuaff.effect === 'teleport') { addMessage("Woah! Everything spins!"); } else { addMessage("...nothing interesting happens."); } player.inventory.splice(potionIndex, 1); } else { addMessage("No potions to quaff!"); } return true;
}

function doGetItem() {
    if (!player) return false; let itemIndex=-1; for (let i=0; i<items.length; i++) { if (items[i].x===player.x && items[i].y===player.y) { itemIndex = i; break; } }
    if (itemIndex !== -1) { let item=items[itemIndex]; addMessage(`Picked up ${item.name} (${item.char}).`); if(item.type==='treasure'){ player.gold+=item.value; let xpFromGold=floor(item.value*GOLD_TO_XP_RATIO); if(xpFromGold>0){ addMessage(`+${xpFromGold} XP from gold!`); addXP(xpFromGold); } } else if(item.type==='potion'){ player.inventory.push(item); } items.splice(itemIndex, 1); return true; } else { addMessage("Nothing here to get."); return false; }
}

function doDescendStairs() {
    if (!player || !stairs) return false; if (player.x === stairs.x && player.y === stairs.y) { addMessage("You descend deeper..."); currentLevel++; generateLevel(); if (gameState !== 'error') { addMessage(`Welcome to Dungeon Level ${currentLevel}.`); } return false; } else { addMessage("Tried descending not on stairs?"); return false; }
}

function doToggleHelp() {
    if (gameState === 'help') { gameState = 'playing'; addMessage("Resuming game."); } else if (gameState === 'playing') { gameState = 'help'; addMessage("Showing help (H/ESC to close)."); } return false;
}

function doEnterEasterEggMode() {
    if (gameState === 'playing') { gameState = 'easterEggInput'; easterEggInput = ''; addMessage("Enter Easter Egg command:"); } return false;
}

function doCancelEasterEgg() {
    if (gameState === 'easterEggInput') { gameState = 'playing'; easterEggInput = ''; addMessage("Easter egg input cancelled."); } return false;
}

function attackMonster(attacker, target) {
    if (!attacker || !target) return; let damage=calculatePlayerDamage(attacker.level); addMessage(`You attack the ${target.name} (${target.char})!`); target.hp-=damage; addMessage(`The ${target.name} takes ${damage} damage.`); if (target.hp <= 0) { addMessage(`Defeated the ${target.name}! 🎉`); let xpGained=target.xpValue||0; if (xpGained>0) { addMessage(`+${xpGained} XP.`); addXP(xpGained); } monsters = monsters.filter(m => m !== target); }
}

function attackPlayer(attacker, target) {
     if (!attacker || !target) return; let damage = attacker.damage || 1; addMessage(`The ${attacker.name} (${attacker.char}) attacks you!`); target.hp -= damage; addMessage(`You take ${damage} damage.`);
}

function addXP(amount) {
    if (!player || player.level >= 36) return; player.xp += amount; checkLevelUp();
}

function checkLevelUp() {
    if (!player) return; const maxLevel=36; if (player.level >= maxLevel) { if (player.xpToNextLevel !== 0) { addMessage("Max level reached!"); player.xp = 0; player.xpToNextLevel = 0; } return; } while (player.xp >= player.xpToNextLevel && player.level < maxLevel) { player.level++; addMessage(`✨ Ding! Level ${player.level}! ✨`); let hpGain=10+floor(player.level/2); player.maxHp+=hpGain; player.hp=player.maxHp; player.baseDamage += (player.level%3===0)?1:0; addMessage(`Max HP: ${player.maxHp}. Damage up!`); if (player.level>=maxLevel) { addMessage("Max level reached!"); player.xp=0; player.xpToNextLevel=0; break; } else { player.xpToNextLevel=calculateXpForLevel(player.level+1); } }
}

function handleMonsterTurns() {
    if (!player || !grid) return; for (let i = monsters.length - 1; i >= 0; i--) { let monster = monsters[i]; if (!monster) continue; let dx=0, dy=0, distanceToPlayer=dist(monster.x, monster.y, player.x, player.y); if (distanceToPlayer<8 && hasLineOfSight(monster.x,monster.y, player.x,player.y)) { if(player.x > monster.x) dx=1; else if (player.x < monster.x) dx=-1; if(player.y > monster.y) dy=1; else if (player.y < monster.y) dy=-1; if(dx!==0 && dy!==0) { let canMoveH=!isBlocked(monster.x+dx, monster.y); let canMoveV=!isBlocked(monster.x, monster.y+dy); if(!canMoveH && canMoveV) dx=0; else if (canMoveH && !canMoveV) dy=0; else if (!canMoveH && !canMoveV) { if(random()<0.5) dx=0; else dy=0; } } } else { let r=floor(random(5)); if(r===0)dx=1; else if(r===1)dx=-1; else if(r===2)dy=1; else if(r===3)dy=-1; } let newX=monster.x+dx, newY=monster.y+dy; if (newX>=0 && newX<cols && newY>=0 && newY<rows && !isBlocked(newX,newY)) { if (newX===player.x && newY===player.y) { attackPlayer(monster, player); } else if (!isOccupiedByMonster(newX, newY)) { monster.x=newX; monster.y=newY; } } }
}

function isBlocked(x, y) {
    if (x<0||x>=cols||y<0||y>=rows) return true; if (!grid||!grid[y]||!grid[y][x]) return true; return grid[y][x].blockMove;
}

function isOccupiedByMonster(x, y) {
    for(let m of monsters) { if(m.x===x && m.y===y) return true; } return false;
}

function updateVisibility() {
    if (!grid || !player) return; for (let r=0; r<rows; r++) { if (!grid[r]) continue; for (let c=0; c<cols; c++) { if (!grid[r][c]) continue; grid[r][c].visible = false; } } let px=player.x, py=player.y; for (let r=max(0,py-visibilityRadius); r<=min(rows-1,py+visibilityRadius); r++) { if (!grid[r]) continue; for (let c=max(0,px-visibilityRadius); c<=min(cols-1,px+visibilityRadius); c++) { if (!grid[r][c]) continue; let d=dist(px,py,c,r); if (d<=visibilityRadius && hasLineOfSight(px,py,c,r)) { grid[r][c].visible = true; grid[r][c].discovered = true; } } } if (py>=0 && py<rows && px>=0 && px<cols && grid[py] && grid[py][px]) { grid[py][px].visible=true; grid[py][px].discovered=true; }
}

function hasLineOfSight(x0, y0, x1, y1) {
    if (!grid) return false; let dx=abs(x1-x0), dy=-abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1, err=dx+dy; while(true) { if (x0>=0 && x0<cols && y0>=0 && y0<rows && grid[y0] && grid[y0][x0]) { if (grid[y0][x0].blockSight && !(x0===x1 && y0===y1)) return false; } else return false; if (x0===x1 && y0===y1) break; let e2=2*err; if(e2>=dy){err+=dy; x0+=sx;} if(e2<=dx){err+=dx; y0+=sy;} } return true;
}

// --- Easter Egg Handling ---
function handleEasterEggInput(key, keyCode) {
    if(keyCode===ENTER){ processEasterEgg(easterEggInput); if (gameState === 'easterEggInput') gameState='playing'; easterEggInput=''; } else if(keyCode===BACKSPACE){ easterEggInput=easterEggInput.slice(0,-1); } else if(keyCode===ESCAPE){ doCancelEasterEgg(); } else if(key.length===1 && easterEggInput.length<30){ easterEggInput+=key; }
}

function processEasterEgg(command) {
    if (!player && ['healme', 'goldpls', 'levelup', 'godmode', 'die'].includes(command)) { addMessage("Player cheat needs player!"); return; }
    command = command.toLowerCase().trim(); addMessage(`Easter Egg: "${command}"`);
    if (command === "showoff") { showAll = !showAll; addMessage(showAll?"Revealed!":"Hiding map."); }
    else if (command === "killemall") { addMessage("Begone!"); monsters = []; }
    else if (command === "healme") { player.hp = player.maxHp; addMessage("Refreshed!"); }
    else if (command === "goldpls") { player.gold += 1000; addMessage("💰💰💰 Bling! 💰💰💰"); }
    else if (command === "levelup") { if (player.level < 36) { if (player.xpToNextLevel > 0) { addXP(player.xpToNextLevel - player.xp); addMessage("Level up!"); } else { addMessage("Cannot level up?"); } } else { addMessage("Max level!"); } }
    else if (command === "godmode") { player.hp = 9999; player.maxHp = 9999; player.baseDamage = 100; addMessage("DEUS VULT!"); }
    else if (command === "die") { player.hp = 0; addMessage("You feel unwell..."); }
    else { addMessage("Nothing happens..."); }
}
