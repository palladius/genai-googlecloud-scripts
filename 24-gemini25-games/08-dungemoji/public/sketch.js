// sketch.js - Your Emoji Rogue-like Adventure! V5 (Error Handling for Size)

// --- Configurable Stuff & Constants ---
let visibilityRadius = 2;
const minRoomSize = 2;
const maxRoomSize = 7;
const numRoomsTry = 100;

// ASCII Wall Characters
const WALL_V = '║'; // Double vertical
const WALL_H = '═'; // Double horizontal
const WALL_TL = '╔'; // Top-Left
const WALL_TR = '╗'; // Top-Right
const WALL_BL = '╚'; // Bottom-Left
const WALL_BR = '╝'; // Bottom-Right
const WALL_TJ = '╦'; // T-Junction pointing Up (connects Below, Left, Right)
const WALL_BJ = '╩'; // T-Junction pointing Down (connects Above, Left, Right)
const WALL_LJ = '╠'; // T-Junction pointing Left (connects Above, Below, Right)
const WALL_RJ = '╣'; // T-Junction pointing Right (connects Above, Below, Left)
const WALL_X = '╬'; // Cross

// Monster Definition
const monsterTypes = [
    { name: 'Giant Rat',   char: '🐀', hp: 3,  xpValue: 5,  damage: 1, minLevel: 1 },
    { name: 'Goblin',      char: '👺', hp: 6,  xpValue: 10, damage: 1, minLevel: 1 },
    { name: 'Giant Spider',char: '🕷️', hp: 5,  xpValue: 12, damage: 2, minLevel: 2 },
    { name: 'Orc',         char: '👹', hp: 12, xpValue: 25, damage: 3, minLevel: 3 },
    { name: 'Wolf',        char: '🐺', hp: 8,  xpValue: 18, damage: 2, minLevel: 3 },
    { name: 'Slime',       char: '🦠', hp: 15, xpValue: 20, damage: 1, minLevel: 4 },
    { name: 'Ogre',        char: '🦍', hp: 25, xpValue: 50, damage: 4, minLevel: 5 },
    { name: 'Skeleton',    char: '💀', hp: 10, xpValue: 30, damage: 2, minLevel: 6 },
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
let messageLog = ["Welcome...", "..."]; // Initial messages set in startGame
let maxMessages = 5;
let showAll = false;
let easterEggInput = '';
// Game State Machine
let gameState = 'playing'; // 'playing', 'help', 'gameOver', 'easterEggInput', 'error'
let errorMessage = ""; // Store error messages

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
        xpToNextLevel: calculateXpForLevel(2), // Initial XP needed for Level 2
        baseDamage: 2
    };
}

function calculateXpForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 200; // Base XP for level 2
    // Exponential formula: PrevLevelXP * 2
    return calculateXpForLevel(level - 1) * 2;
}

function calculatePlayerDamage(playerLevel) {
    // Example: Increase damage every few levels
    return player.baseDamage + floor(playerLevel / 3);
}


// --- p5.js Core Functions ---
function setup() {
    textFont('monospace');
    // Initial size check
    if (windowWidth < tileSize * 15 || windowHeight < tileSize * 15) {
        errorMessage = "Window is too small to start the game!";
        gameState = 'error';
        createCanvas(max(windowWidth, tileSize * 15), max(windowHeight, tileSize * 15));
    } else {
        createCanvas(windowWidth, windowHeight);
        calculateGridSize(); // Calculate initial grid size
        if (cols < 10 || rows < 10) { // Check if calculated grid is too small
            errorMessage = `Calculated grid (${cols}x${rows}) is too small!`;
            gameState = 'error';
        } else {
            startGame(); // Only start if size is okay
        }
    }
}


function windowResized() {
    console.log("windowResized: Called.");
    // Ensure canvas size is at least somewhat reasonable, prevents negative cols/rows
    let newWidth = max(windowWidth, tileSize * 15);
    let newHeight = max(windowHeight, tileSize * 15);
    resizeCanvas(newWidth, newHeight);
    console.log(`windowResized: Canvas resized to ${newWidth}x${newHeight}`);

    let oldCols = cols; let oldRows = rows;
    calculateGridSize(); // Recalculate cols/rows based on new width/height

    if (cols < 10 || rows < 10) {
        errorMessage = `Resized window too small (${cols}x${rows} grid)! Cannot generate level.`;
        gameState = 'error'; // Set error state
        console.error(errorMessage);
        // Don't try to generate level if too small
    } else {
        // Size is okay, proceed
        if (gameState === 'error') {
            console.log("windowResized: Size is now okay, restarting game.");
            startGame(); // This will set gameState to 'playing' and generate
        } else if (gameState !== 'gameOver' && gameState !== 'help') { // Don't regenerate if paused or game over
             addMessage("Screen resized - Regenerating level...");
             console.log("windowResized: Regenerating level...");
             generateLevel(); // Regenerate the level to fit the new size
             console.log("windowResized: Level regeneration finished.");
        } else {
             console.log("windowResized: Game paused or over, not regenerating level.");
        }
    }
}

