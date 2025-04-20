// sketch.js - Your Emoji Rogue-like Adventure!

// --- Configurable Stuff ---
let visibilityRadius = 2; // How far the player can see
const minRoomSize = 2; // Min width/height of a room
const maxRoomSize = 7; // Max width/height of a room (adjust as needed)
const numRoomsTry = 100; // How many times we try to place a room
const monsterTypes = [ // Define our lovely monsters
    { char: '👾', name: 'Space Invader', hp: 5 },
    { char: '👻', name: 'Spoopy Ghost', hp: 3 },
    { char: '👽', name: 'Little Green Man', hp: 7 },
    { char: '👹', name: 'Oni', hp: 10 },
    { char: '🐙', name: 'Kraken Kid', hp: 8 }
];
const treasureTypes = [ // Shiny things!
    { char: '💰', name: 'Bag o\' Gold', value: 10 },
    { char: '💎', name: 'Shiny Diamond', value: 50 },
    { char: '👑', name: 'Lost Crown', value: 100 }
];
const potionTypes = [ // Glug glug!
    { char: '🧪', name: 'Healing Potion', effect: 'heal', power: 10 },
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
let currentLevel = 1;
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
        hp: 20,
        maxHp: 20,
        inventory: [],
        gold: 0
    };
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
    // We might need to regenerate the level or adjust tileSize dynamically if we want
    // the *same* dungeon to fit perfectly after resize.
    // For now, let's just ensure the canvas fills the screen.
    // We might need to call `startGame()` again if resizing changes `cols`/`rows` drastically.
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

    if (keyCode === UP_ARROW || key === 'k' || key === 'K') {
        moved = movePlayer(0, -1);
        playerTurnTaken = true;
    } else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') {
        moved = movePlayer(0, 1);
        playerTurnTaken = true;
    } else if (keyCode === LEFT_ARROW || key === 'h' || key === 'H') {
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
    } else if (key === 'h' || key === 'H') { // Lowercase 'h' is move left
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
    // Adjust tileSize to better fit? For now, keep it fixed.
    // Maybe calculate tileSize based on screen size?
    // let minDim = min(windowWidth, windowHeight);
    // tileSize = floor(minDim / 30); // Example: aim for ~30 tiles across smallest dimension

    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - 4; // Reserve ~4 rows for UI at the bottom
    if (cols < 10 || rows < 10) {
        console.error("Screen too small for a playable grid!");
        // Handle this case - maybe display a message?
    }
     // Center the grid rendering horizontally if needed
     // offsetX = (width - cols * tileSize) / 2;
     // offsetY = (height - (rows + 4) * tileSize) / 2; // Include UI height
}

function startGame() {
    currentLevel = 1;
    gameOver = false;
    showAll = false;
    inputMode = 'game';
    messageLog = ["Welcome, brave 🧑‍🚀!", "Level " + currentLevel + ". Press 'H' for help."];
    generateLevel();
}

function generateLevel() {
    console.log("Generating Level", currentLevel);
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
        // Fallback: maybe just create one big room? Or retry?
        generateLevel(); // Be careful of infinite loops here
        return;
    }


    // 3. Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        // Connect room 'i' to room 'i-1'
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
    if (!player) { // Create player only once
       player = createPlayer(playerStartX, playerStartY);
    } else { // Just reposition the existing player
        player.x = playerStartX;
        player.y = playerStartY;
    }


    // 5. Place stairs in the last room
     let endRoom = rooms[rooms.length - 1];
     placeStairs(endRoom);


    // 6. Place monsters
    placeEntities(monsters, monsterTypes, floor(rooms.length * 1.5)); // More monsters per room avg

    // 7. Place items (treasures and potions)
    placeEntities(items, treasureTypes, floor(rooms.length * 0.5)); // Fewer treasures
    placeEntities(items, potionTypes, floor(rooms.length * 0.7)); // Some potions


    // Initial visibility update
    updateVisibility();
     console.log("Level generation complete. Player at:", player.x, player.y);
}


