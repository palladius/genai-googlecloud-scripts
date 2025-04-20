// sketch.js - Your Emoji Rogue-like Adventure! V3 (ASCII Walls!)

// --- Configurable Stuff ---
// (Unchanged)
let visibilityRadius = 2;
const minRoomSize = 2;
const maxRoomSize = 7;
const numRoomsTry = 100;

// --- NEW: ASCII Wall Characters ---
const WALL_V = '║'; // Double vertical
const WALL_H = '═'; // Double horizontal
const WALL_TL = '╔';
const WALL_TR = '╗';
const WALL_BL = '╚';
const WALL_BR = '╝';
const WALL_TJ = '╦'; // T-Junction Down
const WALL_BJ = '╩'; // T-Junction Up
const WALL_LJ = '╠'; // T-Junction Right
const WALL_RJ = '╣'; // T-Junction Left
const WALL_X = '╬'; // Cross

// --- Monster Definition (Added Troll) ---
const monsterTypes = [
    { name: 'Giant Rat',   char: '🐀', hp: 3,  xpValue: 5,  damage: 1, minLevel: 1 },
    { name: 'Goblin',      char: '👺', hp: 6,  xpValue: 10, damage: 1, minLevel: 1 },
    { name: 'Giant Spider',char: '🕷️', hp: 5,  xpValue: 12, damage: 2, minLevel: 2 },
    { name: 'Orc',         char: '👹', hp: 12, xpValue: 25, damage: 3, minLevel: 3 },
    { name: 'Wolf',        char: '🐺', hp: 8,  xpValue: 18, damage: 2, minLevel: 3 },
    { name: 'Slime',       char: '🦠', hp: 15, xpValue: 20, damage: 1, minLevel: 4 },
    { name: 'Ogre',        char: '🦍', hp: 25, xpValue: 50, damage: 4, minLevel: 5 },
    { name: 'Skeleton',    char: '💀', hp: 10, xpValue: 30, damage: 2, minLevel: 6 },
    { name: 'Troll',       char: '🧌', hp: 35, xpValue: 70, damage: 5, minLevel: 7 }, // ADDED TROLL
    { name: 'DRAGON',      char: '🐉', hp: 100, xpValue: 500, damage: 10, minLevel: 10 }
];

// --- Item Definitions (Unchanged) ---
const treasureTypes = [
    { char: '💰', name: 'Bag o\' Gold', value: 10 },
    { char: '💎', name: 'Shiny Diamond', value: 50 },
    { char: '👑', name: 'Lost Crown', value: 100 }
];
const potionTypes = [
    { char: '🧪', name: 'Healing Potion', effect: 'heal', power: 15 },
    { char: '✨', name: 'Sparkle Potion', effect: 'teleport', power: 0 }
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
let messageLog = ["Welcome, brave 🧑‍🚀!", "Press 'H' for help."];
let maxMessages = 5;
let showAll = false; // Easter egg flag
let easterEggInput = '';

// --- NEW: Game State Machine ---
let gameState = 'playing'; // 'playing', 'help', 'gameOver', 'easterEggInput'

// --- Player Definition (Unchanged) ---
function createPlayer(x, y) {
    return {
        x: x, y: y, char: '🧑‍🚀', hp: 30, maxHp: 30,
        inventory: [], gold: 0, level: 1, xp: 0,
        xpToNextLevel: calculateXpForLevel(2), // Initial XP needed
        baseDamage: 2
    };
}

// (calculateXpForLevel, calculatePlayerDamage functions unchanged)
function calculateXpForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 200;
    return calculateXpForLevel(level - 1) * 2;
}
function calculatePlayerDamage(playerLevel) {
    return player.baseDamage + floor(playerLevel / 3);
}


// --- p5.js Core Functions ---
function setup() {
    // --- MODIFIED: Use a specific font that supports box chars well ---
    // Common monospace fonts: 'Courier New', 'Consolas', 'Menlo', 'Monaco', 'monospace'
    // Using 'monospace' is generally safest for cross-browser compatibility.
    // You might need to experiment if box chars don't align perfectly.
    textFont('monospace');
    createCanvas(windowWidth, windowHeight);
    calculateGridSize();
    startGame();
}

function windowResized() {
    // --- MODIFIED: Regenerate level on resize ---
    resizeCanvas(windowWidth, windowHeight);
    let oldCols = cols;
    let oldRows = rows;
    calculateGridSize();
    // Only regenerate if grid size actually changed significantly
    if (abs(cols - oldCols) > 1 || abs(rows - oldRows) > 1) {
        addMessage("Screen resized - Regenerating level...");
        console.log("Window resized, regenerating level.");
        generateLevel(); // Regenerate the level to fit the new size
    } else {
        console.log("Window resized slightly, not regenerating.");
    }
}

