// sketch.js - Your Emoji Rogue-like Adventure! V7 (On-Screen Mobile Controls)

// --- Configurable Stuff & Constants ---
let visibilityRadius = 2;
const minRoomSize = 2;
const maxRoomSize = 7;
const numRoomsTry = 100;
const GOLD_TO_XP_RATIO = 0.5;
// --- NEW: UI Config ---
const UI_ROWS = 7; // Increased rows reserved for UI and virtual controls
const BUTTON_SIZE = 40; // Standard button size
const ARROW_BUTTON_SIZE = 55; // Larger size for arrow buttons

// ASCII Wall Characters (Unchanged)
const WALL_V = '║'; const WALL_H = '═'; const WALL_TL = '╔'; const WALL_TR = '╗'; const WALL_BL = '╚'; const WALL_BR = '╝'; const WALL_TJ = '╦'; const WALL_BJ = '╩'; const WALL_LJ = '╠'; const WALL_RJ = '╣'; const WALL_X = '╬';

// Monster Definition (Unchanged from V6)
const monsterTypes = [ /* V6 monsters */
    { name: 'Giant Rat',   char: '🐀', hp: 3,  xpValue: 5,  damage: 1, minLevel: 1 }, { name: 'Giant Bat',   char: '🦇', hp: 4,  xpValue: 7,  damage: 1, minLevel: 1 }, { name: 'Goblin',      char: '👺', hp: 6,  xpValue: 10, damage: 1, minLevel: 1 }, { name: 'Giant Spider',char: '🕷️', hp: 5,  xpValue: 12, damage: 2, minLevel: 2 }, { name: 'Skeleton',    char: '💀', hp: 10, xpValue: 30, damage: 2, minLevel: 3, isUndead: true }, { name: 'Wolf',        char: '🐺', hp: 8,  xpValue: 18, damage: 2, minLevel: 3 }, { name: 'Zombie',      char: '🧟', hp: 15, xpValue: 25, damage: 2, minLevel: 4, isUndead: true }, { name: 'Orc',         char: '👹', hp: 12, xpValue: 25, damage: 3, minLevel: 4 }, { name: 'Slime',       char: '🦠', hp: 15, xpValue: 20, damage: 1, minLevel: 5 }, { name: 'Ghost',       char: '👻', hp: 10, xpValue: 40, damage: 3, minLevel: 5, isUndead: true }, { name: 'Ogre',        char: '🦍', hp: 25, xpValue: 50, damage: 4, minLevel: 6 }, { name: 'Troll',       char: '🧌', hp: 35, xpValue: 70, damage: 5, minLevel: 7 }, { name: 'DRAGON',      char: '🐉', hp: 100, xpValue: 500, damage: 10, minLevel: 10 }
];

// Item Definitions (Unchanged from V6)
const treasureTypes = [ /* V6 treasures */ ]; const potionTypes = [ /* V6 potions */ ];

// --- Game State Variables ---
let grid = []; let cols, rows; let tileSize = 20;
let player; let monsters = []; let items = [];
let stairs = null; let rooms = []; let currentLevel = 1;
let messageLog = ["...", "..."]; let maxMessages = 3; // Fewer messages to save space
let showAll = false; let easterEggInput = '';
let gameState = 'playing'; // 'playing', 'help', 'gameOver', 'easterEggInput', 'error'
let errorMessage = "";
// --- NEW: Virtual Buttons ---
let virtualButtons = [];

// --- Player Definition & XP functions ---
// (Unchanged from V5)
function createPlayer(x, y) { /* ... V5 code ... */ }
function calculateXpForLevel(level) { /* ... V5 code ... */ }
function calculatePlayerDamage(playerLevel) { /* ... V5 code ... */ }

