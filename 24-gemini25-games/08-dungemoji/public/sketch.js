// sketch.js - Your Emoji Rogue-like Adventure! V2

// --- Configurable Stuff ---
let visibilityRadius = 2; // How far the player can see
const minRoomSize = 2; // Min width/height of a room
const maxRoomSize = 7; // Max width/height of a room (adjust as needed)
const numRoomsTry = 100; // How many times we try to place a room

// --- NEW: Monster Definition ---
const monsterTypes = [ // Define our lovely monsters (NOW WITH FANTASY!)
    // name, char, hp, xpValue, damage, minLevel (dungeon level to start appearing)
    { name: 'Giant Rat',   char: '🐀', hp: 3,  xpValue: 5,  damage: 1, minLevel: 1 },
    { name: 'Goblin',      char: '👺', hp: 6,  xpValue: 10, damage: 1, minLevel: 1 },
    { name: 'Giant Spider',char: '🕷️', hp: 5,  xpValue: 12, damage: 2, minLevel: 2 },
    { name: 'Orc',         char: '👹', hp: 12, xpValue: 25, damage: 3, minLevel: 3 },
    { name: 'Wolf',        char: '🐺', hp: 8,  xpValue: 18, damage: 2, minLevel: 3 },
    { name: 'Slime',       char: '🦠', hp: 15, xpValue: 20, damage: 1, minLevel: 4 }, // Low damage, high hp
    { name: 'Ogre',        char: '🦍', hp: 25, xpValue: 50, damage: 4, minLevel: 5 }, // Using Gorilla emoji for Ogre
    { name: 'Skeleton',    char: '💀', hp: 10, xpValue: 30, damage: 2, minLevel: 6 },
    { name: 'DRAGON',      char: '🐉', hp: 100, xpValue: 500, damage: 10, minLevel: 10 } // The big one!
];

// --- Item Definitions (Unchanged, but could add more) ---
const treasureTypes = [ // Shiny things!
    { char: '💰', name: 'Bag o\' Gold', value: 10 },
    { char: '💎', name: 'Shiny Diamond', value: 50 },
    { char: '👑', name: 'Lost Crown', value: 100 }
];
const potionTypes = [ // Glug glug!
    { char: '🧪', name: 'Healing Potion', effect: 'heal', power: 15 }, // Slightly stronger heal
    { char: '✨', name: 'Sparkle Potion', effect: 'teleport', power: 0 } // Maybe add teleport later?
];

// --- Game State Variables ---
let grid = [];
let cols, rows;
let tileSize = 20; // Size of each tile in pixels
let player;
let monsters = [];
let items = [];
let stairs = null; // { x, y }
let rooms = []; // Store room data { x, y, w, h }
let currentLevel = 1; // Dungeon Level
let messageLog = ["Welcome, brave 🧑‍🚀!", "Press 'H' for help."];
let maxMessages = 5;
let gameOver = false;
let showAll = false; // Easter egg flag
let inputMode = 'game'; // 'game' or 'easter_egg'
let easterEggInput = '';

// --- Player Definition ---
function createPlayer(x, y) {
    return {
        x: x,
        y: y,
        char: '🧑‍🚀',
        hp: 30,         // Start with a bit more HP
        maxHp: 30,
        inventory: [],
        gold: 0,
        // --- NEW: XP and Leveling ---
        level: 1,       // Player Level (starts at 1)
        xp: 0,
        xpToNextLevel: 200, // XP needed for Level 2 (Adjusted starting value)
        baseDamage: 2      // Player's starting base damage
    };
}

// --- NEW: Calculate XP Needed for a Level ---
function calculateXpForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 200; // Base XP for level 2
    // Exponential formula: PrevLevelXP * 2 (simplified from 2000 * 2^(L-2))
    return calculateXpForLevel(level - 1) * 2;
}

// --- NEW: Calculate Player Damage based on Level ---
function calculatePlayerDamage(playerLevel) {
    // Example: Increase damage every few levels
    return player.baseDamage + floor(playerLevel / 3);
}