function draw() {
    background(0);

    // State-based drawing
    if (gameState === 'error') {
        drawErrorScreen(); // Show error message
    } else if (gameState === 'gameOver') {
        displayGameOver();
    } else if (gameState === 'help') {
        drawHelpScreen();
    } else { // 'playing' or 'easterEggInput'
        // These functions should now only be called if the grid is valid
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
    // Check states where input is blocked
    if (gameState === 'error' || gameState === 'gameOver') {
        return;
    }

    // Handle Help screen toggle
    if (gameState === 'help') {
        if (key === 'h' || key === 'H' || keyCode === ESCAPE) {
            gameState = 'playing';
            addMessage("Resuming game.");
        }
        return; // Ignore other keys in help mode
    }

    // Handle Easter Egg input mode
    if (gameState === 'easterEggInput') {
        handleEasterEggInput(key, keyCode);
        return; // Input handled separately
    }

    // --- gameState must be 'playing' here ---
    let playerTurnTaken = false;

    // Movement and Attack Keys
    if (keyCode === UP_ARROW || key === 'k' || key === 'K') { playerTurnTaken = movePlayer(0, -1); }
    else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') { playerTurnTaken = movePlayer(0, 1); }
    else if (keyCode === LEFT_ARROW || (key === 'h' && key !== 'H')) { playerTurnTaken = movePlayer(-1, 0); } // 'h' moves left, 'H' is help
    else if (keyCode === RIGHT_ARROW || key === 'l' || key === 'L') { playerTurnTaken = movePlayer(1, 0); }

    // Action Keys
    else if (key === 'q' || key === 'Q') { quaffPotion(); playerTurnTaken = true; } // Attempting always takes a turn
    else if (key === 'g' || key === 'G') { playerTurnTaken = pickUpItem(); } // pickUpItem returns true if successful & takes turn
    else if (key === '>' || key === '.') { // Use stairs
        if (stairs && player.x === stairs.x && player.y === stairs.y) {
            descendStairs();
            playerTurnTaken = false; // Descending doesn't count as turn on this level
        } else {
             addMessage("You aren't on the stairs ('>').");
             playerTurnTaken = false; // Failed action doesn't cost a turn
        }
    }

    // Meta Keys
    else if (key === 'H') { // Help key (Case sensitive H only)
        gameState = 'help';
        addMessage("Showing help screen (H/ESC to close).");
        playerTurnTaken = false; // Viewing help doesn't take a turn
    } else if (key === '^') {
        gameState = 'easterEggInput';
        easterEggInput = '';
        addMessage("Enter Easter Egg command:");
        playerTurnTaken = false; // Entering input mode doesn't take a turn
    }

    // --- Monster Turn ---
    if (playerTurnTaken && gameState === 'playing') { // Check state again in case an action changed it
        handleMonsterTurns();
    }

    // --- Check for Game Over after player/monster turns ---
    // Ensure player exists before checking hp
    if (player && player.hp <= 0 && gameState === 'playing') {
        gameState = 'gameOver';
        player.char = '☠️';
        addMessage("💀 You have died! 💀"); // Add death message immediately
        // displayGameOver will be called on the next draw loop
    }

    // Optional: Prevent default browser actions for keys used
    // if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, 32 /*space*/].includes(keyCode)) {
    //    return false;
    // }
}

// --- Game Initialization ---
function calculateGridSize() {
    // Calculate grid dimensions based on current canvas size
    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - 5; // Reserve UI space
    // Ensure cols and rows are not negative if window is tiny
    cols = max(0, cols);
    rows = max(0, rows);
    // console.log(`calculateGridSize: ${cols}x${rows}`);
}

function startGame() {
    console.log("startGame: Called.");
    // Reset basic state
    currentLevel = 1;
    showAll = false;
    easterEggInput = '';
    errorMessage = ""; // Clear any previous error message

    // Ensure player exists and reset stats
    if (!player) {
        // Player needs initial position before generation
        player = createPlayer(0, 0); // Create dummy player first
    }
    player.level = 1; player.xp = 0; player.xpToNextLevel = calculateXpForLevel(2);
    player.maxHp = 30; player.hp = player.maxHp; player.baseDamage = 2;
    player.gold = 0; player.inventory = []; player.char = '🧑‍🚀'; // Reset char in case died

    messageLog = ["Welcome, brave 🧑‍🚀!", "Dungeon Level " + currentLevel + ". Press 'H' for help."];

    // Set state to playing *before* generating
    // generateLevel will check size and potentially set state to 'error'
    gameState = 'playing';
    generateLevel(); // Generate the first level

    if (gameState === 'error') {
        console.error("startGame: Generation failed immediately, staying in error state.");
    } else {
         console.log("startGame: Finished successfully.");
    }
}

function generateLevel() {
    console.log(`generateLevel (Dungeon Level ${currentLevel}): Started.`);

    // Check if grid dimensions are valid *before* trying to use them
    if (cols < 10 || rows < 10) {
        errorMessage = `Grid size too small (${cols}x${rows}) to generate level ${currentLevel}.`;
        gameState = 'error'; // Set error state
        console.error(errorMessage);
        return; // Stop generation
    }

    // Reset level-specific things
    rooms = []; monsters = []; items = []; stairs = null;

    // Initialize grid
    grid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        grid[r] = new Array(cols);
        for (let c = 0; c < cols; c++) {
            grid[r][c] = { type: 'wall', char: '#', discovered: false, visible: false, blockMove: true, blockSight: true };
        }
    }

    // Place rooms
    for (let i = 0; i < numRoomsTry; i++) { createRoom(); }
    if (rooms.length === 0) {
        errorMessage = `Failed to place any rooms on level ${currentLevel}. Try resizing larger.`;
        gameState = 'error';
        console.error(errorMessage);
        return; // Stop generation if no rooms placed
    }

    // Connect rooms
    for (let i = 1; i < rooms.length; i++) {
        let r1 = rooms[i], r2 = rooms[i-1];
        if (!r1 || !r2) { console.warn("Skipping corridor due to missing room data."); continue; } // Safety check
        let x1 = floor(r1.x + r1.w/2), y1 = floor(r1.y + r1.h/2);
        let x2 = floor(r2.x + r2.w/2), y2 = floor(r2.y + r2.h/2);
        createCorridor(x1, y1, x2, y2);
    }

    // Place player
    if (!player) player = createPlayer(0,0); // Should exist, but safety first
    let startRoom = rooms[0];
    player.x = floor(startRoom.x + startRoom.w / 2);
    player.y = floor(startRoom.y + startRoom.h / 2);
    player.x = constrain(player.x, 0, cols - 1); // Ensure within bounds
    player.y = constrain(player.y, 0, rows - 1);

    // Place stairs
    let endRoom = rooms[rooms.length - 1];
    placeStairs(endRoom);
    if (!stairs) { // Check if stairs failed to place
        errorMessage = `Failed to place stairs on level ${currentLevel}. Generation aborted.`;
        gameState = 'error';
        console.error(errorMessage);
        return; // Stop generation if essential elements fail
    }

    // Place monsters & items
    let maxMonsters = floor(rooms.length / 3);
    placeEntities(monsters, monsterTypes, maxMonsters, currentLevel, true); // skip start room for monsters
    placeEntities(items, treasureTypes, floor(rooms.length * 0.5), currentLevel, false);
    placeEntities(items, potionTypes, floor(rooms.length * 0.7), currentLevel, false);

    // Final steps if generation succeeded
    updateVisibility();
    console.log(`generateLevel (Dungeon Level ${currentLevel}): Finished successfully. ${rooms.length} rooms, ${monsters.length} monsters.`);
}