// --- p5.js Core Functions ---
function setup() {
    textFont('monospace');
    if (windowWidth < tileSize * 15 || windowHeight < tileSize * (15 + UI_ROWS)) { // Check height too
        errorMessage = "Window too small!"; gameState = 'error';
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
    else {
        updateVisibility(); drawMap(); drawItems(); drawMonsters(); drawPlayer(); drawUI();
        // Draw controls only when playing or in easter egg input (to allow cancelling)
        if (gameState === 'playing' || gameState === 'easterEggInput') {
             drawVirtualControls();
        }
        if (gameState === 'easterEggInput') { drawEasterEggInput(); }
    }
}

// --- Input Handling ---

// --- NEW: Central Action Execution & Monster Turn Trigger ---
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

// --- MODIFIED: keyPressed uses executePlayerAction ---
function keyPressed() {
    if (gameState === 'error' || gameState === 'gameOver') return;
    if (gameState === 'help') { if (key === 'h' || key === 'H' || keyCode === ESCAPE) { doToggleHelp(); } return; }
    if (gameState === 'easterEggInput') { handleEasterEggInput(key, keyCode); return; }

    // --- gameState must be 'playing' ---
    if (keyCode === UP_ARROW || key === 'k' || key === 'K') { executePlayerAction(() => doPlayerMove(0, -1)); }
    else if (keyCode === DOWN_ARROW || key === 'j' || key === 'J') { executePlayerAction(() => doPlayerMove(0, 1)); }
    else if (keyCode === LEFT_ARROW || (key === 'h' && key !== 'H')) { executePlayerAction(() => doPlayerMove(-1, 0)); }
    else if (keyCode === RIGHT_ARROW || key === 'l' || key === 'L') { executePlayerAction(() => doPlayerMove(1, 0)); }
    else if (key === 'q' || key === 'Q') { executePlayerAction(doQuaffPotion); } // Quaff always takes turn
    else if (key === 'g' || key === 'G') { executePlayerAction(doGetItem); } // GetItem returns true/false
    else if (key === '>' || key === '.') { executePlayerAction(doDescendStairs); } // Descend handles turn logic internally
    else if (key === 'H') { doToggleHelp(); } // Doesn't take a turn
    else if (key === '^') { doEnterEasterEggMode(); } // Doesn't take a turn
}

// --- NEW: mousePressed / touchStarted for Virtual Buttons ---
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
     // Ignore taps if not in a state where controls are shown/active
     if (gameState !== 'playing' && gameState !== 'easterEggInput') {
         // Allow tapping help screen to close it? Maybe not, use button/key.
         if (gameState === 'help') {
            // Could check if tap is outside a central help box to close?
            // Or just rely on H/ESC key/button.
         }
         return;
     }

     if (gameState === 'easterEggInput') {
         // If easter egg input is showing, maybe a tap cancels it?
         // Or maybe only the ESC key/button works. Let's require ESC/Enter for now.
         // Check if tap hits a specific "Cancel" button if we add one.
         // return; // Ignore game button taps while in easter egg input mode? Or allow cancel?
     }

    // Check virtual buttons
    let buttonPressed = false;
    for (let btn of virtualButtons) {
        if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
            console.log("Button pressed:", btn.label);
            // --- Special handling for ESC in easter egg mode ---
            if (gameState === 'easterEggInput' && btn.keyChar === 'ESC') {
                doCancelEasterEgg();
                buttonPressed = true;
                break;
            }
            // --- Execute action for playing state ---
            if (gameState === 'playing') {
                 executePlayerAction(btn.action); // Execute the button's assigned action
                 buttonPressed = true;
                 break; // Only handle one button press per tap
            }
        }
    }

    // Optional: If tap didn't hit a button, maybe do something else?
    // if (!buttonPressed) { ... }
}

// --- Game Initialization ---
function calculateGridSize() {
    // --- MODIFIED: Use UI_ROWS ---
    cols = floor(width / tileSize);
    rows = floor(height / tileSize) - UI_ROWS; // Reserve more space
    cols = max(0, cols);
    rows = max(0, rows);
}
// (startGame, generateLevel unchanged from V5 - they call helpers)
function startGame() { /* ... V5 code ... */ }
function generateLevel() { /* ... V5 code ... */ }

