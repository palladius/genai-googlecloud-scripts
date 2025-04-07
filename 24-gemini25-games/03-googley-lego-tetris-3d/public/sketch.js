// ==========================================
// == Google Blox 3D (HTML Overlay Update) ==
// ==      Uses HTML/CSS for UI          ==
// ==          April 5, 2025             ==
// ==========================================

// --- Config ---
const boardWidth = 10;
const boardDepth = 10;
const boardHeight = 20;
const unitSize = 30;
let cam; // EasyCam Camera object - always used

// --- DOM Elements (for UI) ---
let scoreDisplay;
let gameOverMessage;
let btnLeft, btnRight, btnFwd, btnBack, btnRotate, btnDrop;
let controlPanel; // Reference to the panel div

// --- Title (set in HTML now) ---
// const title = 'Googley Blox 3D';

// --- Game State ---
let board = [];
let currentPiece;
let ghostY;
let score = 0;
let isGameOver = false;
let fallInterval = 1000;
let lastFallTime = 0;

// --- Colors (still needed for blocks) ---
let googleColors;
const GOOGLE_RED = '#DB4437';
const GOOGLE_BLUE = '#4285F4';
const GOOGLE_GREEN = '#0F9D58';
const GOOGLE_YELLOW = '#F4B400';

// --- Piece Definitions ---
const pieceDefs = {
   // '1x1': { color: GOOGLE_RED, blocks: [{ x: 0, y: 0, z: 0 }] },
    '1x2': { color: GOOGLE_BLUE, blocks: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }] },
    //'2x1': { color: GOOGLE_GREEN, blocks: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }] },
    '2x2': { color: GOOGLE_YELLOW, blocks: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }] },
    '4x2': {
        color: GOOGLE_RED, blocks: [ { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 } ]
    },
    '3x2': { color: GOOGLE_GREEN,
      blocks: [
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, // Row 1 (z=0)
        { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 },  // Row 2 (z=1)
      ]
      },

};
const pieceTypes = Object.keys(pieceDefs);

// ==================================
//        SETUP FUNCTION
// ==================================
function setup() {
    // Create canvas and parent it to the #canvas-holder div
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-holder'); // Attach canvas to specific div

    // --- Always use EasyCam ---
    cam = createEasyCam();
    cam.setDistanceMin(100);
    cam.setDistanceMax(unitSize * boardHeight * 2.5);
    cam.setDistance(unitSize * boardHeight * 1.5);
    // Important: Prevent EasyCam from responding to events on the control panel
    cam.setAutoUpdate(true); // Keep auto update
    // We rely on the HTML element capturing events first

    document.oncontextmenu = function () { return false; } // Disable right-click

    // Initialize p5.Color objects
    googleColors = {
        red: color(GOOGLE_RED), blue: color(GOOGLE_BLUE),
        green: color(GOOGLE_GREEN), yellow: color(GOOGLE_YELLOW)
    };

    // Initialize board
    for (let x = 0; x < boardWidth; x++) { board[x] = []; for (let z = 0; z < boardDepth; z++) { board[x][z] = []; for (let y = 0; y < boardHeight; y++) { board[x][z][y] = null; } } }

    // --- Get References to HTML UI Elements ---
    scoreDisplay = select('#score-display');
    gameOverMessage = select('#game-over-message');
    controlPanel = select('#control-panel'); // Get panel itself

    // Get buttons and attach listeners
    btnLeft = select('#btn-left');
    btnLeft.mousePressed(() => { if (currentPiece) currentPiece.moveLateral(-1, 0); });

    btnRight = select('#btn-right');
    btnRight.mousePressed(() => { if (currentPiece) currentPiece.moveLateral(1, 0); });

    btnFwd = select('#btn-fwd');
    btnFwd.mousePressed(() => { if (currentPiece) currentPiece.moveLateral(0, 1); }); // Forward Z+

    btnBack = select('#btn-back');
    btnBack.mousePressed(() => { if (currentPiece) currentPiece.moveLateral(0, -1); }); // Backward Z-

    btnRotate = select('#btn-rotate');
    btnRotate.mousePressed(() => { if (currentPiece) currentPiece.rotate(); });

    btnDrop = select('#btn-drop');
    btnDrop.mousePressed(() => { if (currentPiece) currentPiece.hardDrop(); });

    // --- Prevent Touch Events on Control Panel from reaching EasyCam ---
    // (Alternative method: Stop propagation directly on the panel)
    let panelElement = controlPanel.elt; // Get the raw HTML element
    panelElement.addEventListener('touchstart', (event) => { event.stopPropagation(); }, { passive: false });
    panelElement.addEventListener('touchmove', (event) => { event.stopPropagation(); event.preventDefault(); }, { passive: false });
    panelElement.addEventListener('touchend', (event) => { event.stopPropagation(); }, { passive: false });
    panelElement.addEventListener('mousedown', (event) => { event.stopPropagation(); }, { passive: false }); // Also for mouse


    // Initial score display update
    updateScoreDisplay();

    spawnNewPiece();
}