function draw() {
    background(0); // Black background

    // --- MODIFIED: State-based drawing ---
    if (gameState === 'gameOver') {
        displayGameOver();
    } else if (gameState === 'help') {
        // Optionally draw the game dimly underneath help?
        // drawMap(); drawItems(); drawMonsters(); drawPlayer(); drawUI(); // Draw dim game?
        drawHelpScreen();
    } else { // Includes 'playing' and 'easterEggInput'
        updateVisibility();
        drawMap();
        drawItems();
        drawMonsters();
        drawPlayer();
        drawUI();

        if (gameState === 'easterEggInput') {
            drawEasterEggInput();
        }
    }
}

function keyPressed() {
    // --- MODIFIED: State-based input handling ---

    if (gameState === 'gameOver') {
        // Maybe allow restart on Enter? For now, only F5 works.
        return;
    }

    if (gameState === 'help') {
        if (key === 'h' || key === 'H' || keyCode === ESCAPE) {
            gameState = 'playing'; // Exit help
            addMessage("Resuming game.");
        }
        return; // Ignore other keys in help mode
    }

    if (gameState === 'easterEggInput') {
        handleEasterEggInput(key, keyCode);
        return; // Easter egg input handled separately
    }

    // --- gameState === 'playing' ---
    let playerTurnTaken = false;

    if (keyCode === UP_ARROW || key === 'k' || key === 'K') {
        playerTurnTaken = movePlayer(0, -1);
    } else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') {
        playerTurnTaken = movePlayer(0, 1);
    } else if (keyCode === LEFT_ARROW || (key === 'h' && key !== 'H')) { // 'h' moves left, 'H' is help
        playerTurnTaken = movePlayer(-1, 0);
    } else if (keyCode === RIGHT_ARROW || key === 'l' || key === 'L') {
        playerTurnTaken = movePlayer(1, 0);
    } else if (key === 'q' || key === 'Q') {
        quaffPotion();
        playerTurnTaken = true;
    } else if (key === 'g' || key === 'G') {
        pickUpItem();
        playerTurnTaken = true;
    } else if (key === '>' || key === '.') {
        if (stairs && player.x === stairs.x && player.y === stairs.y) {
            descendStairs();
            // Descending starts the next level, no monster turn on this one.
            playerTurnTaken = false; // Don't trigger monster turns after descending
        } else {
             addMessage("You aren't on the stairs ('>').");
             playerTurnTaken = false; // Failed action doesn't cost a turn
        }
    } else if (key === 'H') { // Help key (Case sensitive H only)
        gameState = 'help';
        addMessage("Showing help screen (H/ESC to close).");
        playerTurnTaken = false; // Viewing help doesn't take a turn
    } else if (key === '^') {
        gameState = 'easterEggInput';
        easterEggInput = '';
        addMessage("Enter Easter Egg command:");
        playerTurnTaken = false; // Entering input mode doesn't take a turn
    }
    // --- Add other commands here! ---
    // else if (key === 'i' || key === 'I') { displayInventory(); playerTurnTaken = false; } // Example

    // --- Monster Turn ---
    if (playerTurnTaken && gameState === 'playing') { // Ensure game is still playing after action
        handleMonsterTurns();
    }
    // --- Check for Game Over after Monster Turn ---
    if (player.hp <= 0 && gameState !== 'gameOver') {
        // Monster turn might have killed the player
        addMessage(`💀 You have succumbed to your wounds! 💀`);
        player.char = '☠️';
        gameState = 'gameOver';
    }

    // return false; // Optional: Prevent default browser actions
}

// --- Game Initialization ---
function calculateGridSize() {
    // (Unchanged)
    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - 5;
    if (cols < 10 || rows < 10) {
        console.error("Screen too small for a playable grid!");
    }
}

function startGame() {
    // (Unchanged except for gameState)
    currentLevel = 1;
    gameState = 'playing'; // Start in playing state
    showAll = false;
    easterEggInput = '';

    if (player) {
        player.level = 1;
        player.xp = 0;
        player.xpToNextLevel = calculateXpForLevel(2);
        player.maxHp = 30;
        player.hp = player.maxHp;
        player.baseDamage = 2;
        player.gold = 0;
        player.inventory = [];
    } else {
        // Player needs initial placement before first generateLevel if it doesn't exist
        // This is handled within generateLevel now
    }
    messageLog = ["Welcome, brave 🧑‍🚀!", "Dungeon Level " + currentLevel + ". Press 'H' for help."];
    generateLevel();
}