// --- p5.js Core Functions ---
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('monospace'); // Use a monospace font for grid alignment
    calculateGridSize();
    startGame();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateGridSize();
    // Optional: Could try to rescale drawing, but recalculating grid is easier for now
}

function draw() {
    background(0); // Pitch black darkness!

    if (gameOver) {
        displayGameOver();
        return;
    }

    updateVisibility();
    drawMap();
    drawItems();
    drawMonsters();
    drawPlayer();
    drawUI();

    if (inputMode === 'easter_egg') {
        drawEasterEggInput();
    }
}

function keyPressed() {
    if (gameOver) return; // No actions when game over

    if (inputMode === 'easter_egg') {
        handleEasterEggInput(key, keyCode);
        return;
    }

    // Game input mode
    let moved = false;
    let playerTurnTaken = false; // Did the player do something that costs a turn?

    // --- Movement and Actions (Mostly unchanged, check key bindings) ---
    if (keyCode === UP_ARROW || key === 'k' || key === 'K') {
        moved = movePlayer(0, -1);
        playerTurnTaken = true;
    } else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') {
        moved = movePlayer(0, 1);
        playerTurnTaken = true;
    } else if (keyCode === LEFT_ARROW || key === 'h' || key === 'H' && !(key === 'H')) { // Ensure 'H' itself doesn't move
        moved = movePlayer(-1, 0);
        playerTurnTaken = true;
    } else if (keyCode === RIGHT_ARROW || key === 'l' || key === 'L') {
        moved = movePlayer(1, 0);
        playerTurnTaken = true;
    } else if (key === 'q' || key === 'Q') {
        quaffPotion();
        playerTurnTaken = true; // Attempting to quaff takes a turn
    } else if (key === 'g' || key === 'G') {
        pickUpItem();
        playerTurnTaken = true; // Attempting to pick up takes a turn
    } else if (key === '>' || key === '.') { // Use stairs
        if (player.x === stairs.x && player.y === stairs.y) {
            descendStairs();
            // Descending doesn't count as a turn *on this level*, it starts the next
        } else {
             addMessage("You aren't on the stairs ('>').");
        }
    } else if (key === 'H') { // Help - Case sensitive H only
        displayHelp();
        // Viewing help doesn't take a turn
    } else if (key === '^') {
        inputMode = 'easter_egg';
        easterEggInput = '';
        addMessage("Enter Easter Egg command:");
        // Entering input mode doesn't take a turn yet
    }
    // --- Add other commands here! ---
    // Example: else if (key === 'i' || key === 'I') { displayInventory(); }

    // --- Monster Turn ---
    if (playerTurnTaken && !gameOver) { // Only if player did something and isn't dead
        handleMonsterTurns();
    }

    // Prevent default browser behavior for arrow keys etc.
    // return false; // Uncomment if keys cause page scrolling
}

// --- Game Initialization ---
function calculateGridSize() {
    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - 5; // Reserve ~5 rows for UI at the bottom
    if (cols < 10 || rows < 10) {
        console.error("Screen too small for a playable grid!");
    }
}

function startGame() {
    currentLevel = 1; // Dungeon Level
    gameOver = false;
    showAll = false;
    inputMode = 'game';
    // Reset player stats if restarting (but keep track of player object)
    if (player) {
        player.level = 1;
        player.xp = 0;
        player.xpToNextLevel = calculateXpForLevel(2); // XP for level 2
        player.maxHp = 30;
        player.hp = player.maxHp;
        player.baseDamage = 2;
        player.gold = 0;
        player.inventory = [];
    }
    messageLog = ["Welcome, brave 🧑‍🚀!", "Level " + currentLevel + ". Press 'H' for help."];
    generateLevel(); // This will create/position the player if needed
}

