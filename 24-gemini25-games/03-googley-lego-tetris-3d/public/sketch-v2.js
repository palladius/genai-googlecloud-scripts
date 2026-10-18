// --- Google Blox 3D (Simplified) ---
// --- By Gemini (with your awesome idea!) ---

// --- Config ---
const boardWidth = 10; // Smaller board for easier testing
const boardDepth = 10;
const boardHeight = 20; // Standard Tetris height-ish
const unitSize = 30; // Size of one block in pixels
let cam; // Camera object

// --- Game State ---
let board = []; // 3D array: board[x][z][y] = color or null
let currentPiece;
let ghostY; // Y position where the ghost piece should render
let score = 0;
let isGameOver = false;
let fallInterval = 1000; // Milliseconds per downward step
let lastFallTime = 0;

// Google Colors (use p5 Color objects)
let googleColors;
const GOOGLE_RED = '#DB4437';
const GOOGLE_BLUE = '#4285F4';
const GOOGLE_GREEN = '#0F9D58';
const GOOGLE_YELLOW = '#F4B400';

// --- Piece Definitions ---
// Simplified: Stores relative block coords for base rotation
  //'1x1': { color: GOOGLE_RED, blocks: [{ x: 0, y: 0, z: 0 }] },
  //'2x1': { color: GOOGLE_GREEN, blocks: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }] },
const pieceDefs = {
  '1x2': { color: GOOGLE_BLUE, blocks: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }] },
  '2x2': { color: GOOGLE_YELLOW, blocks: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }] },
  '3x2': { color: GOOGLE_GREEN,
    blocks: [
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, // Row 1 (z=0)
      { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 },  // Row 2 (z=1)
    ]
    },
  '4x2': {
    color: GOOGLE_RED,
    blocks: [
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, // Row 1 (z=0)
        { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }  // Row 2 (z=1)
    ]
  },

};
const pieceTypes = Object.keys(pieceDefs);

// ==================================
//        SETUP FUNCTION
// ==================================
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  cam = createEasyCam(); // Use p5.easycam for simple orbit controls initially
  cam.setDistanceMin(100);
  cam.setDistanceMax(unitSize * boardHeight * 2);
  cam.setDistance(unitSize * boardHeight * 1.2); // Start zoomed out a bit

  // Suppress EasyCam's right-click context menu
	document.oncontextmenu = function() { return false; }

  // Initialize Google Colors as p5.Color objects
  googleColors = {
    red: color(GOOGLE_RED),
    blue: color(GOOGLE_BLUE),
    green: color(GOOGLE_GREEN),
    yellow: color(GOOGLE_YELLOW)
  };

  // Initialize board with nulls
  for (let x = 0; x < boardWidth; x++) {
    board[x] = [];
    for (let z = 0; z < boardDepth; z++) {
      board[x][z] = [];
      for (let y = 0; y < boardHeight; y++) {
        board[x][z][y] = null;
      }
    }
  }

  spawnNewPiece();
}

// ==================================
//         DRAW FUNCTION
// ==================================
function draw() {
  background(50, 50, 70); // Dark bluish background
  // Set perspective explicitly if not using easycam default
  // perspective(PI / 3.0, width / height, 0.1, unitSize * boardHeight * 4);

  // Lighting
  ambientLight(100);
  pointLight(255, 255, 255, -width/2, -height/2, unitSize * boardHeight); // Light from top-left-ish
  directionalLight(150, 150, 150, 0.5, 1, -0.5); // Angled light

  // Center the coordinate system on the board's base
  translate(-boardWidth * unitSize / 2, -boardHeight * unitSize / 2, -boardDepth * unitSize / 2);

  if (isGameOver) {
    // Basic Game Over display (in 3D space, could be improved with 2D overlay)
    push();
    fill(255, 0, 0);
    textSize(unitSize * 2);
    textAlign(CENTER, CENTER);
    // Need to position text carefully in 3D or use createGraphics for 2D overlay
    // text("GAME OVER", boardWidth * unitSize / 2, boardHeight * unitSize / 2); // Approximate center
    pop();
    // You could add the final structure rotation here later
    drawLandedBlocks(); // Show final state
  } else {
    // --- Game Logic ---
    handleTiming(); // Move piece down based on timer

    // --- Rendering ---
    drawBoardContainer();
    drawLandedBlocks();
    if (currentPiece) {
      calculateGhostPosition();
      drawGhostPiece();
      currentPiece.draw();
    }
  }

  // Draw Score (using easycam's HUD feature for simplicity)
  // This requires p5.easycam library!
  cam.beginHUD();
  fill(255);
  textSize(24);
  text(`Score: ${score}`, 20, 40);
  if (isGameOver) {
       fill(255,0,0);
       textSize(40);
       textAlign(CENTER, CENTER);
       text("GAME OVER!", width / 2, height / 2);
  }
  cam.endHUD();

}