function generateLevel() {
    // --- MODIFIED: Set wall char to placeholder initially ---
    // The actual character is determined during drawing based on neighbors.
    console.log("Generating Dungeon Level", currentLevel);
    rooms = [];
    monsters = [];
    items = [];
    stairs = null;

    grid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        grid[r] = new Array(cols);
        for (let c = 0; c < cols; c++) {
            // Use a generic wall char initially, or just rely on type
            grid[r][c] = { type: 'wall', char: '#', discovered: false, visible: false, blockMove: true, blockSight: true };
        }
    }

    for (let i = 0; i < numRoomsTry; i++) { createRoom(); }
    if (rooms.length === 0) { console.error("Failed to place rooms!"); generateLevel(); return; }

    for (let i = 1; i < rooms.length; i++) {
        let r1 = rooms[i], r2 = rooms[i-1];
        let x1 = floor(r1.x + r1.w/2), y1 = floor(r1.y + r1.h/2);
        let x2 = floor(r2.x + r2.w/2), y2 = floor(r2.y + r2.h/2);
        createCorridor(x1, y1, x2, y2);
    }

    let startRoom = rooms[0];
    let playerStartX = floor(startRoom.x + startRoom.w / 2);
    let playerStartY = floor(startRoom.y + startRoom.h / 2);
    if (!player) { player = createPlayer(playerStartX, playerStartY); }
    else { player.x = playerStartX; player.y = playerStartY; }

    let endRoom = rooms[rooms.length - 1];
    placeStairs(endRoom);

    let maxMonsters = floor(rooms.length / 3);
    placeEntities(monsters, monsterTypes, maxMonsters, currentLevel, true);

    placeEntities(items, treasureTypes, floor(rooms.length * 0.5), currentLevel, false);
    placeEntities(items, potionTypes, floor(rooms.length * 0.7), currentLevel, false);

    updateVisibility();
    console.log("Level generation complete. Player at:", player.x, player.y);
}


// --- Dungeon Generation Helpers ---
// (createRoom, rectOverlap, createCorridor, placeStairs, placeEntities unchanged from V2)
// ... (Keep the V2 versions of these functions) ...
function createRoom() {
    let w = floor(random(minRoomSize, maxRoomSize + 1));
    let h = floor(random(minRoomSize, maxRoomSize + 1));
    let x = floor(random(1, cols - w - 1));
    let y = floor(random(1, rows - h - 1));
    let newRoom = { x: x, y: y, w: w, h: h };
    let overlaps = false;
    for (let otherRoom of rooms) {
        if (rectOverlap(newRoom, otherRoom, 1)) { overlaps = true; break; }
    }
    if (!overlaps) {
        for (let r = y; r < y + h; r++) {
            for (let c = x; c < x + w; c++) {
                 if (r >= 0 && r < rows && c >= 0 && c < cols) {
                     grid[r][c] = { type: 'floor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
                 }
            }
        }
        rooms.push(newRoom);
    }
}
function rectOverlap(r1, r2, padding = 0) {
    return (r1.x < r2.x + r2.w + padding && r1.x + r1.w + padding > r2.x && r1.y < r2.y + r2.h + padding && r1.y + r1.h + padding > r2.y);
}
function createCorridor(x1, y1, x2, y2) {
    let currentX = x1, currentY = y1;
    while (currentX !== x2) {
        if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
            grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
        } else if (currentX < 0 || currentX >= cols || currentY < 0 || currentY >= rows) { break; }
        currentX += (x2 > x1) ? 1 : -1;
    }
    if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
        grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
    }
    while (currentY !== y2) {
        if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
            grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
        } else if (currentX < 0 || currentX >= cols || currentY < 0 || currentY >= rows) { break; }
        currentY += (y2 > y1) ? 1 : -1;
    }
    if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
         grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
    }
}
function placeStairs(room) {
    if (!room) {
        console.error("Cannot place stairs in null room!");
        if (rooms.length > 0) room = random(rooms); else { console.error("FATAL: No rooms!"); return; }
    }
     let placed = false, attempts = 0;
     while (!placed && attempts < 100) {
         let sx = floor(random(room.x, room.x + room.w)), sy = floor(random(room.y, room.y + room.h));
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type === 'floor') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy }; placed = true; console.log("Stairs placed at", sx, sy);
         } attempts++;
     }
     if (!placed) {
         console.error("Failed to place stairs in room!", room);
         let sx = floor(room.x + room.w / 2), sy = floor(room.y + room.h / 2);
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type !== 'wall') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy }; console.warn("Fallback: Placed stairs at room center", sx, sy);
         } else { console.error("FATAL: Could not place stairs anywhere in the room."); }
     }
}
function placeEntities(entityList, sourceTypes, maxCount, dungeonLevel, skipStartRoom = false) {
    let placedCount = 0, attempts = 0;
    let startRoom = rooms.length > 0 ? rooms[0] : null;
    let availableTypes = sourceTypes;
    if (sourceTypes === monsterTypes) {
        availableTypes = sourceTypes.filter(type => dungeonLevel >= type.minLevel);
        if (availableTypes.length === 0) { console.warn(`No suitable monsters for level ${dungeonLevel}`); return; }
    }
    while (placedCount < maxCount && attempts < maxCount * 20 && rooms.length > 0) {
        let roomIndex = floor(random(rooms.length));
        let room = rooms[roomIndex];
        if (skipStartRoom && room === startRoom) { attempts++; continue; }
        let ex = floor(random(room.x, room.x + room.w)), ey = floor(random(room.y, room.y + room.h));
        if (ey >= 0 && ey < rows && ex >= 0 && ex < cols && grid[ey][ex].type === 'floor' && !(player && ex === player.x && ey === player.y) && !(stairs && ex === stairs.x && ey === stairs.y) && !isOccupied(ex, ey)) {
            let type = random(availableTypes);
            let newEntity = { x: ex, y: ey, char: type.char, name: type.name,
                 ...(type.hp && { hp: type.hp, maxHp: type.hp, damage: type.damage, xpValue: type.xpValue }),
                ...(type.value && { value: type.value, type: 'treasure' }),
                ...(type.effect && { effect: type.effect, power: type.power, type: 'potion' }) };
            entityList.push(newEntity); placedCount++;
        } attempts++;
    }
}