// --- Dungeon Generation Helpers ---

function createRoom() {
    // Random dimensions
    let w = floor(random(minRoomSize, maxRoomSize + 1));
    let h = floor(random(minRoomSize, maxRoomSize + 1));
    // Random position (ensure it's within grid bounds, leaving 1 wall border)
    let x = floor(random(1, cols - w - 1));
    let y = floor(random(1, rows - h - 1));

    let newRoom = { x: x, y: y, w: w, h: h };

    // Check for overlap with existing rooms (add padding)
    let overlaps = false;
    for (let otherRoom of rooms) {
        if (rectOverlap(newRoom, otherRoom, 1)) { // Check with padding of 1
            overlaps = true;
            break;
        }
    }

    if (!overlaps) {
        // Carve the room
        for (let r = y; r < y + h; r++) {
            for (let c = x; c < x + w; c++) {
                 // Check bounds just in case, though calculation should prevent this
                 if (r >= 0 && r < rows && c >= 0 && c < cols) {
                     grid[r][c] = { type: 'floor', char: '.', discovered: false, visible: false, blockMove: false, blockSight: false };
                 }
            }
        }
        rooms.push(newRoom);
        // console.log(`Created room at (${x},${y}) size ${w}x${h}`);
    }
}

// Simple rectangle overlap check with padding
function rectOverlap(r1, r2, padding = 0) {
    return (
        r1.x < r2.x + r2.w + padding &&
        r1.x + r1.w + padding > r2.x &&
        r1.y < r2.y + r2.h + padding &&
        r1.y + r1.h + padding > r2.y
    );
}


function createCorridor(x1, y1, x2, y2) {
    // Simple L-shaped corridor: horizontal then vertical
    // console.log(`Creating corridor from (${x1},${y1}) to (${x2},${y2})`);
    let currentX = x1;
    let currentY = y1;

    // Move horizontally
    while (currentX !== x2) {
        // Ensure we don't carve outside bounds or into walls that *shouldn't* be carved
        if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
             if (grid[currentY][currentX].type === 'wall') { // Only carve walls
                 grid[currentY][currentX] = { type: 'corridor', char: '#', discovered: false, visible: false, blockMove: false, blockSight: false };
             }
        } else {
             console.warn("Corridor went out of bounds (horizontal)");
             break; // Stop carving if out of bounds
        }
        currentX += (x2 > x1) ? 1 : -1;
    }
     // Carve the corner/final horizontal step if needed
     if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
         grid[currentY][currentX] = { type: 'corridor', char: '#', discovered: false, visible: false, blockMove: false, blockSight: false };
     }


    // Move vertically
    while (currentY !== y2) {
         // Ensure we don't carve outside bounds
         if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
             if (grid[currentY][currentX].type === 'wall') { // Only carve walls
                 grid[currentY][currentX] = { type: 'corridor', char: '#', discovered: false, visible: false, blockMove: false, blockSight: false };
             }
         } else {
             console.warn("Corridor went out of bounds (vertical)");
             break; // Stop carving if out of bounds
         }
        currentY += (y2 > y1) ? 1 : -1;
    }
     // Carve the final vertical step if needed
      if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows && grid[currentY][currentX].type === 'wall') {
          grid[currentY][currentX] = { type: 'corridor', char: '#', discovered: false, visible: false, blockMove: false, blockSight: false };
      }
}

function placeStairs(room) {
     let placed = false;
     let attempts = 0;
     while (!placed && attempts < 100) {
         let sx = floor(random(room.x, room.x + room.w));
         let sy = floor(random(room.y, room.y + room.h));
         // Ensure it's within bounds and on a floor tile
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
         // Fallback: place in the center?
         let sx = floor(room.x + room.w / 2);
         let sy = floor(room.y + room.h / 2);
         if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && grid[sy][sx].type !== 'wall') {
             grid[sy][sx] = { type: 'stairs', char: '🔽', discovered: false, visible: false, blockMove: false, blockSight: false };
             stairs = { x: sx, y: sy };
             console.warn("Fallback: Placed stairs at room center", sx, sy);
         } else {
             console.error("FATAL: Could not place stairs anywhere in the room.");
             // Maybe pick another room? For now, game might be un-winnable.
         }
     }
}