// ==================================
//      GAME LOGIC HELPERS
// ==================================

function handleTiming() {
  if (millis() - lastFallTime > fallInterval) {
    if (currentPiece) {
      currentPiece.moveDown();
    }
    lastFallTime = millis();
  }
}

function spawnNewPiece() {
  let randomType = random(pieceTypes);
  currentPiece = new Piece(randomType);

  // Initial position roughly centered at the top
  currentPiece.x = floor(boardWidth / 2) - 1;
  currentPiece.z = floor(boardDepth / 2) - 1;
  currentPiece.y = boardHeight - 1; // Start just above the visible board

  // Check for immediate collision (game over condition on spawn)
  if (!currentPiece.isValidPosition(currentPiece.x, currentPiece.y, currentPiece.z, currentPiece.blocks)) {
     isGameOver = true;
     console.log("GAME OVER - Cannot spawn piece!");
     currentPiece = null; // Stop drawing/moving it
  } else {
     // Ensure the piece spawns fully above the board initially if needed
     // (adjusting based on piece height - simplified here as all height 1)
     currentPiece.y = boardHeight - 1;
     if (!currentPiece.isValidPosition(currentPiece.x, currentPiece.y, currentPiece.z, currentPiece.blocks)) {
        // If even starting at the very top row collides, game over
        isGameOver = true;
        console.log("GAME OVER - Board full at spawn!");
        currentPiece = null;
     }
  }
}


function lockPiece() {
    if (!currentPiece) return;

    let blocksToLock = currentPiece.getGlobalBlocks();
    let highestY = 0; // Track highest point of locked piece

    for (let block of blocksToLock) {
        if (block.y >= boardHeight) { // Piece landed above the limit
            isGameOver = true;
            console.log("GAME OVER - Piece locked too high!");
            currentPiece = null;
            return; // Exit immediately
        }
        // Check bounds just in case, although isValidPosition should prevent this
        if (block.x >= 0 && block.x < boardWidth &&
            block.z >= 0 && block.z < boardDepth &&
            block.y >= 0) {
              board[block.x][block.z][block.y] = currentPiece.color;
              if(block.y > highestY) highestY = block.y;
        } else {
            console.error("Attempted to lock block out of bounds:", block);
        }
    }

    // Check for game over again after locking (redundant with above check but safe)
    if (highestY >= boardHeight -1) { // If any part reached the top row
         // isGameOver = true; // Already handled above
         // console.log("GAME OVER - Locked piece reached top!");
    }

    currentPiece = null; // Piece is locked, no longer falling
    checkAndClearLayers(); // Check for completed lines AFTER locking

    if (!isGameOver) {
       spawnNewPiece(); // Spawn next piece if game isn't over
    }
}


function checkAndClearLayers() {
  let layersCleared = 0;
  for (let y = 0; y < boardHeight; y++) {
    let layerFull = true;
    for (let x = 0; x < boardWidth; x++) {
      for (let z = 0; z < boardDepth; z++) {
        if (board[x][z][y] === null) {
          layerFull = false;
          break;
        }
      }
      if (!layerFull) break;
    }

    if (layerFull) {
      layersCleared++;
      // Remove the layer: Shift everything above it down
      for (let yShift = y; yShift < boardHeight - 1; yShift++) {
        for (let x = 0; x < boardWidth; x++) {
          for (let z = 0; z < boardDepth; z++) {
            board[x][z][yShift] = board[x][z][yShift + 1];
          }
        }
      }
      // Clear the top layer
      for (let x = 0; x < boardWidth; x++) {
        for (let z = 0; z < boardDepth; z++) {
          board[x][z][boardHeight - 1] = null;
        }
      }
      y--; // Re-check the current layer index as it now contains the layer from above
      console.log("Layer Cleared at Y=", y+1);
    }
  }
    // Update score (simple scoring)
    if (layersCleared > 0) {
        score += layersCleared * boardWidth * boardDepth; // Points per block cleared
        score += layersCleared * layersCleared * 100; // Bonus for multi-clears
        console.log("Score:", score);
        // Maybe increase speed?
        // fallInterval = max(200, fallInterval * 0.95);
    }
}