// (isOccupied function unchanged)
function isOccupied(x, y) {
    for (let m of monsters) { if (m.x === x && m.y === y) return true; }
    for (let i of items) { if (i.x === x && i.y === y) return true; }
    return false;
}

// --- Drawing Functions ---

// --- HELPER for ASCII Walls: Checks if a coord is a wall or out of bounds ---
function isWallOrBoundary(c, r) {
    if (c < 0 || c >= cols || r < 0 || r >= rows) {
        return true; // Treat out of bounds as walls for drawing purposes
    }
    // Also consider floor/corridor tiles adjacent to the edge of the map as boundaries sometimes? No, keep it simple.
    return grid[r][c].type === 'wall';
}

function drawMap() {
    // --- SIGNIFICANTLY MODIFIED for ASCII WALLS ---
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.9); // Adjust text size for ASCII maybe

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = grid[r][c];
            let x = c * tileSize + tileSize / 2;
            let y = r * tileSize + tileSize / 2;

            let charToDraw = '?'; // Default fallback
            let tileColor = color(50); // Default dark grey

            // Determine visibility first
            let isVisible = showAll || tile.visible;
            let isDiscovered = tile.discovered;

            if (!isVisible && !isDiscovered) {
                continue; // Don't draw anything if not discovered
            }

            // Determine Color based on visibility/discovery
            if (isVisible) {
                // Use brighter colors for visible tiles
                if (tile.type === 'wall') tileColor = color(200, 200, 200); // Bright White/Grey walls
                else if (tile.type === 'floor') tileColor = color(100, 100, 100);
                else if (tile.type === 'corridor') tileColor = color(130, 110, 90);
                else if (tile.type === 'stairs') tileColor = color(255, 255, 0);
                else tileColor = color(200); // Fallback visible
            } else { // Must be discovered but not visible
                if (tile.type === 'wall') tileColor = color(100, 100, 100); // Dim Grey walls
                else if (tile.type === 'floor') tileColor = color(50, 50, 50);
                else if (tile.type === 'corridor') tileColor = color(60, 50, 40);
                else if (tile.type === 'stairs') tileColor = color(100, 100, 0);
                else tileColor = color(50); // Fallback discovered
            }

            // Determine Character based on type and neighbors (for walls)
            if (tile.type === 'wall') {
                // Check neighbors using the helper function
                let wallAbove = isWallOrBoundary(c, r - 1);
                let wallBelow = isWallOrBoundary(c, r + 1);
                let wallLeft = isWallOrBoundary(c - 1, r);
                let wallRight = isWallOrBoundary(c + 1, r);

                // Determine the correct character based on connections
                let code = (wallAbove ? 1 : 0) | (wallBelow ? 2 : 0) | (wallLeft ? 4 : 0) | (wallRight ? 8 : 0);

                switch (code) {
                    case 0: charToDraw = WALL_X; break; // Isolated wall? Should not happen in dungeon? Maybe draw as '.' or space? Or fallback X.
                    case 1: charToDraw = WALL_V; break;  // Wall above only -> Vertical going up
                    case 2: charToDraw = WALL_V; break;  // Wall below only -> Vertical going down
                    case 3: charToDraw = WALL_V; break;  // Wall above and below -> Vertical line
                    case 4: charToDraw = WALL_H; break;  // Wall left only -> Horizontal going left
                    case 5: charToDraw = WALL_BR; break; // Wall above and left -> Bottom-right corner
                    case 6: charToDraw = WALL_TR; break; // Wall below and left -> Top-right corner
                    case 7: charToDraw = WALL_RJ; break; // Wall above, below, and left -> T-junction facing right
                    case 8: charToDraw = WALL_H; break;  // Wall right only -> Horizontal going right
                    case 9: charToDraw = WALL_BL; break; // Wall above and right -> Bottom-left corner
                    case 10: charToDraw = WALL_TL; break;// Wall below and right -> Top-left corner
                    case 11: charToDraw = WALL_LJ; break;// Wall above, below, and right -> T-junction facing left
                    case 12: charToDraw = WALL_H; break; // Wall left and right -> Horizontal line
                    case 13: charToDraw = WALL_BJ; break;// Wall above, left, and right -> T-junction facing down
                    case 14: charToDraw = WALL_TJ; break;// Wall below, left, and right -> T-junction facing up
                    case 15: charToDraw = WALL_X; break; // All four neighbors are walls -> Cross junction
                    default: charToDraw = '?'; // Should not happen
                }
                 // Exception: Sometimes a wall is next to non-wall but shouldn't connect
                 // Example: A 1-tile thick wall. The logic above might make it look like a line.
                 // Refinement: If a wall has NO wall neighbours, maybe draw it as '#' or skip?
                 if (code === 0) {
                      // This should only happen if a wall is isolated in empty space.
                      // Or if it's technically adjacent only diagonally.
                      // Let's draw it as a solid block maybe? Or the old emoji?
                      charToDraw = '█'; // Block char (U+2588) or keep '?' or '#'
                 }


            } else if (tile.type === 'floor') {
                charToDraw = '.';
            } else if (tile.type === 'corridor') {
                charToDraw = '.'; // Keep corridors as '.'
            } else if (tile.type === 'stairs') {
                charToDraw = '🔽';
            } else {
                charToDraw = tile.char; // Fallback for any other types
            }

            // Draw the determined character with the determined color
            fill(tileColor);
            text(charToDraw, x, y);
        }
    }
}