// --- Dungeon Generation Helpers ---
// (createRoom, rectOverlap, createCorridor, placeStairs, placeEntities, isOccupied unchanged from V6)
function createRoom(){ /* ... V5 code ... */ } function rectOverlap(r1,r2,p=0){ /* ... V5 code ... */ } function createCorridor(x1,y1,x2,y2){ /* ... V5 code ... */ } function placeStairs(room){ /* ... V5 code ... */ } function placeEntities(list,types,count,level,skipStart=false){ /* ... V6 code (with isUndead) ... */ } function isOccupied(x,y){ /* ... V5 code ... */ }

// --- Drawing Functions ---
// (isWallOrBoundary, drawMap, drawPlayer, drawMonsters, drawItems - unchanged from V5)
function isWallOrBoundary(c, r) { /* ... V5 code ... */ } function drawMap() { /* ... V5 code ... */ } function drawPlayer() { /* ... V5 code ... */ } function drawMonsters() { /* ... V5 code ... */ } function drawItems() { /* ... V5 code ... */ }

// --- MODIFIED drawUI to reserve space for buttons ---
function drawUI() {
    let uiY = rows * tileSize; // Top of the entire UI area
    let statsEndY = uiY + 35; // End of the HP/XP bar area
    let msgY = statsEndY + 5; // Start messages below stats
    let msgMaxHeight = UI_ROWS * tileSize - (statsEndY - uiY) - 5; // Max height for messages before buttons start

    // Clear UI area (needed if buttons overlap slightly)
    fill(0); // Black background for UI
    noStroke();
    rect(0, uiY, width, height - uiY); // Clear whole bottom area

    // Draw Stats Area Background (Optional)
    fill(20, 20, 20);
    rect(0, uiY, width, statsEndY - uiY);

    if (!player) return; // Don't draw stats if no player

    // Line 1: HP Bar and Stats
    let line1Y = uiY + 5;
    let hpBarWidth=150, barHeight=15;
    fill(100,0,0); rect(10,line1Y,hpBarWidth,barHeight); fill(0,200,0); let currentHpWidth=map(player.hp,0,player.maxHp,0,hpBarWidth); rect(10,line1Y,max(0,currentHpWidth),barHeight); fill(255); textSize(14); textAlign(LEFT,TOP); text(`HP: ${player.hp}/${player.maxHp} | Lvl: ${player.level} | D Lvl: ${currentLevel} | Gold: ${player.gold}`, 15+hpBarWidth, line1Y);

    // Line 2: XP Bar
    let line2Y = uiY + 23;
    let xpBarWidth=150;
    fill(50,50,100); rect(10,line2Y,xpBarWidth,barHeight); fill(100,100,255); let currentXpWidth=0; if(player.level<36 && player.xpToNextLevel > 0) { currentXpWidth=map(player.xp,0,player.xpToNextLevel,0,xpBarWidth); } else if (player.level>=36) { currentXpWidth=xpBarWidth; } rect(10,line2Y,max(0,currentXpWidth),barHeight); fill(255); textAlign(LEFT,TOP); let xpText=`XP: ${player.xp}/${player.xpToNextLevel}`; if(player.level>=36) xpText="XP: MAX LEVEL"; text(xpText, 15+xpBarWidth, line2Y);

    // Message Log (Draw only visible messages within allocated space)
    textSize(12); textAlign(LEFT, TOP);
    let linesDrawn = 0;
    for (let i = 0; i < messageLog.length; i++) {
        let currentMsgY = msgY + linesDrawn * 14; // Line height approx 14
        if (currentMsgY + 14 <= uiY + UI_ROWS * tileSize) { // Check if it fits before buttons
             fill(200); text(messageLog[i], 10, currentMsgY);
             linesDrawn++;
        } else {
            break; // Stop drawing messages if out of space
        }
    }
}

// (addMessage - reduced maxMessages)
function addMessage(msg) {
    console.log("Message:", msg); messageLog.unshift(msg);
    if (messageLog.length > maxMessages) { messageLog.pop(); }
}
// (drawEasterEggInput, drawHelpScreen, displayGameOver, drawErrorScreen - unchanged from V5)
function drawEasterEggInput() { /* ... V5 code ... */ } function drawHelpScreen() { /* ... V5 code ... */ } function displayGameOver() { /* ... V5 code ... */ } function drawErrorScreen() { /* ... V5 code ... */ }