function generateLevel() {
    console.log("Generating Dungeon Level", currentLevel);
    rooms = [];
    monsters = [];
    items = [];
    stairs = null;

    // 1. Initialize grid with walls
    grid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        grid[r] = new Array(cols);
        for (let c = 0; c < cols; c++) {
            grid[r][c] = { type: 'wall', char: '🧱', discovered: false, visible: false, blockMove: true, blockSight: true };
        }
    }

    // 2. Place rooms
    for (let i = 0; i < numRoomsTry; i++) {
        createRoom();
    }
     if (rooms.length === 0) {
        console.error("Failed to place any rooms! Retrying generation.");
        generateLevel();
        return;
    }


    // 3. Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        let r1 = rooms[i];
        let r2 = rooms[i - 1];
        let x1 = floor(r1.x + r1.w / 2);
        let y1 = floor(r1.y + r1.h / 2);
        let x2 = floor(r2.x + r2.w / 2);
        let y2 = floor(r2.y + r2.h / 2);
        createCorridor(x1, y1, x2, y2);
    }

    // 4. Place player in the center of the first room
    let startRoom = rooms[0];
    let playerStartX = floor(startRoom.x + startRoom.w / 2);
    let playerStartY = floor(startRoom.y + startRoom.h / 2);
    if (!player) { // Create player only once at game start
       player = createPlayer(playerStartX, playerStartY);
    } else { // Just reposition the existing player
        player.x = playerStartX;
        player.y = playerStartY;
        // Ensure player HP is full on new level? Optional.
        // player.hp = player.maxHp;
    }


    // 5. Place stairs in the last room
     let endRoom = rooms[rooms.length - 1];
     placeStairs(endRoom);


    // 6. Place monsters
    // --- MODIFIED: Fewer monsters, considering level, skip start room ---
    let maxMonsters = floor(rooms.length / 3); // Average 1 monster per 3 rooms
    placeEntities(monsters, monsterTypes, maxMonsters, currentLevel, true); // Pass level, skip start room

    // 7. Place items (treasures and potions) - can also skip start room if desired
    placeEntities(items, treasureTypes, floor(rooms.length * 0.5), currentLevel, false);
    placeEntities(items, potionTypes, floor(rooms.length * 0.7), currentLevel, false);


    // Initial visibility update
    updateVisibility();
    console.log("Level generation complete. Player at:", player.x, player.y);
}


// --- Dungeon Generation Helpers ---

function createRoom() {
    // (Function unchanged)
    let w = floor(random(minRoomSize, maxRoomSize + 1));
    let h = floor(random(minRoomSize, maxRoomSize + 1));
    let x = floor(random(1, cols - w - 1));
    let y = floor(random(1, rows - h - 1));

    let newRoom = { x: x, y: y, w: w, h: h };

    let overlaps = false;
    for (let otherRoom of rooms) {
        if (rectOverlap(newRoom, otherRoom, 1)) {
            overlaps = true;
            break;
        }
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
    // (Function unchanged)
    return (
        r1.x < r2.x + r2.w + padding &&
        r1.x + r1.w + padding > r2.x &&
        r1.y < r2.y + r2.h + padding &&
        r1.y + r1.h + padding > r2.y
    );
}


function createCorridor(x1, y1, x2, y2) {
    // --- MODIFIED: Use '.' for corridor char ---
    let currentX = x1;
    let currentY = y1;

    while (currentX !== x2) {
        if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
             if (grid[currentY][currentX].type === 'wall') {
                 grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; // CHANGED char to '.'
             }
        } else {
             break;
        }
        currentX += (x2 > x1) ? 1 : -1;
    }
     if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
         grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; // CHANGED char to '.'
     }


    while (currentY !== y2) {
         if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
             if (grid[currentY][currentX].type === 'wall') {
                 grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; // CHANGED char to '.'
             }
         } else {
             break;
         }
        currentY += (y2 > y1) ? 1 : -1;
    }
      if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
          grid[currentY][currentX] = { type: 'corridor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false }; // CHANGED char to '.'
      }
}