// (drawPlayer, drawMonsters, drawItems functions unchanged)
function drawPlayer() { /* ... V2 code ... */
    fill(255); textAlign(CENTER, CENTER); textSize(tileSize * 0.8);
    text(player.char, player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
}
function drawMonsters() { /* ... V2 code ... */
    fill(255, 100, 100); textAlign(CENTER, CENTER); textSize(tileSize * 0.8);
     for (let monster of monsters) {
         if (grid[monster.y][monster.x].visible || showAll) {
            text(monster.char, monster.x * tileSize + tileSize / 2, monster.y * tileSize + tileSize / 2);
         }
     }
}
function drawItems() { /* ... V2 code ... */
     textAlign(CENTER, CENTER); textSize(tileSize * 0.8);
     for (let item of items) {
         if (grid[item.y][item.x].visible || showAll) {
            if (item.type === 'treasure') fill(255, 215, 0);
            else if (item.type === 'potion') fill(0, 255, 255);
            else fill(200);
            text(item.char, item.x * tileSize + tileSize / 2, item.y * tileSize + tileSize / 2);
         }
     }
}

// (drawUI function unchanged from V2)
function drawUI() { /* ... V2 code ... */
    let uiY = rows * tileSize; let uiHeight = height - uiY;
    let line1Y = uiY + 5; let line2Y = uiY + 25; let msgY = uiY + 45;
    fill(20, 20, 20); noStroke(); rect(0, uiY, width, uiHeight); // Clear UI
    // HP Bar
    let hpBarWidth = 150; let barHeight = 15;
    fill(100, 0, 0); rect(10, line1Y, hpBarWidth, barHeight);
    fill(0, 200, 0); let currentHpWidth = map(player.hp, 0, player.maxHp, 0, hpBarWidth); rect(10, line1Y, max(0, currentHpWidth), barHeight);
    fill(255); textSize(14); textAlign(LEFT, TOP);
    text(`HP: ${player.hp}/${player.maxHp} | Lvl: ${player.level} | D Lvl: ${currentLevel} | Gold: ${player.gold}`, 15 + hpBarWidth, line1Y);
    // XP Bar
    let xpBarWidth = 150;
     fill(50, 50, 100); rect(10, line2Y, xpBarWidth, barHeight);
     fill(100, 100, 255); let currentXpWidth = 0;
     if (player.level < 36) { currentXpWidth = map(player.xp, 0, player.xpToNextLevel, 0, xpBarWidth); } else { currentXpWidth = xpBarWidth; }
     rect(10, line2Y, max(0, currentXpWidth), barHeight);
     fill(255); textAlign(LEFT, TOP); let xpText = `XP: ${player.xp}/${player.xpToNextLevel}`;
     if(player.level >= 36) xpText = "XP: MAX LEVEL"; text(xpText, 15 + xpBarWidth, line2Y);
    // Message Log
    textSize(12); textAlign(LEFT, TOP);
    for (let i = 0; i < messageLog.length; i++) { fill(200); text(messageLog[i], 10, msgY + i * 15); }
}

// (addMessage function unchanged)
function addMessage(msg) { /* ... V2 code ... */
    console.log("Message:", msg); messageLog.unshift(msg);
    if (messageLog.length > maxMessages) { messageLog.pop(); }
}

// (drawEasterEggInput function unchanged)
function drawEasterEggInput() { /* ... V2 code ... */
    let boxWidth = 300, boxHeight = 40; let boxX = width/2 - boxWidth/2, boxY = height/2 - boxHeight/2;
    fill(50, 50, 150, 200); stroke(255); rect(boxX, boxY, boxWidth, boxHeight);
    fill(255); noStroke(); textSize(16); textAlign(LEFT, CENTER); text(`> ${easterEggInput}_`, boxX + 10, boxY + boxHeight / 2);
}

// --- NEW: Help Screen Drawing Function ---
function drawHelpScreen() {
    // Semi-transparent overlay
    fill(0, 0, 0, 200); // Black with alpha
    rect(0, 0, width, height);

    // Help Text
    fill(255); // White text
    textSize(24);
    textAlign(CENTER, CENTER);
    text("--- Controls & Help ---", width / 2, height * 0.15);

    textSize(16);
    textAlign(LEFT, TOP); // Align text block
    let helpText = `
    Movement / Attack:
        Arrow Keys or H, J, K, L

    Actions:
        G: Get item underfoot
        Q: Quaff (drink) first potion in inventory
        >: Use stairs down (when standing on 🔽)

    Other:
        H: Toggle this Help screen
        ^: Enter Easter Egg / Cheat mode
           (Type command, press Enter. ESC cancels)

    Goal:
        Descend deeper, defeat monsters, get loot,
        level up, and survive! Good luck, 🧑‍🚀!

    (Press H or ESC to close)
    `;
    text(helpText, width * 0.2, height * 0.25, width * 0.6, height * 0.6); // Position and wrap text
}


// (displayGameOver function unchanged)
function displayGameOver() { /* ... V2 code ... */
    fill(150, 0, 0, 200); rect(0, 0, width, height);
    fill(255); textSize(48); textAlign(CENTER, CENTER); text("GAME OVER", width / 2, height / 2 - 40);
    textSize(24); text(`You reached player level ${player.level} on dungeon level ${currentLevel}.`, width / 2, height / 2 + 10);
    text(`Final Gold: ${player.gold}.`, width / 2, height / 2 + 40);
    text("Press F5 or Refresh to play again!", width / 2, height / 2 + 80);
    noLoop(); // Stop drawing ONLY on game over
}


// --- Game Logic ---
// (updateVisibility, hasLineOfSight functions unchanged)
function updateVisibility() { /* ... V2 code ... */
    for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) grid[r][c].visible = false;
    let px = player.x, py = player.y;
    for (let r = max(0, py - visibilityRadius); r <= min(rows - 1, py + visibilityRadius); r++) {
        for (let c = max(0, px - visibilityRadius); c <= min(cols - 1, px + visibilityRadius); c++) {
            if (dist(px, py, c, r) <= visibilityRadius && hasLineOfSight(px, py, c, r)) {
                 grid[r][c].visible = true; grid[r][c].discovered = true;
            }
        }
    } if (py >= 0 && py < rows && px >= 0 && px < cols) { grid[py][px].visible = true; grid[py][px].discovered = true; }
}
function hasLineOfSight(x0, y0, x1, y1) { /* ... V2 code ... */
    let dx = abs(x1 - x0), dy = -abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    while (true) {
         if (x0>=0 && x0<cols && y0>=0 && y0<rows) { if (grid[y0][x0].blockSight && !(x0===x1 && y0===y1)) return false; } else return false;
        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    } return true;
}