// --- NEW: Virtual Controls Drawing ---
function drawVirtualControls() {
    // Draw all defined buttons
    for (let btn of virtualButtons) {
        // Basic button style
        stroke(200); // Light grey border
        fill(50, 50, 50, 200); // Dark grey, semi-transparent fill

        // TODO: Add highlighting if button is currently pressed? (More complex state needed)

        rect(btn.x, btn.y, btn.w, btn.h, 5); // Draw rounded rectangle

        // Draw label
        fill(220); // Light text
        noStroke();
        textSize(btn.h * 0.5); // Text size relative to button height
        textAlign(CENTER, CENTER);
        text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
}

// --- NEW: Define Button Layout ---
function defineVirtualButtons() {
    virtualButtons = []; // Clear existing buttons
    let btnY = height - BUTTON_SIZE * 2.2; // Y position for top row of action buttons
    let btnY2 = height - BUTTON_SIZE * 1.1; // Y position for bottom row of action buttons
    let arrowY = height - ARROW_BUTTON_SIZE * 1.7; // Y position for arrows cluster
    let margin = 10;

    // --- Action Buttons (Right Side) ---
    let startX = width - (BUTTON_SIZE + margin) * 3; // Position from right edge

    // Top Row Actions
    virtualButtons.push({ label: 'G', x: startX, y: btnY, w: BUTTON_SIZE, h: BUTTON_SIZE, action: doGetItem, keyChar: 'g' });
    virtualButtons.push({ label: 'Q', x: startX + (BUTTON_SIZE + margin), y: btnY, w: BUTTON_SIZE, h: BUTTON_SIZE, action: doQuaffPotion, keyChar: 'q' });
    virtualButtons.push({ label: '>', x: startX + (BUTTON_SIZE + margin) * 2, y: btnY, w: BUTTON_SIZE, h: BUTTON_SIZE, action: doDescendStairs, keyChar: '>' });

    // Bottom Row Actions / Meta
    virtualButtons.push({ label: '^', x: startX, y: btnY2, w: BUTTON_SIZE, h: BUTTON_SIZE, action: doEnterEasterEggMode, keyChar: '^' });
    virtualButtons.push({ label: 'H', x: startX + (BUTTON_SIZE + margin), y: btnY2, w: BUTTON_SIZE, h: BUTTON_SIZE, action: doToggleHelp, keyChar: 'H' });
    virtualButtons.push({ label: 'Esc', x: startX + (BUTTON_SIZE + margin) * 2, y: btnY2, w: BUTTON_SIZE, h: BUTTON_SIZE, action: ()=>{/* Handled in tap handler */}, keyChar: 'ESC' }); // For cancelling easter egg


    // --- Arrow Buttons (Left Side - Larger) ---
    let arrowCenterX = margin + ARROW_BUTTON_SIZE * 1.5 / 2; // Centered cluster
    let arrowPad = 2; // Small padding between arrows

    // Up Arrow
    virtualButtons.push({ label: '↑', x: arrowCenterX - ARROW_BUTTON_SIZE/2, y: arrowY, w: ARROW_BUTTON_SIZE, h: ARROW_BUTTON_SIZE, action: () => doPlayerMove(0, -1), keyChar: 'k' });
    // Down Arrow
    virtualButtons.push({ label: '↓', x: arrowCenterX - ARROW_BUTTON_SIZE/2, y: arrowY + ARROW_BUTTON_SIZE + arrowPad, w: ARROW_BUTTON_SIZE, h: ARROW_BUTTON_SIZE, action: () => doPlayerMove(0, 1), keyChar: 'j' });
    // Left Arrow
    virtualButtons.push({ label: '←', x: arrowCenterX - ARROW_BUTTON_SIZE/2 - ARROW_BUTTON_SIZE - arrowPad, y: arrowY + (ARROW_BUTTON_SIZE + arrowPad)/2, w: ARROW_BUTTON_SIZE, h: ARROW_BUTTON_SIZE, action: () => doPlayerMove(-1, 0), keyChar: 'h' });
    // Right Arrow
    virtualButtons.push({ label: '→', x: arrowCenterX + ARROW_BUTTON_SIZE/2 + arrowPad, y: arrowY + (ARROW_BUTTON_SIZE + arrowPad)/2, w: ARROW_BUTTON_SIZE, h: ARROW_BUTTON_SIZE, action: () => doPlayerMove(1, 0), keyChar: 'l' });

}


// --- Game Logic ---
// (updateVisibility, hasLineOfSight - unchanged from V5)
function updateVisibility() { /* ... V5 code ... */ }
function hasLineOfSight(x0, y0, x1, y1) { /* ... V5 code ... */ }

// --- REFACTORED Core Action Functions ---

function doPlayerMove(dx, dy) {
    // Logic moved from old movePlayer, returns true if turn taken
    if (!player || !grid) return false;
    let newX=player.x+dx, newY=player.y+dy;
    if (newX<0||newX>=cols||newY<0||newY>=rows) { addMessage("Ouch! Bumped edge."); return false; }
    if (!grid[newY]||!grid[newY][newX]) { addMessage("Error: Invalid move target."); return false; }
    if (grid[newY][newX].blockMove) { addMessage("Bonk! A wall."); return false; }
    let targetMonster=null; for (let m of monsters) { if (m.x===newX && m.y===newY) { targetMonster=m; break; } }
    if (targetMonster) { attackMonster(player, targetMonster); return true; } // Attack takes turn
    player.x=newX; player.y=newY; // Move takes turn
    if (stairs && newX===stairs.x && newY===stairs.y) { addMessage("Stairs down... ('>' to use)"); }
    let itemHere=null; for(let i of items) { if(i.x===newX && i.y===newY) { itemHere=i; break; } }
    if(itemHere) { addMessage(`See a ${itemHere.name} (${itemHere.char}). ('g' to get)`); }
    return true; // Successful move takes turn
}

function doQuaffPotion() {
    // Logic moved from old quaffPotion
    if (!player) return false; // No player, no action
    let potionToQuaff = null; let potionIndex = -1;
    for (let i=0; i<player.inventory.length; i++) { if (player.inventory[i] && player.inventory[i].type === 'potion') { potionToQuaff = player.inventory[i]; potionIndex = i; break; } }
    if (potionToQuaff) {
        addMessage(`You quaff the ${potionToQuaff.name} (${potionToQuaff.char})...`);
        if (potionToQuaff.effect === 'heal') { let healAmount=min(player.maxHp-player.hp, potionToQuaff.power); player.hp+=healAmount; addMessage(`+${healAmount} HP`); }
        else if (potionToQuaff.effect === 'purgeUndead') { let range=potionToQuaff.power; let purgedCount=0; addMessage("A holy light flashes!"); for(let i=monsters.length-1; i>=0; i--){ let m=monsters[i]; if(m.isUndead && dist(player.x,player.y,m.x,m.y)<=range){ addMessage(`The ${m.name} is destroyed!`); monsters.splice(i,1); purgedCount++; } } if(purgedCount===0) addMessage("No nearby undead affected."); else addMessage(`Purged ${purgedCount} undead.`); }
        else if (potionToQuaff.effect === 'teleport') { addMessage("Woah! Everything spins!"); /* TODO */ }
        else { addMessage("...but nothing interesting happens."); }
        player.inventory.splice(potionIndex, 1);
    } else { addMessage("You have no potions to quaff!"); }
    return true; // Attempting to quaff always takes a turn
}

function doGetItem() {
    // Logic moved from old pickUpItem, returns true if turn taken
    if (!player) return false;
    let itemIndex=-1; for (let i=0; i<items.length; i++) { if (items[i].x===player.x && items[i].y===player.y) { itemIndex = i; break; } }
    if (itemIndex !== -1) {
        let item=items[itemIndex]; addMessage(`Picked up ${item.name} (${item.char}).`);
        if(item.type==='treasure'){ player.gold+=item.value; let xpFromGold=floor(item.value*GOLD_TO_XP_RATIO); if(xpFromGold>0){ addMessage(`+${xpFromGold} XP from gold!`); addXP(xpFromGold); } }
        else if(item.type==='potion'){ player.inventory.push(item); }
        items.splice(itemIndex, 1); return true; // Success takes turn
    } else { addMessage("Nothing here to get."); return false; } // Failure takes no turn
}

function doDescendStairs() {
    // Logic moved from old descendStairs
    if (!player || !stairs) return false;
    if (player.x === stairs.x && player.y === stairs.y) {
        addMessage("You descend deeper..."); currentLevel++; generateLevel();
        if (gameState !== 'error') { addMessage(`Welcome to Dungeon Level ${currentLevel}.`); }
        return false; // Descending does NOT cost a turn on the *current* level
    } else {
        addMessage("Tried descending not on stairs?");
        return false; // Failed action
    }
}

function doToggleHelp() {
    if (gameState === 'help') { gameState = 'playing'; addMessage("Resuming game."); }
    else if (gameState === 'playing') { gameState = 'help'; addMessage("Showing help (H/ESC to close)."); }
    return false; // Toggling help never costs a turn
}

function doEnterEasterEggMode() {
    if (gameState === 'playing') {
        gameState = 'easterEggInput';
        easterEggInput = '';
        addMessage("Enter Easter Egg command:");
    }
    return false; // Entering mode doesn't cost a turn
}

function doCancelEasterEgg() {
    if (gameState === 'easterEggInput') {
        gameState = 'playing';
        easterEggInput = '';
        addMessage("Easter egg input cancelled.");
    }
     return false; // Cancelling doesn't cost a turn
}

// (attackMonster, attackPlayer, addXP, checkLevelUp, handleMonsterTurns, isBlocked, isOccupiedByMonster - unchanged from V5/V6)
function attackMonster(attacker, target) { /* ... V6 code ... */ }
function attackPlayer(attacker, target) { /* ... V5 code ... */ }
function addXP(amount) { /* ... V5 code ... */ }
function checkLevelUp() { /* ... V5 code ... */ }
function handleMonsterTurns() { /* ... V5 code ... */ }
function isBlocked(x, y) { /* ... V5 code ... */ }
function isOccupiedByMonster(x, y) { /* ... V5 code ... */ }


// --- Easter Egg Handling ---
// (handleEasterEggInput unchanged from V5)
function handleEasterEggInput(key, keyCode) { /* ... V5 code ... */ if(keyCode===ENTER){ processEasterEgg(easterEggInput); if (gameState === 'easterEggInput') gameState='playing'; easterEggInput=''; } else if(keyCode===BACKSPACE){ easterEggInput=easterEggInput.slice(0,-1); } else if(keyCode===ESCAPE){ doCancelEasterEgg(); } else if(key.length===1 && easterEggInput.length<30){ easterEggInput+=key; } }

// --- MODIFIED processEasterEgg for typo ---
function processEasterEgg(command) {
    // ... (Safety check for player) ...
    if (!player && ['healme', 'goldpls', 'levelup', 'godmode', 'die'].includes(command)) { addMessage("Player cheat needs player!"); return; }

    command = command.toLowerCase().trim();
    addMessage(`Easter Egg: "${command}"`);
    if (command === "showoff") { showAll = !showAll; addMessage(showAll?"Revealed!":"Hiding map."); }
    else if (command === "killemall") { addMessage("Begone!"); monsters = []; } // Fixed typo
    else if (command === "healme") { player.hp = player.maxHp; addMessage("Refreshed!"); }
    else if (command === "goldpls") { player.gold += 1000; addMessage("💰💰💰 Bling! 💰💰💰"); }
    else if (command === "levelup") { if (player.level < 36) { if (player.xpToNextLevel > 0) { addXP(player.xpToNextLevel - player.xp); addMessage("Level up!"); } else { addMessage("Cannot level up?"); } } else { addMessage("Max level!"); } }
    else if (command === "godmode") { player.hp = 9999; player.maxHp = 9999; player.baseDamage = 100; addMessage("DEUS VULT!"); }
    else if (command === "die") { player.hp = 0; addMessage("You feel unwell..."); }
    else { addMessage("Nothing happens..."); }
}