// --- Dungeon Generation Helpers ---
function createRoom() {
    let w = floor(random(minRoomSize, maxRoomSize + 1));
    let h = floor(random(minRoomSize, maxRoomSize + 1));
    // Ensure position stays within grid margins (1 tile)
    let x = floor(random(1, max(2, cols - w - 1)));
    let y = floor(random(1, max(2, rows - h - 1)));

    // Handle cases where dimensions make placement impossible
    if (x < 0 || y < 0) return;

    let newRoom = { x: x, y: y, w: w, h: h };
    let overlaps = false;
    for (let otherRoom of rooms) {
        if (rectOverlap(newRoom, otherRoom, 1)) { overlaps = true; break; }
    }
    if (!overlaps) {
        // Carve the room ensuring bounds
        for (let r = max(0, y); r < min(rows, y + h); r++) {
            for (let c = max(0, x); c < min(cols, x + w); c++) {
                 // No need to check bounds again due to loop limits
                 grid[r][c] = { type: 'floor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
            }
        }
        rooms.push(newRoom);
    }
}

function rectOverlap(r1, r2, padding = 0) {
    return (r1.x < r2.x + r2.w + padding && r1.x + r1.w + padding > r2.x && r1.y < r2.y + r2.h + padding && r1.y + r1.h + padding > r2.y);
}

function createCorridor(x1, y1, x2, y2) {
    // Ensure start/end points are valid before carving
    x1 = constrain(x1, 0, cols - 1); y1 = constrain(y1, 0, rows - 1);
    x2 = constrain(x2, 0, cols - 1); y2 = constrain(y2, 0, rows - 1);

    let currentX = x1, currentY = y1;
    // Horizontal segment
    while (currentX !== x2) {
        // Check bounds explicitly inside loop
        if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
            if (grid[currentY][currentX].type === 'wall') {
                grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
            }
        }
        currentX += (x2 > x1) ? 1 : -1;
    }
     // Carve final horizontal step & corner if needed (check bounds)
     if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
         grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
     }

    // Vertical segment (starting from the end of the horizontal segment)
    while (currentY !== y2) {
        // Check bounds explicitly inside loop
         if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
             if (grid[currentY][currentX].type === 'wall') {
                 grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
             }
         }
        currentY += (y2 > y1) ? 1 : -1;
    }
     // Carve final vertical step if needed (check bounds)
      if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
          grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
      }
}

function placeStairs(room) {
    if (!room) {
        console.error("placeStairs: Cannot place stairs in null room!");
        if (rooms.length > 0) { room = random(rooms); console.warn("placeStairs: Using random room as fallback.");}
        else { console.error("placeStairs: No rooms exist!"); return; } // No stairs can be placed
    }
     let placed = false, attempts = 0;
     while (!placed && attempts < 200) { // Increased attempts
         let sx = floor(random(room.x, room.x + room.w));
         let sy = floor(random(room.y, room.y + room.h));
         // Check bounds AND ensure it's a floor tile
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type === 'floor') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy }; // Assign the global stairs object
             placed = true;
             console.log("Stairs placed at", sx, sy);
         }
         attempts++;
     }
     if (!placed) {
         console.error("Failed to place stairs randomly in room!", room);
         // Fallback: Try center, ensure it's floor
         let sx = floor(room.x + room.w / 2);
         let sy = floor(room.y + room.h / 2);
         sx = constrain(sx, 0, cols-1); sy = constrain(sy, 0, rows-1); // Ensure center is in bounds

         if (grid[sy][sx].type === 'floor') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy };
             console.warn("Fallback: Placed stairs at room center", sx, sy);
             placed = true;
         } else {
             console.error("FATAL: Could not place stairs in room center either. No stairs generated.");
             // stairs remains null
         }
     }
}