function placeEntities(entityList, entityTypes, maxCount) {
    let placedCount = 0;
    let attempts = 0;
    while (placedCount < maxCount && attempts < maxCount * 10) { // Limit attempts
        let room = random(rooms); // Pick a random room
        let ex = floor(random(room.x, room.x + room.w));
        let ey = floor(random(room.y, room.y + room.h));

        // Check bounds and if the spot is valid (floor, not occupied by player/stairs/other entity)
        if (ey >= 0 && ey < rows && ex >= 0 && ex < cols &&
            grid[ey][ex].type === 'floor' &&
            !(player && ex === player.x && ey === player.y) && // Avoid player start
             !(stairs && ex === stairs.x && ey === stairs.y) && // Avoid stairs
            !isOccupied(ex, ey)) // Check monsters and items lists
        {
            let type = random(entityTypes);
            let newEntity = {
                x: ex,
                y: ey,
                char: type.char,
                name: type.name,
                // Add specific properties based on type
                ...(type.hp && { hp: type.hp, maxHp: type.hp }), // Monster props
                ...(type.value && { value: type.value, type: 'treasure' }), // Treasure props
                ...(type.effect && { effect: type.effect, power: type.power, type: 'potion' }) // Potion props
            };
            entityList.push(newEntity);
            placedCount++;
        }
        attempts++;
    }
     // console.log(`Placed ${placedCount}/${maxCount} entities of type ${entityTypes[0].name || 'various'}`);
}

// Check if a tile is occupied by any monster or item
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
    textSize(tileSize * 0.8); // Adjust emoji size relative to tile size

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = grid[r][c];
            let x = c * tileSize + tileSize / 2;
            let y = r * tileSize + tileSize / 2;

            if (showAll || tile.visible) {
                // Visible: Bright colors
                fill(tile.type === 'wall' || tile.type === 'corridor' ? 180 : 255); // Brighter wall/corridor?
                if (tile.type === 'floor') fill(100, 100, 100); // Dim floor
                if (tile.type === 'corridor') fill(150, 100, 50); // Brownish corridor
                if (tile.type === 'stairs') fill(255, 255, 0); // Yellow stairs
                 text(tile.char, x, y);
            } else if (tile.discovered) {
                // Discovered but not visible: Dim gray
                fill(tile.type === 'wall' || tile.type === 'corridor' ? 80 : 50);
                 if (tile.type === 'stairs') fill(100, 100, 0); // Dim Yellow stairs
                text(tile.char, x, y);
            } else {
                // Not discovered: Pitch black (already handled by background)
            }
        }
    }
}

function drawPlayer() {
    fill(255); // Player is always visible and bright
    textAlign(CENTER, CENTER);
    textSize(tileSize * 0.8);
    text(player.char, player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
}

function drawMonsters() {
     fill(255, 0, 0); // Red for monsters
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let monster of monsters) {
         if (grid[monster.y][monster.x].visible || showAll) { // Only draw if visible or showall
            text(monster.char, monster.x * tileSize + tileSize / 2, monster.y * tileSize + tileSize / 2);
         }
     }
}

function drawItems() {
     textAlign(CENTER, CENTER);
     textSize(tileSize * 0.8);
     for (let item of items) {
         if (grid[item.y][item.x].visible || showAll) { // Only draw if visible or showall
            if (item.type === 'treasure') {
                fill(255, 215, 0); // Gold for treasure
            } else if (item.type === 'potion') {
                fill(0, 255, 255); // Cyan for potions
            } else {
                fill(200); // Default grey
            }
            text(item.char, item.x * tileSize + tileSize / 2, item.y * tileSize + tileSize / 2);
         }
     }
}