// (movePlayer function unchanged from V2 logic, returns true if turn taken)
function movePlayer(dx, dy) { /* ... V2 code ... returns true if action taken, false otherwise */
    let newX = player.x + dx, newY = player.y + dy;
    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) { addMessage("Ouch! You bumped into the edge of the world."); return false; }
    if (grid[newY][newX].blockMove) { addMessage("Bonk! You hit a wall."); return false; }
    let targetMonster = null; for (let m of monsters) { if (m.x === newX && m.y === newY) { targetMonster = m; break; } }
    if (targetMonster) { attackMonster(player, targetMonster); return true; } // Attack takes turn
    player.x = newX; player.y = newY; // Move takes turn
    if (stairs && newX === stairs.x && newY === stairs.y) { addMessage("You see stairs leading down... 🔽 (Press '>' or '.' to descend)"); }
    let itemHere = null; for(let i of items) { if(i.x === newX && i.y === newY) { itemHere = i; break; } }
    if(itemHere) { addMessage(`You see a ${itemHere.name} (${itemHere.char}) here. (Press 'g' to get)`); }
    return true; // Successful move takes turn
}

// (attackMonster, attackPlayer, addXP, checkLevelUp unchanged from V2)
function attackMonster(attacker, target) { /* ... V2 code ... */
    let damage = calculatePlayerDamage(attacker.level); addMessage(`You attack the ${target.name} (${target.char})!`);
    target.hp -= damage; addMessage(`The ${target.name} takes ${damage} damage.`);
    if (target.hp <= 0) {
        addMessage(`You defeated the ${target.name}! 🎉`);
        let xpGained = target.xpValue || 0; if (xpGained > 0) { addMessage(`You gain ${xpGained} XP.`); addXP(xpGained); }
        monsters = monsters.filter(m => m !== target);
    }
}
function attackPlayer(attacker, target) { /* ... V2 code ... */
    let damage = attacker.damage || 1; addMessage(`The ${attacker.name} (${attacker.char}) attacks you!`);
    target.hp -= damage; addMessage(`You take ${damage} damage.`);
    // Game over check moved to main loop after monster turns
}
function addXP(amount) { /* ... V2 code ... */
    if (player.level >= 36) return; player.xp += amount; checkLevelUp();
}
function checkLevelUp() { /* ... V2 code ... */
    const maxLevel = 36; if (player.level >= maxLevel) { player.xp = 0; player.xpToNextLevel = 0; return; }
    while (player.xp >= player.xpToNextLevel) {
        player.level++; addMessage(`✨ Ding! You reached Level ${player.level}! ✨`);
        let hpGain = 10 + floor(player.level / 2); player.maxHp += hpGain; player.hp = player.maxHp;
        player.baseDamage += (player.level % 3 === 0) ? 1 : 0; addMessage(`Max HP increased to ${player.maxHp}. Damage potential increased!`);
        if (player.level >= maxLevel) {
             addMessage("You have reached the maximum level!"); player.xp = 0; player.xpToNextLevel = 0; break;
        } else { player.xpToNextLevel = calculateXpForLevel(player.level + 1); }
    }
}