function placeEntities(entityList, sourceTypes, maxCount, dungeonLevel, skipStartRoom = false) {
    let placedCount = 0, attempts = 0;
    let startRoom = rooms.length > 0 ? rooms[0] : null; // Identify the start room

    // Filter sourceTypes based on dungeonLevel (for monsters)
    let availableTypes = sourceTypes;
    if (sourceTypes === monsterTypes) {
        availableTypes = sourceTypes.filter(type => dungeonLevel >= type.minLevel);
        if (availableTypes.length === 0) {
             // console.warn(`No suitable monsters found for level ${dungeonLevel}`);
             return; // Don't place anything if no types are available
        }
    }

    // Ensure rooms exist before trying to place entities
    if (rooms.length === 0) {
        console.warn("placeEntities: No rooms available to place entities.");
        return;
    }

    while (placedCount < maxCount && attempts < maxCount * 20) { // Limit attempts
        let roomIndex = floor(random(rooms.length));
        let room = rooms[roomIndex];

        // Check if we should skip this room
        if (skipStartRoom && room === startRoom) {
            attempts++;
            continue;
        }

        // Choose random coords within the room
        let ex = floor(random(room.x, room.x + room.w));
        let ey = floor(random(room.y, room.y + room.h));

        // Validate coordinates and tile type before placing
        if (ey >= 0 && ey < rows && ex >= 0 && ex < cols &&
            grid[ey][ex].type === 'floor' &&
            !(player && ex === player.x && ey === player.y) && // Avoid player start
             !(stairs && ex === stairs.x && ey === stairs.y) && // Avoid stairs
            !isOccupied(ex, ey)) // Check monsters and items lists
        {
            let type = random(availableTypes); // Pick from filtered types
            if (!type) { // Safety check if availableTypes is empty somehow
                attempts++;
                continue;
            }
            let newEntity = {
                x: ex, y: ey, char: type.char, name: type.name,
                ...(type.hp && { hp: type.hp, maxHp: type.hp, damage: type.damage, xpValue: type.xpValue }),
                ...(type.value && { value: type.value, type: 'treasure' }),
                ...(type.effect && { effect: type.effect, power: type.power, type: 'potion' })
            };
            entityList.push(newEntity);
            placedCount++;
        }
        attempts++;
    }
}

function isOccupied(x, y) {
    // Check against monsters
    for (let m of monsters) {
        if (m.x === x && m.y === y) return true;
    }
    // Check against items
    for (let i of items) {
        if (i.x === x && i.y === y) return true;
    }
    return false;
}

// --- Drawing Functions ---
function isWallOrBoundary(c, r) {
    if (c < 0 || c >= cols || r < 0 || r >= rows) {
        return true; // Treat out of bounds as walls for drawing purposes
    }
    // Check grid exists before accessing type
    if (!grid || !grid[r] || !grid[r][c]) {
        // This case should ideally not happen if generation is correct
        // console.warn(`isWallOrBoundary: Invalid grid access at ${c},${r}`);
        return true; // Treat invalid grid access as a boundary
    }
    return grid[r][c].type === 'wall';
}