function drawUI() {
    let uiY = rows * tileSize;
    let uiHeight = height - uiY;
    let barHeight = 20;
    let textY = uiY + barHeight + 15;
    let hpBarY = uiY + 5;
    let hpBarWidth = 200;

    // Clear UI area
    fill(20, 20, 20);
    noStroke();
    rect(0, uiY, width, uiHeight);

    // HP Bar
    fill(100, 0, 0); // Dark red background
    rect(10, hpBarY, hpBarWidth, barHeight);
    fill(0, 200, 0); // Green foreground
    let currentHpWidth = map(player.hp, 0, player.maxHp, 0, hpBarWidth);
    rect(10, hpBarY, max(0, currentHpWidth), barHeight); // Use max(0, ...) to prevent negative width

    // HP Text
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`HP: ${player.hp}/${player.maxHp}   Gold: ${player.gold}   Level: ${currentLevel}`, 15 + hpBarWidth, hpBarY + 2);

    // Message Log
    let msgY = uiY + barHeight + 10; // Start messages below HP bar
    textSize(12);
    textAlign(LEFT, TOP);
    for (let i = 0; i < messageLog.length; i++) {
        fill(200); // Dimmer text for log
        text(messageLog[i], 10, msgY + i * 15);
    }
}

function addMessage(msg) {
    console.log("Message:", msg); // Also log to console for debugging
    messageLog.unshift(msg); // Add to the beginning
    if (messageLog.length > maxMessages) {
        messageLog.pop(); // Remove the oldest message
    }
}


function drawEasterEggInput() {
    let boxWidth = 300;
    let boxHeight = 40;
    let boxX = width / 2 - boxWidth / 2;
    let boxY = height / 2 - boxHeight / 2; // Center vertically

    fill(50, 50, 150, 200); // Semi-transparent blue background
    stroke(255);
    rect(boxX, boxY, boxWidth, boxHeight);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(`> ${easterEggInput}_`, boxX + 10, boxY + boxHeight / 2);
}

function displayHelp() {
     // This could be an overlay, but for simplicity, just add messages
     addMessage("--- Help ---");
     addMessage("Arrows/hjkl: Move");
     addMessage("g: Get item");
     addMessage("q: Quaff potion");
     addMessage(">: Use stairs (when on them)");
     addMessage("^: Enter Easter Egg mode");
     addMessage("H: Show this help");
     addMessage("------------");
}

function displayGameOver() {
    fill(150, 0, 0, 200); // Dark Red overlay
    rect(0, 0, width, height);

    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 30);
    textSize(24);
    text(`You reached level ${currentLevel} with ${player.gold} gold.`, width / 2, height / 2 + 20);
    text("Press F5 or Refresh to play again!", width / 2, height / 2 + 60);
    noLoop(); // Stop the draw loop
}


// --- Game Logic ---

function updateVisibility() {
    // Reset visibility for all tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c].visible = false;
        }
    }

    // Use a simple circular radius check
    // More complex: Field of View algorithm (raycasting, etc.)
    let px = player.x;
    let py = player.y;
    for (let r = max(0, py - visibilityRadius); r <= min(rows - 1, py + visibilityRadius); r++) {
        for (let c = max(0, px - visibilityRadius); c <= min(cols - 1, px + visibilityRadius); c++) {
            let d = dist(px, py, c, r);
            if (d <= visibilityRadius) {
                 // Basic line-of-sight check (stops at first wall)
                 // This is a very basic version, true FOV is more complex
                 if (hasLineOfSight(px, py, c, r)) {
                     grid[r][c].visible = true;
                     grid[r][c].discovered = true;
                 }
            }
        }
    }
    // Player's own tile is always visible & discovered
     if (py >= 0 && py < rows && px >= 0 && px < cols) {
        grid[py][px].visible = true;
        grid[py][px].discovered = true;
     }
}