function placeStairs(room) {
    // (Function largely unchanged, maybe add check to ensure room is not null)
    if (!room) {
        console.error("Cannot place stairs in null room!");
        // Fallback: try placing in a random room?
        if (rooms.length > 0) {
            room = random(rooms);
        } else {
            console.error("FATAL: No rooms exist to place stairs!");
            return; // Game is likely broken if this happens
        }
    }
     let placed = false;
     let attempts = 0;
     while (!placed && attempts < 100) {
         let sx = floor(random(room.x, room.x + room.w));
         let sy = floor(random(room.y, room.y + room.h));
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type === 'floor') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy };
             placed = true;
             console.log("Stairs placed at", sx, sy);
         }
         attempts++;
     }
     if (!placed) {
         console.error("Failed to place stairs in room!", room);
         // Fallback: place in the center? (As before)
         let sx = floor(room.x + room.w / 2);
         let sy = floor(room.y + room.h / 2);
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type !== 'wall') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy };
             console.warn("Fallback: Placed stairs at room center", sx, sy);
         } else {
             console.error("FATAL: Could not place stairs anywhere in the room.");
         }
     }
}


// --- MODIFIED: placeEntities now considers level and skipping start room ---
function placeEntities(entityList, sourceTypes, maxCount, dungeonLevel, skipStartRoom = false) {
    let placedCount = 0;
    let attempts = 0;
    let startRoom = rooms[0]; // Identify the start room

    // --- Filter sourceTypes based on dungeonLevel (for monsters) ---
    let availableTypes = sourceTypes;
    if (sourceTypes === monsterTypes) { // Only filter if placing monsters
        availableTypes = sourceTypes.filter(type => dungeonLevel >= type.minLevel);
        if (availableTypes.length === 0) {
             console.warn(`No suitable monsters found for level ${dungeonLevel}`);
             return; // Don't place anything if no types are available
        }
    }


    while (placedCount < maxCount && attempts < maxCount * 20) { // Increased attempts limit slightly
        let roomIndex = floor(random(rooms.length));
        let room = rooms[roomIndex];

        // --- Check if we should skip this room ---
        if (skipStartRoom && room === startRoom) {
            attempts++; // Count as an attempt but don't place here
            continue;
        }

        let ex = floor(random(room.x, room.x + room.w));
        let ey = floor(random(room.y, room.y + room.h));

        if (ey >= 0 && ey < rows && ex >= 0 && ex < cols &&
            grid[ey][ex].type === 'floor' &&
            !(player && ex === player.x && ey === player.y) && // Avoid player start
             !(stairs && ex === stairs.x && ey === stairs.y) && // Avoid stairs
            !isOccupied(ex, ey))
        {
            let type = random(availableTypes); // Pick from filtered types
            let newEntity = {
                x: ex,
                y: ey,
                char: type.char,
                name: type.name,
                // Add specific properties based on type
                 ...(type.hp && { hp: type.hp, maxHp: type.hp, damage: type.damage, xpValue: type.xpValue }), // Monster props
                ...(type.value && { value: type.value, type: 'treasure' }), // Treasure props
                ...(type.effect && { effect: type.effect, power: type.power, type: 'potion' }) // Potion props
            };
            entityList.push(newEntity);
            placedCount++;
        }
        attempts++;
    }
     // console.log(`Placed ${placedCount}/${maxCount} entities of type ${availableTypes[0]?.name || 'various'}`);
}

// (Function unchanged)
function isOccupied(x, y) {
    for (let m of monsters) {
        if (m.x === x && m.y === y) return true;
    }
    for (let i of items) {
        if (i.x === x && i.y === y) return true;
    }
    return false;
}


// --- Drawing Functions ---