function drawMap() {
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.85); // Adjusted size

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Check if grid cell exists before processing
            if (!grid || !grid[r] || !grid[r][c]) continue;

            let tile = grid[r][c];
            let x = c * tileSize + tileSize / 2;
            let y = r * tileSize + tileSize / 2;

            let charToDraw = '?';
            let tileColor = color(50);

            let isVisible = showAll || tile.visible;
            let isDiscovered = tile.discovered;

            if (!isVisible && !isDiscovered) continue;

            // Determine Color based on visibility/discovery and type
            if (isVisible) {
                if (tile.type === 'wall') tileColor = color(200, 200, 200);
                else if (tile.type === 'floor') tileColor = color(100, 100, 100);
                else if (tile.type === 'corridor') tileColor = color(130, 110, 90);
                else if (tile.type === 'stairs') tileColor = color(255, 255, 0);
                else tileColor = color(200);
            } else { // Discovered but not visible
                if (tile.type === 'wall') tileColor = color(100, 100, 100);
                else if (tile.type === 'floor') tileColor = color(50, 50, 50);
                else if (tile.type === 'corridor') tileColor = color(60, 50, 40);
                else if (tile.type === 'stairs') tileColor = color(100, 100, 0);
                else tileColor = color(50);
            }

            // Determine Character based on type and neighbors (for walls)
            if (tile.type === 'wall') {
                let wallAbove = isWallOrBoundary(c, r - 1);
                let wallBelow = isWallOrBoundary(c, r + 1);
                let wallLeft = isWallOrBoundary(c - 1, r);
                let wallRight = isWallOrBoundary(c + 1, r);
                // Bitmask code: 1=Up, 2=Down, 4=Left, 8=Right
                let code = (wallAbove * 1) | (wallBelow * 2) | (wallLeft * 4) | (wallRight * 8);

                switch (code) {
                    case 0: charToDraw = '█'; break; // Isolated wall block
                    case 1: charToDraw = WALL_V; break;  // U
                    case 2: charToDraw = WALL_V; break;  // D
                    case 3: charToDraw = WALL_V; break;  // UD
                    case 4: charToDraw = WALL_H; break;  // L
                    case 5: charToDraw = WALL_BR; break; // UL -> Bottom-Right corner (╝) CORRECTED
                    case 6: charToDraw = WALL_TR; break; // DL -> Top-Right corner (╗) CORRECTED
                    case 7: charToDraw = WALL_RJ; break; // UDL -> T-right (╣)
                    case 8: charToDraw = WALL_H; break;  // R
                    case 9: charToDraw = WALL_BL; break; // UR -> Bottom-Left corner (╚) CORRECTED
                    case 10: charToDraw = WALL_TL; break; // DR -> Top-Left corner (╔) CORRECTED
                    case 11: charToDraw = WALL_LJ; break; // UDR -> T-left (╠)
                    case 12: charToDraw = WALL_H; break; // LR
                    case 13: charToDraw = WALL_BJ; break; // ULR -> T-down (╩)
                    case 14: charToDraw = WALL_TJ; break; // DLR -> T-up (╦)
                    case 15: charToDraw = WALL_X; break; // UDLR -> Cross (╬)
                    default: charToDraw = '?';
                }
                // Override if isolated point again, just in case logic missed something
                 if (code === 0) charToDraw = '█';

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


function drawPlayer() {
    // Ensure player exists before drawing
    if (!player) return;
    fill(255); // Player is always visible and bright
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.8);
    text(player.char, player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
}

function drawMonsters() {
     fill(255, 100, 100); // Red for monsters
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let monster of monsters) {
         // Check grid visibility only if grid/tile exists
         let monsterVisible = showAll;
         if (!monsterVisible && grid && grid[monster.y] && grid[monster.y][monster.x]) {
             monsterVisible = grid[monster.y][monster.x].visible;
         }
         if (monsterVisible) {
            text(monster.char, monster.x * tileSize + tileSize / 2, monster.y * tileSize + tileSize / 2);
         }
     }
}

function drawItems() {
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let item of items) {
         // Check grid visibility only if grid/tile exists
          let itemVisible = showAll;
          if (!itemVisible && grid && grid[item.y] && grid[item.y][item.x]) {
              itemVisible = grid[item.y][item.x].visible;
          }
          if(itemVisible) {
            if (item.type === 'treasure') fill(255, 215, 0); // Gold
            else if (item.type === 'potion') fill(0, 255, 255); // Cyan
            else fill(200);
            text(item.char, item.x * tileSize + tileSize / 2, item.y * tileSize + tileSize / 2);
         }
     }
}

function drawUI() {
    let uiY = rows * tileSize;
    let uiHeight = height - uiY;
    let line1Y = uiY + 5;
    let line2Y = uiY + 25;
    let msgY = uiY + 45; // Start messages below XP bar

    // Clear UI area
    fill(20, 20, 20);
    noStroke();
    rect(0, uiY, width, uiHeight);

    // Ensure player exists before drawing stats
    if (!player) return;

    // --- Line 1: HP Bar and Stats ---
    let hpBarWidth = 150;
    let barHeight = 15;
    fill(100, 0, 0); rect(10, line1Y, hpBarWidth, barHeight); // HP Bar Background
    fill(0, 200, 0); let currentHpWidth = map(player.hp, 0, player.maxHp, 0, hpBarWidth); rect(10, line1Y, max(0, currentHpWidth), barHeight); // HP Bar Foreground
    fill(255); textSize(14); textAlign(LEFT, TOP); // HP Text & other stats
    text(`HP: ${player.hp}/${player.maxHp} | Lvl: ${player.level} | D Lvl: ${currentLevel} | Gold: ${player.gold}`, 15 + hpBarWidth, line1Y);

    // --- Line 2: XP Bar ---
    let xpBarWidth = 150;
    fill(50, 50, 100); rect(10, line2Y, xpBarWidth, barHeight); // XP Bar Background
    fill(100, 100, 255); let currentXpWidth = 0; // XP Bar Foreground
    if (player.level < 36 && player.xpToNextLevel > 0) { currentXpWidth = map(player.xp, 0, player.xpToNextLevel, 0, xpBarWidth); }
    else if (player.level >= 36) { currentXpWidth = xpBarWidth; } // Max level shows full bar
    rect(10, line2Y, max(0, currentXpWidth), barHeight);
    fill(255); textAlign(LEFT, TOP); // XP Text
    let xpText = `XP: ${player.xp}/${player.xpToNextLevel}`;
    if(player.level >= 36) xpText = "XP: MAX LEVEL"; text(xpText, 15 + xpBarWidth, line2Y);

    // Message Log
    textSize(12); textAlign(LEFT, TOP);
    for (let i = 0; i < messageLog.length; i++) { fill(200); text(messageLog[i], 10, msgY + i * 15); }
}

function addMessage(msg) {
    console.log("Message:", msg);
    messageLog.unshift(msg);
    if (messageLog.length > maxMessages) {
        messageLog.pop();
    }
}

function drawEasterEggInput() {
    let boxWidth = 300;
    let boxHeight = 40;
    let boxX = width / 2 - boxWidth / 2;
    let boxY = height / 2 - boxHeight / 2;

    fill(50, 50, 150, 200); // Semi-transparent blue background
    stroke(255);
    rect(boxX, boxY, boxWidth, boxHeight);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(`> ${easterEggInput}_`, boxX + 10, boxY + boxHeight / 2);
}