// (handleMonsterTurns, isBlocked, isOccupiedByMonster unchanged from V2)
function handleMonsterTurns() { /* ... V2 code ... */
    for (let i = monsters.length - 1; i >= 0; i--) {
        let monster = monsters[i]; if (!monster) continue;
        let dx = 0, dy = 0, distanceToPlayer = dist(monster.x, monster.y, player.x, player.y);
        if (distanceToPlayer < 8 && hasLineOfSight(monster.x, monster.y, player.x, player.y)) {
            if (player.x > monster.x) dx = 1; else if (player.x < monster.x) dx = -1;
            if (player.y > monster.y) dy = 1; else if (player.y < monster.y) dy = -1;
            if (dx !== 0 && dy !== 0) {
                 if (isBlocked(monster.x + dx, monster.y) && !isBlocked(monster.x, monster.y + dy)) dx = 0;
                 else if (!isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)) dy = 0;
                 else if (isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)){ if (random() < 0.5) dx = 0; else dy = 0; }
            }
        } else { let r = floor(random(5)); if (r === 0) dx = 1; else if (r === 1) dx = -1; else if (r === 2) dy = 1; else if (r === 3) dy = -1; }
        let newX = monster.x + dx, newY = monster.y + dy;
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !isBlocked(newX, newY)) {
             if (newX === player.x && newY === player.y) { attackPlayer(monster, player); }
             else if (!isOccupiedByMonster(newX, newY)) { monster.x = newX; monster.y = newY; }
        }
    }
}
function isBlocked(x, y) { /* ... V2 code ... */
    if (x < 0 || x >= cols || y < 0 || y >= rows) return true; return grid[y][x].blockMove;
}
function isOccupiedByMonster(x, y) { /* ... V2 code ... */
    for (let m of monsters) { if (m.x === x && m.y === y) return true; } return false;
}