function drawMap() {
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.8);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = grid[r][c];
            let x = c * tileSize + tileSize / 2;
            let y = r * tileSize + tileSize / 2;

            let charToDraw = tile.char;
            let tileColor = color(50); // Default dark grey for discovered

            // Determine base color based on visibility
            if (showAll || tile.visible) {
                // Visible: Brighter colors
                if (tile.type === 'wall') tileColor = color(150, 150, 150); // Grey wall
                else if (tile.type === 'floor') tileColor = color(100, 100, 100); // Darker Floor
                else if (tile.type === 'corridor') tileColor = color(130, 110, 90); // Slightly brownish corridor floor
                else if (tile.type === 'stairs') { tileColor = color(255, 255, 0); charToDraw = '🔽'; } // Yellow stairs
                else tileColor = color(200); // Default visible bright
            } else if (tile.discovered) {
                 // Discovered but not visible: Dim colors
                if (tile.type === 'wall') tileColor = color(80, 80, 80);
                else if (tile.type === 'floor') tileColor = color(50, 50, 50);
                else if (tile.type === 'corridor') tileColor = color(60, 50, 40);
                else if (tile.type === 'stairs') { tileColor = color(100, 100, 0); charToDraw = '🔽'; }
                 else tileColor = color(50);
            } else {
                // Not discovered: Draw nothing (background is black)
                continue; // Skip drawing this tile
            }

             fill(tileColor);
             text(charToDraw, x, y);
        }
    }
}

// (drawPlayer, drawMonsters, drawItems functions unchanged)
function drawPlayer() {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.8);
    text(player.char, player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
}

function drawMonsters() {
     fill(255, 100, 100); // Slightly less intense Red for monsters
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let monster of monsters) {
         if (grid[monster.y][monster.x].visible || showAll) {
            text(monster.char, monster.x * tileSize + tileSize / 2, monster.y * tileSize + tileSize / 2);
         }
     }
}

function drawItems() {
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let item of items) {
         if (grid[item.y][item.x].visible || showAll) {
            if (item.type === 'treasure') {
                fill(255, 215, 0); // Gold
            } else if (item.type === 'potion') {
                fill(0, 255, 255); // Cyan
            } else {
                fill(200);
            }
            text(item.char, item.x * tileSize + tileSize / 2, item.y * tileSize + tileSize / 2);
         }
     }
}


function drawUI() {
    // --- MODIFIED: Add Player Level and XP Bar ---
    let uiY = rows * tileSize;
    let uiHeight = height - uiY;
    let line1Y = uiY + 5;
    let line2Y = uiY + 25;
    let msgY = uiY + 45; // Start messages below XP bar

    // Clear UI area
    fill(20, 20, 20);
    noStroke();
    rect(0, uiY, width, uiHeight);

    // --- Line 1: HP Bar and Stats ---
    let hpBarWidth = 150;
    let barHeight = 15;
    // HP Bar Background
    fill(100, 0, 0);
    rect(10, line1Y, hpBarWidth, barHeight);
    // HP Bar Foreground
    fill(0, 200, 0);
    let currentHpWidth = map(player.hp, 0, player.maxHp, 0, hpBarWidth);
    rect(10, line1Y, max(0, currentHpWidth), barHeight);
    // HP Text & other stats
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`HP: ${player.hp}/${player.maxHp} | Lvl: ${player.level} | D Lvl: ${currentLevel} | Gold: ${player.gold}`, 15 + hpBarWidth, line1Y);

    // --- Line 2: XP Bar ---
    let xpBarWidth = 150;
     // XP Bar Background
     fill(50, 50, 100); // Dark Blue/Purple
     rect(10, line2Y, xpBarWidth, barHeight);
     // XP Bar Foreground
     fill(100, 100, 255); // Lighter Blue/Purple
     let currentXpWidth = 0;
     if (player.level < 36) { // Don't divide by zero if max level has 0 XP needed
         currentXpWidth = map(player.xp, 0, player.xpToNextLevel, 0, xpBarWidth);
     } else {
         currentXpWidth = xpBarWidth; // Max level shows full bar
     }
     rect(10, line2Y, max(0, currentXpWidth), barHeight);
     // XP Text
     fill(255);
     textAlign(LEFT, TOP);
     let xpText = `XP: ${player.xp}/${player.xpToNextLevel}`;
     if(player.level >= 36) xpText = "XP: MAX LEVEL";
     text(xpText, 15 + xpBarWidth, line2Y);

    // Message Log
    textSize(12);
    textAlign(LEFT, TOP);
    for (let i = 0; i < messageLog.length; i++) {
        fill(200); // Dimmer text for log
        text(messageLog[i], 10, msgY + i * 15);
    }
}