function drawHelpScreen() {
    // Semi-transparent overlay
    fill(0, 0, 0, 200); // Black with alpha
    noStroke();
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
    // Use text() with box parameters for auto-wrapping
    text(helpText, width * 0.2, height * 0.25, width * 0.6, height * 0.6);
}

function displayGameOver() {
    fill(150, 0, 0, 200); // Dark Red overlay
    noStroke();
    rect(0, 0, width, height);

    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(24);
    // Check if player exists before accessing properties
    let playerLevelStr = player ? player.level : '?';
    let playerGoldStr = player ? player.gold : '?';
    text(`You reached player level ${playerLevelStr} on dungeon level ${currentLevel}.`, width / 2, height / 2 + 10);
    text(`Final Gold: ${playerGoldStr}.`, width / 2, height / 2 + 40);
    textSize(18);
    text("Press F5 or Refresh to play again!", width / 2, height / 2 + 80);
    noLoop(); // Stop the draw loop ONLY on game over
}

// --- NEW: Error Screen Drawing Function ---
function drawErrorScreen() {
    background(30, 0, 0); // Dark red background for error
    fill(255, 100, 100); // Light Red text
    textSize(24);
    textAlign(CENTER, CENTER);
    text("ERROR", width / 2, height * 0.3);

    textSize(16);
    // Display the specific error message stored
    text(errorMessage, width / 2, height * 0.5, width * 0.8, height * 0.4); // Wrap text

    textSize(14);
    text("Please resize the window to be larger or refresh the page (F5).", width/2, height*0.8);
}

// --- Game Logic ---
function updateVisibility() {
    // Ensure grid and player exist
    if (!grid || !player) return;

    // Reset visibility for all tiles
    for (let r = 0; r < rows; r++) {
        if (!grid[r]) continue; // Check inner array
        for (let c = 0; c < cols; c++) {
             if (!grid[r][c]) continue; // Check cell object
            grid[r][c].visible = false;
        }
    }

    // Calculate FOV
    let px = player.x;
    let py = player.y;
    for (let r = max(0, py - visibilityRadius); r <= min(rows - 1, py + visibilityRadius); r++) {
         if (!grid[r]) continue;
        for (let c = max(0, px - visibilityRadius); c <= min(cols - 1, px + visibilityRadius); c++) {
             if (!grid[r][c]) continue;
            let d = dist(px, py, c, r);
            if (d <= visibilityRadius) {
                 if (hasLineOfSight(px, py, c, r)) {
                     grid[r][c].visible = true;
                     grid[r][c].discovered = true;
                 }
            }
        }
    }
    // Ensure player's own tile is visible if within bounds
     if (py >= 0 && py < rows && px >= 0 && px < cols && grid[py] && grid[py][px]) {
        grid[py][px].visible = true;
        grid[py][px].discovered = true;
     }
}

function hasLineOfSight(x0, y0, x1, y1) {
    // Ensure grid exists
    if (!grid) return false;

    let dx = abs(x1 - x0);
    let dy = -abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        // Check bounds and grid validity before accessing
         if (x0 >= 0 && x0 < cols && y0 >= 0 && y0 < rows && grid[y0] && grid[y0][x0]) {
            // Check sight blocking property
            if (grid[y0][x0].blockSight && !(x0 === x1 && y0 === y1)) {
                return false; // Blocked
            }
         } else {
             return false; // Out of bounds blocks sight
         }

        // Check if target reached
        if (x0 === x1 && y0 === y1) break;

        // Bresenham step calculation
        let e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
    return true; // No obstruction found
}


function movePlayer(dx, dy) {
    // Ensure player and grid exist
    if (!player || !grid) return false;

    let newX = player.x + dx;
    let newY = player.y + dy;

    // Check boundaries
    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
        addMessage("Ouch! You bumped into the edge of the world.");
        return false; // No turn taken
    }

    // Check grid validity before accessing
    if (!grid[newY] || !grid[newY][newX]) {
         addMessage("Error: Tried to move into invalid grid space.");
         console.error(`Invalid grid access attempt at ${newX}, ${newY}`);
         return false; // No turn taken
    }


    // Check wall collision
    if (grid[newY][newX].blockMove) {
        addMessage("Bonk! You hit a wall.");
        return false; // No turn taken
    }

    // Check monster collision (Attack!)
    let targetMonster = null;
    for (let monster of monsters) {
        if (monster.x === newX && monster.y === newY) {
            targetMonster = monster;
            break;
        }
    }

    if (targetMonster) {
        attackMonster(player, targetMonster);
        return true; // Attacking counts as successful action/turn
    }

    // If no collision, move the player
    player.x = newX;
    player.y = newY;

    // Check if landing on stairs
    if (stairs && newX === stairs.x && newY === stairs.y) {
        addMessage("You see stairs leading down... 🔽 (Press '>' or '.' to descend)");
    }

    // Check if landing on an item
    let itemHere = null;
     for(let item of items) {
         if(item.x === newX && item.y === newY) {
             itemHere = item;
             break;
         }
     }
     if(itemHere) {
         addMessage(`You see a ${itemHere.name} (${itemHere.char}) here. (Press 'g' to get)`);
     }

    return true; // Successful move takes a turn
}