// (pickUpItem, quaffPotion unchanged from V2)
function pickUpItem() { /* ... V2 code ... */
    let itemIndex = -1; for (let i = 0; i < items.length; i++) { if (items[i].x === player.x && items[i].y === player.y) { itemIndex = i; break; } }
    if (itemIndex !== -1) {
        let item = items[itemIndex]; addMessage(`You pick up the ${item.name} (${item.char}).`);
        if (item.type === 'treasure') player.gold += item.value; else if (item.type === 'potion') player.inventory.push(item);
        items.splice(itemIndex, 1); return true; // Picking up takes turn? Debatable, returning true for now
    } else { addMessage("There is nothing here to pick up."); return false; }
}
function quaffPotion() { /* ... V2 code ... */
    let potionToQuaff = null, potionIndex = -1;
    for (let i = 0; i < player.inventory.length; i++) { if (player.inventory[i].type === 'potion') { potionToQuaff = player.inventory[i]; potionIndex = i; break; } }
    if (potionToQuaff) {
        addMessage(`You quaff the ${potionToQuaff.name} (${potionToQuaff.char})...`);
        if (potionToQuaff.effect === 'heal') { let healedAmount = min(player.maxHp - player.hp, potionToQuaff.power); player.hp += healedAmount; addMessage(`You feel healthier! (+${healedAmount} HP)`); }
        else if (potionToQuaff.effect === 'teleport') { addMessage("Woah! Everything spins!"); /* Add teleport logic */ }
        else { addMessage("...but nothing interesting happens."); }
        player.inventory.splice(potionIndex, 1);
    } else { addMessage("You have no potions to quaff!"); }
}

// (descendStairs unchanged)
function descendStairs() { /* ... V2 code ... */
    addMessage("You descend deeper into the dungeon..."); currentLevel++; generateLevel(); addMessage(`Welcome to Dungeon Level ${currentLevel}.`);
}


// --- Easter Egg Handling ---
// (handleEasterEggInput, processEasterEgg unchanged from V2, state change handled in main keypress)
function handleEasterEggInput(key, keyCode) { /* ... V2 code ... */
    if (keyCode === ENTER) { processEasterEgg(easterEggInput); gameState = 'playing'; easterEggInput = ''; }
    else if (keyCode === BACKSPACE) { easterEggInput = easterEggInput.slice(0, -1); }
    else if (keyCode === ESCAPE) { gameState = 'playing'; easterEggInput = ''; addMessage("Easter egg input cancelled."); }
    else if (key.length === 1 && easterEggInput.length < 30) { easterEggInput += key; }
}
function processEasterEgg(command) { /* ... V2 code ... */
    command = command.toLowerCase().trim(); addMessage(`Easter Egg attempt: "${command}"`);
    if (command === "showoff") { showAll = !showAll; addMessage(showAll ? "Tada! Revealed!" : "Hiding map."); }
    else if (command === "kiellemall") { addMessage("Begone!"); monsters = []; }
    else if (command === "healme") { player.hp = player.maxHp; addMessage("Refreshed!"); }
    else if (command === "goldpls") { player.gold += 1000; addMessage("💰💰💰 Bling! 💰💰💰"); }
    else if (command === "levelup") { if (player.level < 36) { addXP(player.xpToNextLevel - player.xp); addMessage("Level up!"); } else { addMessage("Max level!"); } }
    else if (command === "godmode") { player.hp = 9999; player.maxHp = 9999; player.baseDamage = 100; addMessage("DEUS VULT!"); }
    else { addMessage("Nothing happens..."); }
}