function calculateGhostPosition() {
    if (!currentPiece) return;
    ghostY = currentPiece.y;
    while (currentPiece.isValidPosition(currentPiece.x, ghostY - 1, currentPiece.z, currentPiece.blocks)) {
        ghostY--;
    }
}

// ==================================
//        DRAWING HELPERS
// ==================================

// Draws ONE block (simplified box)
function drawBlock(x, y, z, blockColor) {
  push(); // Isolate transformations and style

  // Calculate center position for the box
  let drawX = x * unitSize + unitSize / 2;
  let drawY = y * unitSize + unitSize / 2;
  let drawZ = z * unitSize + unitSize / 2;

  translate(drawX, drawY, drawZ);

  fill(blockColor);
  stroke(0, 150); // Outline
  strokeWeight(1);
  box(unitSize); // Draw the cube

  pop(); // Restore transformations and style
}

// Draws ONE ghost block (transparent box)
function drawGhostBlock(x, y, z, blockColor) {
    push(); // Isolate transformations and style

    // Calculate center position for the box
    let drawX = x * unitSize + unitSize / 2;
    let drawY = y * unitSize + unitSize / 2;
    let drawZ = z * unitSize + unitSize / 2;

    translate(drawX, drawY, drawZ);

    // Make it transparent / wireframe
    noFill();
    // fill(red(blockColor), green(blockColor), blue(blockColor), 50); // Transparent fill
    stroke(red(blockColor), green(blockColor), blue(blockColor), 150); // Brighter stroke
    strokeWeight(2);
    box(unitSize * 0.95); // Slightly smaller to avoid z-fighting

    pop(); // Restore transformations and style
}


// Draw the landed blocks on the board
function drawLandedBlocks() {
  for (let x = 0; x < boardWidth; x++) {
    for (let z = 0; z < boardDepth; z++) {
      for (let y = 0; y < boardHeight; y++) {
        if (board[x][z][y] !== null) {
          drawBlock(x, y, z, board[x][z][y]); // Use the stored color
        }
      }
    }
  }
}

function drawGhostPiece() {
    if (!currentPiece || isGameOver) return;
    let ghostBlocks = currentPiece.getGlobalBlocks(currentPiece.x, ghostY, currentPiece.z); // Get blocks at ghost position
    for (let block of ghostBlocks) {
       drawGhostBlock(block.x, block.y, block.z, currentPiece.color);
    }
}

// Draw the semi-transparent container and grid lines
function drawBoardContainer() {
  push();
  // Base grid lines
  stroke(150, 150, 150, 100); // Light grey, semi-transparent
  strokeWeight(1);
  let basePlaneY = 0; // Draw grid at Y=0
  for (let x = 0; x <= boardWidth; x++) {
    line(x * unitSize, basePlaneY, 0, x * unitSize, basePlaneY, boardDepth * unitSize);
  }
  for (let z = 0; z <= boardDepth; z++) {
    line(0, basePlaneY, z * unitSize, boardWidth * unitSize, basePlaneY, z * unitSize);
  }

  // Optional: Draw transparent walls (can obscure view, use carefully)
  /*
  noFill();
  stroke(200, 200, 200, 50); // Very faint white lines for edges
  strokeWeight(2);
  translate(boardWidth * unitSize / 2, boardHeight * unitSize / 2, boardDepth * unitSize / 2); // Center the box
  box(boardWidth * unitSize, boardHeight * unitSize, boardDepth * unitSize);
  */
  pop();
}

// ==================================
//        PIECE CLASS
// ==================================
class Piece {
  constructor(type) {
    this.type = type;
    this.definition = pieceDefs[type];
    this.color = googleColors[this.definition.color.toString('#rrggbb')] || color(this.definition.color); // Get p5 color
    this.blocks = this.definition.blocks.map(b => ({ ...b })); // Copy of blocks for rotation
    this.x = 0; // Board grid coords (set on spawn)
    this.y = 0;
    this.z = 0;
    this.rotation = 0; // 0: 0deg, 1: 90deg, 2: 180deg, 3: 270deg around Y
  }

  // Returns array of block coordinates in WORLD space [{x, y, z}, ...]
  getGlobalBlocks(baseX = this.x, baseY = this.y, baseZ = this.z) {
    return this.blocks.map(block => ({
      x: baseX + block.x,
      y: baseY + block.y, // Assuming block y is always 0 for simple pieces
      z: baseZ + block.z
    }));
  }