// Basic Bresenham Line algorithm to check LoS
function hasLineOfSight(x0, y0, x1, y1) {
    let dx = abs(x1 - x0);
    let dy = -abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        // Check if current cell blocks sight (before checking if it's the target)
         if (x0 >= 0 && x0 < cols && y0 >= 0 && y0 < rows) {
            if (grid[y0][x0].blockSight && !(x0 === x1 && y0 === y1)) { // If it blocks sight and isn't the target cell itself
                return false;
            }
         } else {
             return false; // Out of bounds blocks sight
         }


        if (x0 === x1 && y0 === y1) break; // Reached target

        let e2 = 2 * err;
        if (e2 >= dy) { // Step horizontally
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) { // Step vertically
            err += dx;
            y0 += sy;
        }
    }
    return true; // No obstruction found
}


function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    // Check boundaries
    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
        addMessage("Ouch! You bumped into the edge of the world.");
        return false;
    }

    // Check wall collision
    if (grid[newY][newX].blockMove) {
        addMessage("Bonk! You hit a wall. 🧱");
        return false;
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
        return true; // Attacking counts as successful move/action
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


    return true; // Successful move
}

function attackMonster(attacker, target) {
    // Simple combat: fixed damage for now
    let damage = 1; // Player deals 1 damage
    addMessage(`You attack the ${target.name} (${target.char})!`);
    target.hp -= damage;
    addMessage(`The ${target.name} takes ${damage} damage.`);

    if (target.hp <= 0) {
        addMessage(`You defeated the ${target.name}! 🎉`);
        // Remove monster from the list
        monsters = monsters.filter(m => m !== target);
        // Maybe drop loot? For now, just remove.
    }
}

function attackPlayer(attacker, target) {
     // Simple combat: fixed damage for now
    let damage = 1; // Monster deals 1 damage
    addMessage(`The ${attacker.name} (${attacker.char}) attacks you!`);
    target.hp -= damage;
    addMessage(`You take ${damage} damage.`);

    if (target.hp <= 0) {
        addMessage(`💀 You have been slain by the ${attacker.name}! 💀`);
        player.char = '☠️'; // Change player character on death
        gameOver = true;
    }
}

function handleMonsterTurns() {
    // console.log("Handling monster turns...");
    for (let i = monsters.length - 1; i >= 0; i--) { // Iterate backwards for safe removal
        let monster = monsters[i];
        if (!monster) continue; // Skip if monster was somehow removed during the loop

        // Simple AI: Move randomly or towards player if close
        let dx = 0;
        let dy = 0;
        let distanceToPlayer = dist(monster.x, monster.y, player.x, player.y);

        if (distanceToPlayer < 6 && hasLineOfSight(monster.x, monster.y, player.x, player.y)) { // If player is nearby and visible
            // Move towards player
            if (player.x > monster.x) dx = 1;
            else if (player.x < monster.x) dx = -1;
            if (player.y > monster.y) dy = 1;
            else if (player.y < monster.y) dy = -1;

            // Avoid diagonal moves if blocked, prioritize cardinal
            if (dx !== 0 && dy !== 0) {
                // Try moving horizontally first, then vertically if blocked
                 if (isBlocked(monster.x + dx, monster.y) && !isBlocked(monster.x, monster.y + dy)) {
                     dx = 0; // Can't move horizontal, try vertical
                 } else if (!isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)) {
                     dy = 0; // Can't move vertical, try horizontal
                 } else if (isBlocked(monster.x + dx, monster.y) && isBlocked(monster.x, monster.y + dy)){
                     // If both direct paths towards player are blocked, maybe pick one randomly?
                     // Or just stick with the diagonal attempt below (might fail)
                      // For now, let's try random if both prefered axis are blocked
                     if (random() < 0.5) dx = 0; else dy = 0;
                 }
                  // If still diagonal after checks, randomly pick one axis for simplicity
                  // if (dx !== 0 && dy !== 0 && random() < 0.5) {
                  //      dx = 0; // Try vertical only
                  // } else if (dx !== 0 && dy !== 0) {
                  //      dy = 0; // Try horizontal only
                  // }
            }

        } else {
            // Move randomly
            let r = floor(random(4));
            if (r === 0) dx = 1;
            else if (r === 1) dx = -1;
            else if (r === 2) dy = 1;
            else if (r === 3) dy = -1;
        }

        let newX = monster.x + dx;
        let newY = monster.y + dy;

        // Check for collision
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !isBlocked(newX, newY)) {
             if (newX === player.x && newY === player.y) {
                 // Attack player!
                 attackPlayer(monster, player);
             } else if (!isOccupiedByMonster(newX, newY)) { // Don't stack monsters
                monster.x = newX;
                monster.y = newY;
             }
        }
         // else: Monster stays put or bumps into something
    }
}