// (addMessage function unchanged)
function addMessage(msg) {
    console.log("Message:", msg);
    messageLog.unshift(msg);
    if (messageLog.length > maxMessages) {
        messageLog.pop();
    }
}

// (drawEasterEggInput function unchanged)
function drawEasterEggInput() {
    let boxWidth = 300;
    let boxHeight = 40;
    let boxX = width / 2 - boxWidth / 2;
    let boxY = height / 2 - boxHeight / 2;

    fill(50, 50, 150, 200);
    stroke(255);
    rect(boxX, boxY, boxWidth, boxHeight);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(`> ${easterEggInput}_`, boxX + 10, boxY + boxHeight / 2);
}

// (displayHelp function unchanged, but good to keep updated)
function displayHelp() {
     addMessage("--- Help ---");
     addMessage("Arrows/hjkl: Move / Attack");
     addMessage("g: Get item");
     addMessage("q: Quaff potion");
     addMessage(">: Use stairs (when on them)");
     addMessage("^: Enter Easter Egg mode");
     addMessage("H: Show this help");
     addMessage("------------");
}

// (displayGameOver function unchanged)
function displayGameOver() {
    fill(150, 0, 0, 200);
    rect(0, 0, width, height);

    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(24);
    text(`You reached player level ${player.level} on dungeon level ${currentLevel}.`, width / 2, height / 2 + 10);
     text(`Final Gold: ${player.gold}.`, width / 2, height / 2 + 40);
    text("Press F5 or Refresh to play again!", width / 2, height / 2 + 80);
    noLoop();
}


// --- Game Logic ---

// (updateVisibility and hasLineOfSight functions unchanged)
function updateVisibility() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c].visible = false;
        }
    }

    let px = player.x;
    let py = player.y;
    for (let r = max(0, py - visibilityRadius); r <= min(rows - 1, py + visibilityRadius); r++) {
        for (let c = max(0, px - visibilityRadius); c <= min(cols - 1, px + visibilityRadius); c++) {
            let d = dist(px, py, c, r);
            if (d <= visibilityRadius) {
                 if (hasLineOfSight(px, py, c, r)) {
                     grid[r][c].visible = true;
                     grid[r][c].discovered = true;
                 }
            }
        }
    }
     if (py >= 0 && py < rows && px >= 0 && px < cols) {
        grid[py][px].visible = true;
        grid[py][px].discovered = true;
     }
}

function hasLineOfSight(x0, y0, x1, y1) {
    let dx = abs(x1 - x0);
    let dy = -abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
         if (x0 >= 0 && x0 < cols && y0 >= 0 && y0 < rows) {
            if (grid[y0][x0].blockSight && !(x0 === x1 && y0 === y1)) {
                return false;
            }
         } else {
             return false;
         }

        if (x0 === x1 && y0 === y1) break;

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
    return true;
}


function movePlayer(dx, dy) {
    // (Largely unchanged, just ensure it calls the updated attackMonster)
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
        addMessage("Ouch! You bumped into the edge of the world.");
        return false;
    }

    if (grid[newY][newX].blockMove) {
        addMessage("Bonk! You hit a wall. 🧱");
        return false;
    }

    let targetMonster = null;
    for (let monster of monsters) {
        if (monster.x === newX && monster.y === newY) {
            targetMonster = monster;
            break;
        }
    }

    if (targetMonster) {
        attackMonster(player, targetMonster); // Calls the updated attack function
        return true;
    }

    player.x = newX;
    player.y = newY;

    if (stairs && newX === stairs.x && newY === stairs.y) {
        addMessage("You see stairs leading down... 🔽 (Press '>' or '.' to descend)");
    }

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

    return true;
}