// ==================================
//         DRAW FUNCTION
// ==================================
function draw() {
    background(50, 50, 70);

    // --- 3D Scene ---
    ambientLight(100);
    pointLight(255, 255, 255, -width, -height, unitSize * boardHeight * 1.5);
    directionalLight(150, 150, 150, 0.5, 0.8, -0.5);

    push(); // Isolate 3D world transformations
    translate(-boardWidth * unitSize / 2, -boardHeight * unitSize / 2, -boardDepth * unitSize / 2);

    if (!isGameOver) { // Only run game logic if not game over
        handleTiming();
    }
    // Always draw the board state
    drawBoardContainer();
    drawLandedBlocks();
    if (currentPiece) {
        calculateGhostPosition();
        drawGhostPiece();
        currentPiece.draw();
    }

    pop(); // Restore from 3D world transformations

    // --- NO 2D Drawing Here Anymore ---
    // HTML/CSS handles the overlay visuals

} // End draw()

// ==================================
//      GAME LOGIC HELPERS
// ==================================
function handleTiming() { if (millis() - lastFallTime > fallInterval) { if (currentPiece) { currentPiece.moveDown(); } lastFallTime = millis(); } }
function spawnNewPiece() { let randomType = random(pieceTypes); currentPiece = new Piece(randomType); currentPiece.x = floor(boardWidth / 2) - 1; currentPiece.z = floor(boardDepth / 2) - 1; currentPiece.y = boardHeight - 1; if (!currentPiece.isValidPosition(currentPiece.x, currentPiece.y, currentPiece.z, currentPiece.blocks)) { handleGameOver(); } } // Call GameOver handler
function lockPiece() { if (!currentPiece) return; let blocksToLock = currentPiece.getGlobalBlocks(); let highestY = 0; for (let block of blocksToLock) { if (block.y >= boardHeight) { handleGameOver(); return; } if (block.x >= 0 && block.x < boardWidth && block.z >= 0 && block.z < boardDepth && block.y >= 0) { board[block.x][block.z][block.y] = currentPiece.color; if (block.y > highestY) highestY = block.y; } else { console.error("Attempted to lock block out of bounds:", block); } } currentPiece = null; checkAndClearLayers(); if (!isGameOver) { spawnNewPiece(); } }
function checkAndClearLayers() { let layersCleared = 0; for (let y = 0; y < boardHeight; y++) { let layerFull = true; for (let x = 0; x < boardWidth; x++) { for (let z = 0; z < boardDepth; z++) { if (board[x][z][y] === null) { layerFull = false; break; } } if (!layerFull) break; } if (layerFull) { layersCleared++; for (let yShift = y; yShift < boardHeight - 1; yShift++) { for (let x = 0; x < boardWidth; x++) { for (let z = 0; z < boardDepth; z++) { board[x][z][yShift] = board[x][z][yShift + 1]; } } } for (let x = 0; x < boardWidth; x++) { for (let z = 0; z < boardDepth; z++) { board[x][z][boardHeight - 1] = null; } } y--; } } if (layersCleared > 0) { score += layersCleared * boardWidth * boardDepth; score += layersCleared * layersCleared * 100; updateScoreDisplay(); } } // Update score display
function calculateGhostPosition() { if (!currentPiece) return; ghostY = currentPiece.y; while (currentPiece.isValidPosition(currentPiece.x, ghostY - 1, currentPiece.z, currentPiece.blocks)) { ghostY--; } }

// --- UI Update Functions ---
function updateScoreDisplay() {
    scoreDisplay.html(`Score: ${score}`);
}

function handleGameOver() {
    if (isGameOver) return; // Prevent running multiple times
    console.log("GAME OVER!");
    isGameOver = true;
    currentPiece = null; // Stop current piece logic
    gameOverMessage.style('display', 'block'); // Show game over message
    // Disable buttons
    select('#control-panel').addClass('disabled'); // Add a class to grey out/disable pointer events via CSS potentially
    btnLeft.attribute('disabled', '');
    btnRight.attribute('disabled', '');
    btnFwd.attribute('disabled', '');
    btnBack.attribute('disabled', '');
    btnRotate.attribute('disabled', '');
    btnDrop.attribute('disabled', '');

    // Optional: Add the fun rotation animation here if desired
    // cam.beginState(EasyCam.State.ORBIT); // Or similar if you want animation
}