function attackMonster(attacker, target) {
    // Ensure attacker and target exist
    if (!attacker || !target) return;

    let damage = calculatePlayerDamage(attacker.level);
    addMessage(`You attack the ${target.name} (${target.char})!`);
    target.hp -= damage;
    addMessage(`The ${target.name} takes ${damage} damage.`);

    if (target.hp <= 0) {
        addMessage(`You defeated the ${target.name}! 🎉`);
        let xpGained = target.xpValue || 0;
        if (xpGained > 0) {
            addMessage(`You gain ${xpGained} XP.`);
            addXP(xpGained); // Add XP and check for level up
        }
        // Remove monster from the list
        monsters = monsters.filter(m => m !== target);
    }
}

function attackPlayer(attacker, target) {
     // Ensure attacker and target exist
     if (!attacker || !target) return;

    let damage = attacker.damage || 1;
    addMessage(`The ${attacker.name} (${attacker.char}) attacks you!`);
    target.hp -= damage;
    addMessage(`You take ${damage} damage.`);

    // Game over check is now done in main loop after all monster turns
    // if (target.hp <= 0) { /* ... set gameOver state ... */ }
}

function addXP(amount) {
    if (!player || player.level >= 36) return; // No more XP if max level or no player

    player.xp += amount;
    checkLevelUp();
}

function checkLevelUp() {
    if (!player) return;

    const maxLevel = 36;
    // Check level cap first
    if (player.level >= maxLevel) {
        // Ensure XP state is consistent at max level
        if (player.xpToNextLevel !== 0) {
             // This should only happen once when reaching max level
             addMessage("You have reached the maximum level!");
             player.xp = 0; // Optional: Reset XP?
             player.xpToNextLevel = 0; // Indicate no more levels
        }
        return; // Already max level or just reached it
    }

    // Check if XP is sufficient to level up
    while (player.xp >= player.xpToNextLevel && player.level < maxLevel) {
        player.level++;
        addMessage(`✨ Ding! You reached Level ${player.level}! ✨`);

        // Increase stats
        let hpGain = 10 + floor(player.level / 2);
        player.maxHp += hpGain;
        player.hp = player.maxHp; // Full heal on level up!
        player.baseDamage += (player.level % 3 === 0) ? 1 : 0; // Increase base damage every 3 levels

        addMessage(`Max HP increased to ${player.maxHp}. Damage potential increased!`);

        // Set XP needed for the *next* level
        if (player.level >= maxLevel) {
             addMessage("You have reached the maximum level!");
             player.xp = 0;
             player.xpToNextLevel = 0;
             // Break here since we are already at max level after this loop iteration
             break;
        } else {
            player.xpToNextLevel = calculateXpForLevel(player.level + 1);
        }
    }
}


function handleMonsterTurns() {
    // Ensure player and grid exist
    if (!player || !grid) return;

    for (let i = monsters.length - 1; i >= 0; i--) {
        let monster = monsters[i];
        if (!monster) continue; // Should not happen with filter, but safety

        let dx = 0;
        let dy = 0;
        let distanceToPlayer = dist(monster.x, monster.y, player.x, player.y);

        // AI: Move towards player if nearby and visible
        if (distanceToPlayer < 8 && hasLineOfSight(monster.x, monster.y, player.x, player.y)) {
            // Basic pathfinding towards player
            if (player.x > monster.x) dx = 1; else if (player.x < monster.x) dx = -1;
            if (player.y > monster.y) dy = 1; else if (player.y < monster.y) dy = -1;

            // Crude check to avoid diagonal move if cardinal is blocked
            if (dx !== 0 && dy !== 0) {
                 // Check if horizontal or vertical path is blocked
                 let canMoveH = !isBlocked(monster.x + dx, monster.y);
                 let canMoveV = !isBlocked(monster.x, monster.y + dy);

                 if (!canMoveH && canMoveV) { dx = 0; } // Blocked H, try V
                 else if (canMoveH && !canMoveV) { dy = 0; } // Blocked V, try H
                 else if (!canMoveH && !canMoveV) { // Both blocked, maybe random axis?
                      if (random() < 0.5) dx = 0; else dy = 0;
                 }
                 // If both are possible, it will try diagonal below
            }
        } else { // If player not nearby/visible, move randomly
            let r = floor(random(5)); // ~20% chance to stay put
            if (r === 0) dx = 1;
            else if (r === 1) dx = -1;
            else if (r === 2) dy = 1;
            else if (r === 3) dy = -1;
            // else dx=0, dy=0 (stay put)
        }

        let newX = monster.x + dx;
        let newY = monster.y + dy;

        // Check validity of target tile
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !isBlocked(newX, newY)) {
             // Check if target is player
             if (newX === player.x && newY === player.y) {
                 attackPlayer(monster, player); // Attack!
             } else if (!isOccupiedByMonster(newX, newY)) { // Check if another monster is there
                // Move monster
                monster.x = newX;
                monster.y = newY;
             }
             // else: Target tile occupied by another monster, monster stays put
        }
         // else: Monster tried to move into wall or out of bounds, stays put
    }
}

function isBlocked(x, y) {
     // Check grid bounds first
     if (x < 0 || x >= cols || y < 0 || y >= rows) {
         return true;
     }
     // Check grid validity before accessing
     if (!grid || !grid[y] || !grid[y][x]) {
         console.warn(`isBlocked: Invalid grid access at ${x},${y}`);
         return true; // Treat invalid grid as blocked
     }
     // Check grid tile type
     return grid[y][x].blockMove;
}