function attackMonster(attacker, target) {
    // --- MODIFIED: Use player damage, award XP ---
    let damage = calculatePlayerDamage(attacker.level); // Use calculated damage
    addMessage(`You attack the ${target.name} (${target.char})!`);
    target.hp -= damage;
    addMessage(`The ${target.name} takes ${damage} damage.`);

    if (target.hp <= 0) {
        addMessage(`You defeated the ${target.name}! 🎉`);
        // --- NEW: Award XP ---
        let xpGained = target.xpValue || 0; // Get XP value from monster type
        if (xpGained > 0) {
            addMessage(`You gain ${xpGained} XP.`);
            addXP(xpGained); // Add XP and check for level up
        }
        // Remove monster from the list
        monsters = monsters.filter(m => m !== target);
    }
}

function attackPlayer(attacker, target) {
     // --- MODIFIED: Use monster's damage value ---
    let damage = attacker.damage || 1; // Get damage from monster type (fallback to 1)
    addMessage(`The ${attacker.name} (${attacker.char}) attacks you!`);
    target.hp -= damage;
    addMessage(`You take ${damage} damage.`);

    if (target.hp <= 0) {
        addMessage(`💀 You have been slain by the ${attacker.name}! 💀`);
        player.char = '☠️'; // Change player character on death
        gameOver = true;
    }
}

// --- NEW: Function to add XP and check for Level Up ---
function addXP(amount) {
    if (player.level >= 36) return; // No more XP if max level

    player.xp += amount;
    checkLevelUp();
}

// --- NEW: Function to handle Level Up ---
function checkLevelUp() {
    const maxLevel = 36;
    if (player.level >= maxLevel) {
        player.xp = 0; // Optional: Reset XP at max level? Or just cap it.
        player.xpToNextLevel = 0; // Indicate no more levels
        return;
    }

    while (player.xp >= player.xpToNextLevel) {
        player.level++;
        addMessage(`✨ Ding! You reached Level ${player.level}! ✨`);

        // Increase stats
        let hpGain = 10 + floor(player.level / 2); // More HP per level as you get higher
        player.maxHp += hpGain;
        player.hp = player.maxHp; // Full heal on level up!
        player.baseDamage += (player.level % 3 === 0) ? 1 : 0; // Increase base damage every 3 levels

        addMessage(`Max HP increased to ${player.maxHp}. Damage potential increased!`);

        // Set XP needed for the *next* level
        if (player.level >= maxLevel) {
             addMessage("You have reached the maximum level!");
             player.xp = 0;
             player.xpToNextLevel = 0;
             break; // Exit loop if max level hit
        } else {
            player.xpToNextLevel = calculateXpForLevel(player.level + 1);
        }
    }
}


function handleMonsterTurns() {
    // (Largely unchanged, but uses monster damage now)
    for (let i = monsters.length - 1; i >= 0; i--) {
        let monster = monsters[i];
        if (!monster) continue;

        let dx = 0;
        let dy = 0;
        let distanceToPlayer = dist(monster.x, monster.y, player.x, player.y);

        if (distanceToPlayer < 8 && hasLineOfSight(monster.x, monster.y, player.x, player.y)) { // Increased sight range slightly
            if (player.x > monster.x) dx = 1;
            else if (player.x < monster.x) dx = -1;
            if (player.y > monster.y) dy = 1;
            else if (player.y < monster.y) dy = -1;

            if (dx !== 0 && dy !== 0) {
                 if (isBlocked(monster.x + dx, monster.y) && !isBlocked(monster.x, monster.y + dy)) {
                     dx = 0;
                 } else if (!isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)) {
                     dy = 0;
                 } else if (isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)){
                      if (random() < 0.5) dx = 0; else dy = 0;
                 }
            }

        } else {
            let r = floor(random(5)); // 1 in 5 chance of staying put
            if (r === 0) dx = 1;
            else if (r === 1) dx = -1;
            else if (r === 2) dy = 1;
            else if (r === 3) dy = -1;
            // else dx=0, dy=0
        }

        let newX = monster.x + dx;
        let newY = monster.y + dy;

        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !isBlocked(newX, newY)) {
             if (newX === player.x && newY === player.y) {
                 attackPlayer(monster, player); // Uses monster's damage
             } else if (!isOccupiedByMonster(newX, newY)) {
                monster.x = newX;
                monster.y = newY;
             }
        }
    }
}