// ==================================
//        DRAWING HELPERS (3D Only)
// ==================================
// (drawBlock, drawGhostBlock, drawLandedBlocks, drawGhostPiece, drawBoardContainer) - Unchanged
function drawBlock(x, y, z, blockColor) { push(); let drawX = x * unitSize + unitSize / 2; let drawY = y * unitSize + unitSize / 2; let drawZ = z * unitSize + unitSize / 2; translate(drawX, drawY, drawZ); fill(blockColor); stroke(0, 150); strokeWeight(1); box(unitSize); pop(); }
function drawGhostBlock(x, y, z, blockColor) { push(); let drawX = x * unitSize + unitSize / 2; let drawY = y * unitSize + unitSize / 2; let drawZ = z * unitSize + unitSize / 2; translate(drawX, drawY, drawZ); noFill(); stroke(red(blockColor), green(blockColor), blue(blockColor), 180); strokeWeight(2); box(unitSize * 0.95); pop(); }
function drawLandedBlocks() { for (let x = 0; x < boardWidth; x++) { for (let z = 0; z < boardDepth; z++) { for (let y = 0; y < boardHeight; y++) { if (board[x][z][y] !== null) { drawBlock(x, y, z, board[x][z][y]); } } } } }
function drawGhostPiece() { if (!currentPiece || isGameOver) return; let ghostBlocks = currentPiece.getGlobalBlocks(currentPiece.x, ghostY, currentPiece.z); for (let block of ghostBlocks) { if (block.y < boardHeight) { drawGhostBlock(block.x, block.y, block.z, currentPiece.color); } } }
function drawBoardContainer() { push(); stroke(150, 150, 150, 100); strokeWeight(1); let basePlaneY = 0; for (let x = 0; x <= boardWidth; x++) { line(x * unitSize, basePlaneY, 0, x * unitSize, basePlaneY, boardDepth * unitSize); } for (let z = 0; z <= boardDepth; z++) { line(0, basePlaneY, z * unitSize, boardWidth * unitSize, basePlaneY, z * unitSize); } pop(); }


// ==================================
//        PIECE CLASS
// ==================================
// -- Unchanged --
class Piece { constructor(type) { this.type = type; this.definition = pieceDefs[type]; this.color = googleColors[this.definition.color.toString('#rrggbb')] || color(this.definition.color); this.blocks = this.definition.blocks.map(b => ({ ...b })); this.x = 0; this.y = 0; this.z = 0; this.rotation = 0; } getGlobalBlocks(baseX = this.x, baseY = this.y, baseZ = this.z) { return this.blocks.map(block => ({ x: baseX + block.x, y: baseY + block.y, z: baseZ + block.z })); } isValidPosition(targetX, targetY, targetZ, blocksToCheck) { for (let block of blocksToCheck) { let worldX = targetX + block.x; let worldY = targetY + block.y; let worldZ = targetZ + block.z; if (worldX < 0 || worldX >= boardWidth || worldZ < 0 || worldZ >= boardDepth || worldY < 0) return false; if (worldY < boardHeight) { if (board[worldX] && board[worldX][worldZ] && board[worldX][worldZ][worldY] !== null) return false; } } return true; } moveDown() { if (this.isValidPosition(this.x, this.y - 1, this.z, this.blocks)) { this.y--; lastFallTime = millis(); } else { lockPiece(); } } moveLateral(dx, dz) { if (this.isValidPosition(this.x + dx, this.y, this.z + dz, this.blocks)) { this.x += dx; this.z += dz; calculateGhostPosition(); } } rotate() { let rotatedBlocks = this.blocks.map(b => ({ x: -b.z, y: b.y, z: b.x })); let minX = Infinity; let minZ = Infinity; for (let b of rotatedBlocks) { if (b.x < minX) minX = b.x; if (b.z < minZ) minZ = b.z; } let normalizedRotatedBlocks = rotatedBlocks.map(b => ({ x: b.x - minX, y: b.y, z: b.z - minZ })); if (this.isValidPosition(this.x, this.y, this.z, normalizedRotatedBlocks)) { this.blocks = normalizedRotatedBlocks; this.rotation = (this.rotation + 1) % 4; calculateGhostPosition(); } else { console.log("Rotation blocked"); } } hardDrop() { let testY = this.y; while (this.isValidPosition(this.x, testY - 1, this.z, this.blocks)) { testY--; } this.y = testY; lockPiece(); } draw() { let globalBlocks = this.getGlobalBlocks(); for (let block of globalBlocks) { if (block.y < boardHeight + 2) { drawBlock(block.x, block.y, block.z, this.color); } } } }


// ==================================
//        USER INPUT (Keyboard only)
// ==================================
function keyPressed() {
    if (isGameOver || !currentPiece) return;
    // Allow keyboard even if touch device, for testing/hybrid use
    switch (keyCode) {
        case LEFT_ARROW: currentPiece.moveLateral(-1, 0); break;
        case RIGHT_ARROW: currentPiece.moveLateral(1, 0); break;
        case UP_ARROW: currentPiece.moveLateral(0, 1); break; // Forward Z+
        case DOWN_ARROW: currentPiece.moveLateral(0, -1); break; // Backward Z-
        case ENTER: case RETURN: currentPiece.rotate(); break;
        case 32: currentPiece.hardDrop(); break; // Space bar
    }
    if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, 32, ENTER, RETURN].includes(keyCode)) {
        return false; // Prevent default browser actions
    }
}

// --- NO mousePressed / touchStarted / touchMoved needed here anymore ---
// --- HTML button listeners handle clicks/taps                 ---
// --- EasyCam handles canvas mouse/touch                       ---
// --- Event listeners on #control-panel stop propagation       ---


// ==================================
//        WINDOW RESIZE
// ==================================
function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
   // Always update EasyCam aspect ratio
   if (cam) { cam.setAspect(width / height); }
   // NO need to recalculate button layout - CSS handles it
}