function isBlocked(x, y) {
     // Check grid bounds first
     if (x < 0 || x >= cols || y < 0 || y >= rows) {
         return true;
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

    } else {
        addMessage("There is nothing here to pick up.");
    }
}

function quaffPotion() {
    let potionToQuaff = null;
    let potionIndex = -1;

    // Find the first potion in inventory
    for (let i = 0; i < player.inventory.length; i++) {
        if (player.inventory[i].type === 'potion') {
            potionToQuaff = player.inventory[i];
            potionIndex = i;
            break;
        }
    }

    if (potionToQuaff) {
        addMessage(`You quaff the ${potionToQuaff.name} (${potionToQuaff.char})...`);
        // Apply effect
        if (potionToQuaff.effect === 'heal') {
            player.hp = min(player.maxHp, player.hp + potionToQuaff.power);
            addMessage(`You feel healthier! (+${potionToQuaff.power} HP)`);
        } else if (potionToQuaff.effect === 'teleport') {
             addMessage("Woah! Everything spins!"); // Implement teleport later
             // Find random empty floor tile and move player there
        } else {
            addMessage("...but nothing interesting happens.");
        }

        // Remove potion from inventory
        player.inventory.splice(potionIndex, 1);

    } else {
        addMessage("You have no potions to quaff!");
    }
}

function descendStairs() {
     addMessage("You descend deeper into the dungeon...");
     currentLevel++;
     // Keep player stats, inventory, gold
     generateLevel(); // Generate new layout, monsters, items
     addMessage(`Welcome to Level ${currentLevel}.`);
}


// --- Easter Egg Handling ---

function handleEasterEggInput(key, keyCode) {
    if (keyCode === ENTER) {
        processEasterEgg(easterEggInput);
        inputMode = 'game'; // Exit input mode
        easterEggInput = ''; // Clear input
    } else if (keyCode === BACKSPACE) {
        easterEggInput = easterEggInput.slice(0, -1); // Remove last character
    } else if (keyCode === ESCAPE) {
        inputMode = 'game'; // Cancel
        easterEggInput = '';
        addMessage("Easter egg input cancelled.");
    } else if (key.length === 1) { // Append printable characters
        easterEggInput += key;
    }
    // Ignore other keys like Shift, Ctrl, etc.
}

function processEasterEgg(command) {
    command = command.toLowerCase().trim();
    addMessage(`Easter Egg attempt: "${command}"`);
    if (command === "showoff") {
        showAll = !showAll; // Toggle visibility
        addMessage(showAll ? "Tada! The whole map is revealed!" : "Hiding the map again.");
    } else if (command === "kiellemall") {
        addMessage("Begone, foul beasts!");
        monsters = []; // Remove all monsters
    } else if (command === "healme") {
        player.hp = player.maxHp;
        addMessage("Feeling refreshed!");
    } else if (command === "goldpls") {
         player.gold += 1000;
         addMessage("💰💰💰 Bling! 💰💰💰");
    } else {
        addMessage("Nothing happens... Maybe you typed it wrong? 😉");
    }
}