// (isBlocked and isOccupiedByMonster functions unchanged)
function isBlocked(x, y) {
     if (x < 0 || x >= cols || y < 0 || y >= rows) {
         return true;
     }
     return grid[y][x].blockMove;
}

function isOccupiedByMonster(x, y) {
    for (let m of monsters) {
        if (m.x === x && m.y === y) return true;
    }
    return false;
}


// (pickUpItem and quaffPotion functions unchanged, check potion power)
function pickUpItem() {
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
            player.inventory.push(item);
        }
        items.splice(itemIndex, 1);

    } else {
        addMessage("There is nothing here to pick up.");
    }
}

function quaffPotion() {
    let potionToQuaff = null;
    let potionIndex = -1;

    for (let i = 0; i < player.inventory.length; i++) {
        if (player.inventory[i].type === 'potion') {
            potionToQuaff = player.inventory[i];
            potionIndex = i;
            break;
        }
    }

    if (potionToQuaff) {
        addMessage(`You quaff the ${potionToQuaff.name} (${potionToQuaff.char})...`);
        if (potionToQuaff.effect === 'heal') {
            let healedAmount = min(player.maxHp - player.hp, potionToQuaff.power); // Heal up to maxHP
            player.hp += healedAmount;
            addMessage(`You feel healthier! (+${healedAmount} HP)`);
        } else if (potionToQuaff.effect === 'teleport') {
             addMessage("Woah! Everything spins!"); // Still placeholder
        } else {
            addMessage("...but nothing interesting happens.");
        }

        player.inventory.splice(potionIndex, 1);

    } else {
        addMessage("You have no potions to quaff!");
    }
}


function descendStairs() {
     // (Function unchanged)
     addMessage("You descend deeper into the dungeon...");
     currentLevel++;
     generateLevel();
     addMessage(`Welcome to Dungeon Level ${currentLevel}.`);
}


// --- Easter Egg Handling ---
// (Unchanged, but could add more like 'levelup')
function handleEasterEggInput(key, keyCode) {
    if (keyCode === ENTER) {
        processEasterEgg(easterEggInput);
        inputMode = 'game';
        easterEggInput = '';
    } else if (keyCode === BACKSPACE) {
        easterEggInput = easterEggInput.slice(0, -1);
    } else if (keyCode === ESCAPE) {
        inputMode = 'game';
        easterEggInput = '';
        addMessage("Easter egg input cancelled.");
    } else if (key.length === 1 && easterEggInput.length < 30) { // Limit input length
        easterEggInput += key;
    }
}

function processEasterEgg(command) {
    command = command.toLowerCase().trim();
    addMessage(`Easter Egg attempt: "${command}"`);
    if (command === "showoff") {
        showAll = !showAll;
        addMessage(showAll ? "Tada! The whole map is revealed!" : "Hiding the map again.");
    } else if (command === "kiellemall") {
        addMessage("Begone, foul beasts!");
        monsters = [];
    } else if (command === "healme") {
        player.hp = player.maxHp;
        addMessage("Feeling refreshed!");
    } else if (command === "goldpls") {
         player.gold += 1000;
         addMessage("💰💰💰 Bling! 💰💰💰");
    } else if (command === "levelup") { // NEW Easter Egg
         if (player.level < 36) {
             addXP(player.xpToNextLevel - player.xp); // Give exactly enough XP to level up
             addMessage("Level up via cheat!");
         } else {
             addMessage("Already max level!");
         }
    } else if (command === "godmode") { // NEW Easter Egg
         player.hp = 9999; player.maxHp = 9999; player.baseDamage = 100;
         addMessage("DEUS VULT!");
    } else {
        addMessage("Nothing happens... Maybe you typed it wrong? 😉");
    }
}