  // Check if a given position and block configuration is valid
  isValidPosition(targetX, targetY, targetZ, blocksToCheck) {
    for (let block of blocksToCheck) {
      let worldX = targetX + block.x;
      let worldY = targetY + block.y;
      let worldZ = targetZ + block.z;

      // Check boundaries
      if (worldX < 0 || worldX >= boardWidth ||
          worldZ < 0 || worldZ >= boardDepth ||
          worldY < 0) { // Allow blocks to be above boardHeight initially
           // worldY >= boardHeight) { // Check only lower bound initially
        // console.log("Collision: Bounds", worldX, worldY, worldZ);
        return false;
      }

      // Check collision with landed blocks (only if within board height)
       if (worldY < boardHeight && board[worldX] && board[worldX][worldZ] && board[worldX][worldZ][worldY] !== null) {
          // console.log("Collision: Board block at", worldX, worldY, worldZ);
          return false;
       }

    }
    return true; // No collisions found
  }


  moveDown() {
    if (this.isValidPosition(this.x, this.y - 1, this.z, this.blocks)) {
      this.y--;
      lastFallTime = millis(); // Reset timer on successful move
    } else {
      // Cannot move down, lock the piece
      lockPiece();
    }
  }

  moveLateral(dx, dz) {
    if (this.isValidPosition(this.x + dx, this.y, this.z + dz, this.blocks)) {
      this.x += dx;
      this.z += dz;
      calculateGhostPosition(); // Update ghost on lateral move
    } else {
        // Optional: Add a little 'bump' sound/visual feedback
    }
  }

  rotate() {
     // Simple Y-axis rotation: (x, z) -> (-z, x)
     let rotatedBlocks = this.blocks.map(b => ({
         x: -b.z, // New x is old -z
         y: b.y,  // Y stays the same for Y-axis rotation
         z: b.x   // New z is old x
     }));

     // Find the minX and minZ of the rotated shape to keep it pinned near origin
     let minX = Infinity;
     let minZ = Infinity;
     for(let b of rotatedBlocks) {
        if (b.x < minX) minX = b.x;
        if (b.z < minZ) minZ = b.z;
     }
     // Normalize rotated blocks so the top-left-most block is at (0,0) relative
     let normalizedRotatedBlocks = rotatedBlocks.map(b => ({
         x: b.x - minX,
         y: b.y,
         z: b.z - minZ
     }));


     if (this.isValidPosition(this.x, this.y, this.z, normalizedRotatedBlocks)) {
         this.blocks = normalizedRotatedBlocks;
         this.rotation = (this.rotation + 1) % 4;
         calculateGhostPosition(); // Update ghost on rotate
     } else {
        // Try simple wall kicks (optional, adds complexity)
        // e.g., try moving one unit left/right/forward/back after rotation
        console.log("Rotation blocked");
     }
 }


  hardDrop() {
      let testY = this.y;
       while (this.isValidPosition(this.x, testY - 1, this.z, this.blocks)) {
           testY--;
       }
       this.y = testY; // Move to the lowest valid position
       lockPiece(); // Lock immediately after hard drop
  }

  draw() {
    let globalBlocks = this.getGlobalBlocks();
    for (let block of globalBlocks) {
      // Only draw blocks that are within the visible board height or just above
       if (block.y < boardHeight + 2) { // Allow drawing slightly above board
           drawBlock(block.x, block.y, block.z, this.color);
       }
    }
  }
}

// ==================================
//        USER INPUT
// ==================================
function keyPressed() {
  if (isGameOver || !currentPiece) return;

  switch (keyCode) {
    case LEFT_ARROW:
      currentPiece.moveLateral(-1, 0); // Move left on X-axis
      break;
    case RIGHT_ARROW:
      currentPiece.moveLateral(1, 0); // Move right on X-axis
      break;
    case UP_ARROW:
      currentPiece.moveLateral(0, -1); // Move "forward" on Z-axis
      break;
    case DOWN_ARROW:
      currentPiece.moveLateral(0, 1); // Move "backward" on Z-axis
      break;
    case ENTER:
    case RETURN: // Handle both Enter keys
       currentPiece.rotate();
       break;
    case 32: // Space bar
      currentPiece.hardDrop();
      break;
    // Optional: Soft drop
    // case SHIFT:
    //   currentPiece.moveDown();
    //   lastFallTime = millis(); // Reset timer after manual drop
    //   break;
  }

  // Prevent default browser behavior for arrow keys and space
   if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, 32].includes(keyCode)) {
    return false;
  }
}

// Optional: Handle window resizing
function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
   // Re-apply camera settings if needed, especially perspective
   cam.setAspect(width / height);
}