function isOccupiedByMonster(x, y) {
    for (let m of monsters) {
        if (m.x === x && m.y === y) return true;
    }
    return false;
}


function pickUpItem() {
    // Ensure player exists
    if (!player) return false;

    let itemIndex = -1;
    for (let i = 0; i < items.length; i++) {
        if (items[i].x === player.x && items[i].y === player.y) {
            itemIndex = i;
            break;
        }
    }

    if (itemIndex !== -1) {
        let item = items[itemIndex];
        addMessage(`You pick up the ${item.name} (${item.char}).`);

        if (item.type === 'treasure') {
            player.gold += item.value;
        } else if (item.type === 'potion') {
            player.inventory.push(item); // Add to inventory
        }
        // Remove item from the ground
        items.splice(itemIndex, 1);
        return true; // Picking up takes a turn

    } else {
        addMessage("There is nothing here to pick up.");
        return false; // No item, no turn taken
    }
}

function quaffPotion() {
    // Ensure player exists
    if (!player) return;

    let potionToQuaff = null;
    let potionIndex = -1;

    // Find the first potion in inventory
    for (let i = 0; i < player.inventory.length; i++) {
        // Check if it's actually a potion (inventory might hold other things later)
        if (player.inventory[i] && player.inventory[i].type === 'potion') {
            potionToQuaff = player.inventory[i];
            potionIndex = i;
            break;
        }
    }

    if (potionToQuaff) {
        addMessage(`You quaff the ${potionToQuaff.name} (${potionToQuaff.char})...`);
        // Apply effect
        if (potionToQuaff.effect === 'heal') {
            let healAmount = min(player.maxHp - player.hp, potionToQuaff.power); // Heal up to maxHP
            player.hp += healAmount;
            addMessage(`You feel healthier! (+${healAmount} HP)`);
        } else if (potionToQuaff.effect === 'teleport') {
             addMessage("Woah! Everything spins!"); // TODO: Implement teleport
             // Find random empty floor tile and move player there
        } else {
            addMessage("...but nothing interesting happens.");
        }

        // Remove potion from inventory
        player.inventory.splice(potionIndex, 1);

    } else {
        addMessage("You have no potions to quaff!");
    }
    // Quaffing (attempting) always takes a turn, handled in keyPressed
}

function descendStairs() {
     // Ensure player and stairs exist
     if (!player || !stairs) return;

     // Double check player is on stairs (already done in keyPressed, but safety)
     if (player.x === stairs.x && player.y === stairs.y) {
         addMessage("You descend deeper into the dungeon...");
         currentLevel++;
         generateLevel(); // Generate new layout, monsters, items
         // Check if generation failed and put game into error state
         if (gameState !== 'error') {
            addMessage(`Welcome to Dungeon Level ${currentLevel}.`);
         }
     } else {
         addMessage("Something went wrong - tried to descend when not on stairs?");
     }
}


// --- Easter Egg Handling ---
function handleEasterEggInput(key, keyCode) {
    if (keyCode === ENTER) {
        processEasterEgg(easterEggInput);
        // Only revert to playing state if not set to error by cheat
        if (gameState === 'easterEggInput') gameState = 'playing';
        easterEggInput = '';
    } else if (keyCode === BACKSPACE) {
        easterEggInput = easterEggInput.slice(0, -1); // Remove last character
    } else if (keyCode === ESCAPE) {
        gameState = 'playing'; // Cancel
        easterEggInput = '';
        addMessage("Easter egg input cancelled.");
    } else if (key.length === 1 && easterEggInput.length < 30) { // Append printable characters, limit length
        easterEggInput += key;
    }
    // Ignore other keys like Shift, Ctrl, etc.
}

function processEasterEgg(command) {
    // Ensure player exists for cheats affecting player
    if (!player && ['healme', 'goldpls', 'levelup', 'godmode'].includes(command)) {
        addMessage("Cannot use player cheat - player doesn't exist?");
        return;
    }

    command = command.toLowerCase().trim();
    addMessage(`Easter Egg attempt: "${command}"`);
    if (command === "showoff") {
        showAll = !showAll;
        addMessage(showAll ? "Tada! Revealed!" : "Hiding map.");
    } else if (command === "kiellemall") {
        addMessage("Begone!");
        monsters = [];
    } else if (command === "healme") {
        player.hp = player.maxHp;
        addMessage("Refreshed!");
    } else if (command === "goldpls") {
         player.gold += 1000;
         addMessage("💰💰💰 Bling! 💰💰💰");
    } else if (command === "levelup") {
         if (player.level < 36) {
             // Ensure xpToNextLevel is valid before using it
             if (player.xpToNextLevel > 0) {
                addXP(player.xpToNextLevel - player.xp); // Give exactly enough XP
                addMessage("Level up!");
             } else {
                 addMessage("Cannot level up, next level XP calculation issue?");
             }
         } else {
             addMessage("Already max level!");
         }
    } else if (command === "godmode") {
         player.hp = 9999; player.maxHp = 9999; player.baseDamage = 100;
         addMessage("DEUS VULT!");
    } else if (command === "die") { // Example new cheat
        player.hp = 0;
        addMessage("You feel unwell...");
        // Game over will trigger after next turn check potentially
    } else {
        addMessage("Nothing happens... Maybe you typed it wrong? 😉");
    }
}
