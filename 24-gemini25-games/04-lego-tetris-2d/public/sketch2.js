// --- Constants ---
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 40; // Let's use 40 for visibility, 80 is very tall!
const BASE_CELL_SIZE = 20; // Base size, adjust for screen
let cellSize; // Actual cell size calculated based on screen

const PIECE_WIDTHS = [2, 4, 8, 16]; // Original Lego Widths (1xN becomes Nx1 when rotated)
const SHORT_HEIGHT = 1; // Not used directly, represented by !isTall
const TALL_HEIGHT = 3; // Conceptual thickness, represented by isTall

const GOOGLE_COLORS = ['#DB4437', '#4285F4', '#0F9D58', '#F4B400']; // Red, Blue, Green, Yellow

const BASE_FALL_INTERVAL = 1000; // ms between downward steps initially
const SPEED_INCREASE_INTERVAL = 10000; // ms (10 seconds)
const SPEED_INCREASE_FACTOR = 0.99; // Reduce interval by 1%

const ROW_CLEAR_SCORE_MULTIPLIER = 100;
const PIECE_LAND_SCORE = 10;
const THIN_STACK_BONUS = 500; // Extra score for the special clear

// --- Game Variables ---
let board;
let currentPiece;
let score;
let highScores = []; // Array of { score: number, name: "YOU" | "ANON" }
let gameState; // 'STARTING', 'PLAYING', 'GAME_OVER'
let fallTimer;
let fallInterval;
let speedIncreaseTimer;
let lastInputTime = 0; // Debounce touch/mouse input
const inputDebounce = 100; // ms

// Background effect variables
let bgOffset = 0;

// Control variables for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchMovedX = 0;
let touchMovedY = 0;
let isDragging = false;
let lastTapTime = 0;

// Game Over animation
let gameOverRotation = 0;
let gameOverTimer = 0;


// --- p5.js Core Functions ---

function setup() {
    // Make canvas responsive, fit screen but maintain aspect ratio
    let canvasWidth = Math.min(windowWidth * 0.9, BOARD_WIDTH * BASE_CELL_SIZE * 1.5); // Add some sidebar space maybe
    cellSize = Math.floor(canvasWidth / (BOARD_WIDTH + 6)); // Adjust cell size based on canvas width (+6 for side space)
    let canvasHeight = Math.min(windowHeight * 0.95, BOARD_HEIGHT * cellSize);
    canvasWidth = BOARD_WIDTH * cellSize; // Recalculate width based on height constraint if needed

    // Ensure minimum cell size
    cellSize = max(5, cellSize); // Prevent cells from becoming too small
    canvasWidth = BOARD_WIDTH * cellSize;
    canvasHeight = BOARD_HEIGHT * cellSize;


    createCanvas(canvasWidth, canvasHeight);
    frameRate(30); // Control frame rate

    textFont('Arial'); // Basic font

    // Initialize high scores (example)
    // highScores = [
    //     { score: 5000, name: "ANON" }, { score: 4500, name: "ANON" },
    //     { score: 3000, name: "ANON" }, { score: 2000, name: "ANON" },
    //     { score: 1000, name: "ANON" }
    // ];

    startGame();
}

function draw() {
    background(30); // Dark base background
    drawFancyBackground();

    // Draw game elements based on state
    if (gameState === 'PLAYING') {
        runGameLoop();
    } else if (gameState === 'GAME_OVER') {
        drawGameOverScreen();
    } else if (gameState === 'STARTING') {
        // Could have a "Click to Start" screen here
         runGameLoop(); // Start playing immediately for now
    }

    // Draw UI common elements (Score)
    drawUI();
}

// --- Game Logic Functions ---

function startGame() {
    board = createEmptyBoard();
    score = 0;
    fallInterval = BASE_FALL_INTERVAL;
    fallTimer = millis();
    speedIncreaseTimer = millis();
    gameState = 'PLAYING';
    spawnNewPiece();
}

function createEmptyBoard() {
    // Creates a 2D array filled with null
    let newBoard = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        newBoard[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            newBoard[y][x] = null; // null indicates empty cell
        }
    }
    return newBoard;
}

function runGameLoop() {
    // --- Automatic Falling ---
    if (millis() - fallTimer > fallInterval) {
        if (!movePiece(0, 1)) { // Try to move down
            // If piece can't move down, it lands
            landPiece();
        }
        fallTimer = millis();
    }

    // --- Speed Increase ---
    if (millis() - speedIncreaseTimer > SPEED_INCREASE_INTERVAL) {
        fallInterval *= SPEED_INCREASE_FACTOR;
        // console.log("New fall interval:", fallInterval); // For debugging
        speedIncreaseTimer = millis();
    }

    // --- Drawing ---
    drawBoard();
    if (currentPiece) { // Only draw shadow/piece if it exists
        drawShadowPiece(); // Draw shadow first
        drawPiece(currentPiece, currentPiece.x, currentPiece.y);
    }
}


function spawnNewPiece() {
    // --- Piece Probabilities ---
    let widthChoice;
    let rand = random(1);
    if (rand < 0.4) widthChoice = PIECE_WIDTHS[0]; // 1x2 (40%)
    else if (rand < 0.8) widthChoice = PIECE_WIDTHS[1]; // 1x4 (40%)
    else if (rand < 0.9) widthChoice = PIECE_WIDTHS[2]; // 1x8 (10%)
    else widthChoice = PIECE_WIDTHS[3]; // 1x16 (10%)

    let isTall = random(1) < 0.5; // 50% chance of being tall
    let color = random(GOOGLE_COLORS);
    let initialWidth = widthChoice;
    let initialHeight = 1; // All pieces start as 1xN

    currentPiece = {
        x: floor(BOARD_WIDTH / 2) - floor(initialWidth / 2),
        y: 0, // Start at the top
        color: color,
        isTall: isTall,
        originalWidth: initialWidth, // Store original for stacking check
        shape: createPieceShape(initialWidth, initialHeight),
        rotation: 0, // 0: horizontal (1xN), 1: vertical (Nx1)
        width: initialWidth, // Current width
        height: initialHeight // Current height
    };

    // --- Game Over Check ---
    // Check collision slightly below spawn (y=0 or y=1) to prevent instant game over if space is tight
    if (!isValidPosition(currentPiece, currentPiece.x, currentPiece.y) ||
        !isValidPosition(currentPiece, currentPiece.x, currentPiece.y + 1)) {
         // Check current pos AND one step down - if neither is valid, it's game over
         // This prevents game over if the piece *could* fit but spawns overlapping
         // A more robust check would try spawning and immediately moving down once.
         if (!isValidPosition(currentPiece, currentPiece.x, currentPiece.y)) {
             console.log("GAME OVER! Spawn position invalid.");
             gameState = 'GAME_OVER';
             gameOverTimer = millis(); // Start timer for animation/display
             addHighScore(score);
             currentPiece = null; // Stop trying to draw/move the piece
         }
    }
}

function createPieceShape(w, h) {
    // Creates a simple rectangular shape matrix (array of arrays)
    let shape = [];
    for (let y = 0; y < h; y++) {
        shape[y] = [];
        for (let x = 0; x < w; x++) {
            shape[y][x] = 1; // 1 represents an occupied cell
        }
    }
    return shape;
}


function movePiece(dx, dy) {
    if (!currentPiece) return false; // Don't move if no piece

    // Attempts to move the piece by dx, dy. Returns true if successful, false otherwise.
    let newX = currentPiece.x + dx;
    let newY = currentPiece.y + dy;

    if (isValidPosition(currentPiece, newX, newY)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        // Reset fall timer if moved sideways by player, feels more responsive
        if (dy === 0) { // Only reset if moved horizontally
             fallTimer = millis();
        }
        return true;
    }
    return false;
}

function rotatePiece() {
    if (!currentPiece) return false;

    // --- Store original state ---
    let originalShape = currentPiece.shape;
    let originalWidth = currentPiece.width;
    let originalHeight = currentPiece.height;
    let originalX = currentPiece.x;
    let originalY = currentPiece.y;
    let originalRotation = currentPiece.rotation;

    // --- Calculate new state ---
    let newWidth = originalHeight; // Swap dimensions for rotation
    let newHeight = originalWidth;
    let newRotation = (currentPiece.rotation + 1) % 2; // Toggle 0 and 1
    let newShape = createPieceShape(newWidth, newHeight);

    // Apply temporary changes for collision check
    currentPiece.width = newWidth;
    currentPiece.height = newHeight;
    currentPiece.shape = newShape;
    currentPiece.rotation = newRotation;

    // --- Collision Check & Wall Kick (Simplified) ---
    let potentialX = originalX; // Start check at original X
    let potentialY = originalY;

    if (!isValidPosition(currentPiece, potentialX, potentialY)) {
        // Try kicking left or right
        let kicks = [0, 1, -1, 2, -2]; // Standard Tetris kicks (simplified for lines)
        let foundValidKick = false;
        for (let kick of kicks) {
             potentialX = originalX + kick;
             if (isValidPosition(currentPiece, potentialX, potentialY)) {
                 foundValidKick = true;
                 break; // Found a valid position
             }
         }

         if (!foundValidKick) {
              // Rotation failed, revert everything
              currentPiece.shape = originalShape;
              currentPiece.width = originalWidth;
              currentPiece.height = originalHeight;
              currentPiece.x = originalX;
              currentPiece.y = originalY;
              currentPiece.rotation = originalRotation;
              return false; // Indicate rotation failure
         }
         // If kick worked, potentialX is now the valid kicked position
    }

    // --- Apply Successful Rotation ---
    currentPiece.x = potentialX; // Apply potential kick
    currentPiece.y = potentialY; // Y doesn't usually kick for simple lines
    // Width, Height, Shape, Rotation were already updated

    fallTimer = millis(); // Reset timer after successful rotation
    return true; // Indicate success
}


function hardDrop() {
    if (!currentPiece) return;
    let dropY = currentPiece.y;
    // Find the lowest valid Y position directly below
    while (isValidPosition(currentPiece, currentPiece.x, dropY + 1)) {
        dropY++;
    }
    // Only land if it actually moved down or if it's already at the lowest spot
    if (dropY >= currentPiece.y) { // Use >= to handle case where it can't move at all
        currentPiece.y = dropY;
        landPiece(); // Land immediately after drop
    }
    // No 'else' needed, if it can't move, landPiece handles it
}

function isValidPosition(piece, checkX, checkY) {
    if (!piece || !piece.shape) return false; // Safety check

    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            // Check only occupied cells of the piece's shape
            if (piece.shape[y][x]) {
                let boardX = checkX + x;
                let boardY = checkY + y;

                // 1. Check Left/Right Boundaries
                if (boardX < 0 || boardX >= BOARD_WIDTH) {
                    // console.log(`Collision: Out of X bounds (${boardX})`);
                    return false;
                }

                // 2. Check Bottom Boundary
                if (boardY >= BOARD_HEIGHT) {
                     // console.log(`Collision: Out of Y bounds (${boardY})`);
                    return false;
                }

                // 3. Check Collision with landed pieces (only for cells on the board, y>=0)
                if (boardY >= 0 && board[boardY][boardX]) {
                     // console.log(`Collision: Hit landed piece at (${boardX}, ${boardY})`);
                    return false; // Collides with another piece
                }
            }
        }
    }
    // console.log(`Position OK: (${checkX}, ${checkY})`);
    return true; // Position is valid
}

function landPiece() {
    if (!currentPiece) return;

    let pieceLandedTooHigh = false;

    // Add the piece to the board grid
    for (let y = 0; y < currentPiece.height; y++) {
        for (let x = 0; x < currentPiece.width; x++) {
            if (currentPiece.shape[y][x]) {
                let boardX = currentPiece.x + x;
                let boardY = currentPiece.y + y;

                // Check if any part lands above the visible board (Y < 0)
                if (boardY < 0) {
                    pieceLandedTooHigh = true;
                    // Don't place it on the board, just flag for game over
                    continue; // Skip placing this part
                }

                // Make sure it lands within bounds (should always be true if isValidPosition worked, but safety first)
                if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                    board[boardY][boardX] = {
                        color: currentPiece.color,
                        isTall: currentPiece.isTall,
                        originalWidth: currentPiece.originalWidth // Store info needed for stack check
                    };
                }
            }
        }
    }

    // --- Check Game Over Condition FIRST ---
     if (pieceLandedTooHigh) {
         console.log("GAME OVER! Piece landed too high.");
         gameState = 'GAME_OVER';
         gameOverTimer = millis();
         addHighScore(score);
         currentPiece = null; // Nullify the piece so it stops processing
         return; // Stop further processing like scoring or clearing rows
     }


    // --- If not game over, proceed ---
    score += PIECE_LAND_SCORE;

    // Check for the special 3-thin-stack rule *before* clearing normal rows
    // Pass the state of the piece *as it landed*
    checkThinStack(currentPiece.x, currentPiece.y, currentPiece.width, currentPiece.isTall, currentPiece.originalWidth, currentPiece.rotation);

    // Check for and clear completed rows
    clearCompletedRows();


    // Spawn the next piece (only if the game is still playing)
    if (gameState === 'PLAYING') {
        spawnNewPiece();
    } else {
        // If game state changed during landing/clearing (e.g., by checkThinStack indirectly),
        // ensure piece is nullified.
        currentPiece = null;
    }
}

// Modified to take necessary parameters from the landed piece state
function checkThinStack(landedX, landedY, landedWidth, landedIsTall, landedOriginalWidth, landedRotation) {
    // Only trigger for THIN pieces
    if (landedIsTall) return;

    // Need to check the column(s) where the piece landed
    for (let xOffset = 0; xOffset < landedWidth; xOffset++) {
        let checkX = landedX + xOffset;
        let checkY = landedY; // The row where the *top* of the piece landed

        // If the piece landed vertically (Nx1), it only occupies one column (xOffset=0).
        // The actual cells are checkY, checkY+1, ..., checkY+height-1
        // We need to check below the *bottom-most* cell of the stack.

        let baseRowToCheckBelow;
        if (landedRotation === 1) { // Piece is Vertical (Nx1)
            if (xOffset > 0) continue; // Only check the single column
            baseRowToCheckBelow = landedY + landedWidth -1; // Height == originalWidth when vertical
             // Ensure we are checking the correct column
             checkX = landedX;

        } else { // Piece is Horizontal (1xN)
             baseRowToCheckBelow = landedY; // Height is 1
             // checkX is already correct from loop (landedX + xOffset)
        }


        // Check the two cells directly below the relevant cell of the landed piece
        if (baseRowToCheckBelow + 1 < BOARD_HEIGHT && baseRowToCheckBelow + 2 < BOARD_HEIGHT && checkX >= 0 && checkX < BOARD_WIDTH) {
            let cellBelow1 = board[baseRowToCheckBelow + 1][checkX];
            let cellBelow2 = board[baseRowToCheckBelow + 2][checkX];

            // Check if both cells below exist, are THIN, and match the landed piece's ORIGINAL type
            if (cellBelow1 && !cellBelow1.isTall && cellBelow1.originalWidth === landedOriginalWidth &&
                cellBelow2 && !cellBelow2.isTall && cellBelow2.originalWidth === landedOriginalWidth) {

                // --- Match found! ---
                console.log(`Thin stack detected at (${checkX}, ${baseRowToCheckBelow})! Clearing row ${baseRowToCheckBelow}.`);

                // Clear the row where the *third* piece (the one that just landed) has its base.
                clearRow(baseRowToCheckBelow);
                score += THIN_STACK_BONUS; // Add bonus score

                // Shift rows down after this clear
                shiftRowsDown(baseRowToCheckBelow - 1); // Shift everything above the cleared row

                // Since we cleared a row based on this stack, stop checking other columns
                return;
            }
        }
    }
}


function clearCompletedRows() {
    let rowsCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isRowFull = true;
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!board[y][x]) {
                isRowFull = false;
                break;
            }
        }

        if (isRowFull) {
            clearRow(y);
            shiftRowsDown(y - 1); // Shift rows down starting from the one above the cleared row
            rowsCleared++;
            y++; // Re-check the current row index as it now contains the row from above
            // console.log("Cleared row:", y);
        }
    }

    if (rowsCleared > 0) {
        // Award score based on number of rows cleared at once (e.g., Tetris scoring)
        score += pow(rowsCleared, 2) * ROW_CLEAR_SCORE_MULTIPLIER; // Score quadratically
        // console.log("Score after clear:", score);
    }
}

function clearRow(rowIndex) {
     if (rowIndex < 0 || rowIndex >= BOARD_HEIGHT) return; // Bounds check
     for (let x = 0; x < BOARD_WIDTH; x++) {
         board[rowIndex][x] = null;
     }
     // TODO: Add particle effect or flash here?
}

function shiftRowsDown(startY) {
    if (startY < -1) return; // Safety check, -1 means shift from row 0 down
    for (let y = startY; y >= 0; y--) {
         if (y + 1 < BOARD_HEIGHT) { // Ensure we don't write out of bounds
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[y + 1][x] = board[y][x]; // Move row down
                board[y][x] = null; // Clear original row
            }
         }
    }
    // Clear the top row (row 0) if necessary (if startY included it)
    if (startY >= -1) { // Always clear row 0 if shifting occurred
         for (let x = 0; x < BOARD_WIDTH; x++) {
             if(board[0]) board[0][x] = null;
         }
    }
}


function addHighScore(newScore) {
    // Find if "YOU" is already in the top 10
    let yourBestIndex = highScores.findIndex(entry => entry.name === "YOU");

    // Add the new score
    highScores.push({ score: newScore, name: "YOU" });

    // Sort descending
    highScores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    highScores = highScores.slice(0, 10);

    // Find the index of the *new* score (which should be marked "YOU")
    let newYouIndex = highScores.findIndex(entry => entry.score === newScore && entry.name === "YOU");

    // Clean up old "YOU" markers ONLY if the new score made it into the top 10
    if (newYouIndex !== -1) {
        for(let i=0; i < highScores.length; i++) {
             if (highScores[i].name === "YOU" && i !== newYouIndex) {
                 highScores[i].name = "ANON";
             }
        }
    } else {
        // If your new score didn't make top 10, remove the "YOU" marker from it
         let justAddedIndex = highScores.findIndex(entry => entry.score === newScore && entry.name === "YOU");
         if(justAddedIndex !== -1) highScores[justAddedIndex].name = "ANON"; // Should not happen with slice(0,10) but safety
    }
}


// --- Drawing Functions ---

function drawBoard() {
    stroke(80, 80, 80, 150); // Grid color (slightly transparent)
    strokeWeight(1);
    noFill(); // Ensure grid lines aren't filled
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            // Draw grid lines
            rect(x * cellSize, y * cellSize, cellSize, cellSize);

            // Draw landed pieces
            if (board[y][x]) {
                // Use data stored in the board cell
                drawLegoBrick(x, y, board[y][x].color, board[y][x].isTall);
            }
        }
    }
}

function drawPiece(piece, px, py, isShadow = false) {
     if (!piece || !piece.shape) return; // Safety check

    let pieceColor = color(piece.color); // Convert to p5 color object

    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (piece.shape[y][x]) {
                let drawX = px + x;
                let drawY = py + y;
                // Only draw if within board bounds vertically (allow drawing above top for entry)
                if (drawY < BOARD_HEIGHT && drawX < BOARD_WIDTH && drawX >=0) { // Check X bounds too
                     drawLegoBrick(drawX, drawY, pieceColor, piece.isTall, isShadow);
                }
            }
        }
    }
}

function drawLegoBrick(boardX, boardY, p5Color, isTall, isShadow = false) {
    let xPos = boardX * cellSize;
    let yPos = boardY * cellSize;

    // --- Visual Cue for Tall Bricks ---
    let baseColor = p5Color;
    if (isTall && !isShadow) {
        // Make tall bricks slightly darker or add a "side"
        // Option 1: Darker base
         baseColor = lerpColor(p5Color, color(0), 0.15); // Blend with black slightly

        // Option 2: Draw a subtle bottom edge shadow (can be combined)
         fill(lerpColor(p5Color, color(0), 0.3)); // Darker shade for edge
         noStroke();
         // Draw a small rectangle at the bottom
         rect(xPos, yPos + cellSize * 0.8, cellSize, cellSize * 0.2, cellSize * 0.05);
    }

    // --- Base Rectangle ---
    if (isShadow) {
        // Draw semi-transparent outline for shadow
        noFill();
        strokeWeight(max(1, cellSize * 0.05)); // Make shadow line slightly thicker for small cells
        // Use the original piece color for the shadow outline, but transparent
        stroke(red(p5Color), green(p5Color), blue(p5Color), 100);
        rect(xPos, yPos, cellSize, cellSize, cellSize * 0.1); // Slightly rounded corners
    } else {
        // Draw solid brick base (using potentially modified baseColor for tall bricks)
        fill(baseColor);
        noStroke();
        rect(xPos, yPos, cellSize, cellSize, cellSize * 0.1); // Slightly rounded corners

        // --- Draw Stud (only for non-shadow bricks) ---
        let studSize = max(2, cellSize * 0.6); // Ensure minimum stud size
        let studX = xPos + cellSize / 2;
        let studY = yPos + cellSize / 2;

        // Use slightly lighter/darker shades for stud 3D effect
        let studColorLight = lerpColor(p5Color, color(255), 0.3); // Mix with white
        let studColorDark = lerpColor(p5Color, color(0), 0.2); // Mix with black

        // Draw darker bottom half of stud (as subtle shadow)
        fill(studColorDark);
        ellipse(studX, studY + studSize * 0.05, studSize, studSize); // Offset slightly down

         // Draw lighter top-left highlight of stud
         fill(studColorLight);
         ellipse(studX - studSize * 0.03, studY - studSize * 0.03, studSize * 0.95, studSize * 0.95); // Offset slightly up-left

        // Draw main stud color circle
        fill(p5Color); // Use the original piece color for the main stud part
        ellipse(studX, studY, studSize * 0.85, studSize * 0.85); // Main color
    }

    // Reset drawing styles potentially modified
    strokeWeight(1);
    // Stroke for the board grid is handled in drawBoard()
}


function drawShadowPiece() {
    if (!currentPiece) return;

    // Create a temporary object matching the current piece state
     let shadowPiece = {
         x: currentPiece.x,
         y: currentPiece.y,
         width: currentPiece.width,
         height: currentPiece.height,
         shape: currentPiece.shape,
         color: currentPiece.color, // Pass color info
         isTall: currentPiece.isTall // Pass tall info
     };


    // Find the lowest valid Y position
    while (isValidPosition(shadowPiece, shadowPiece.x, shadowPiece.y + 1)) {
        shadowPiece.y++;
    }

    // Draw the piece outline at the shadow position
    // Avoid drawing if shadow is in the exact same spot as the piece
    if (shadowPiece.y > currentPiece.y) {
        drawPiece(shadowPiece, shadowPiece.x, shadowPiece.y, true); // Pass true for isShadow
    }
}


function drawFancyBackground() {
    // Simple example: Flowing Perlin noise colors
    push(); // Isolate background drawing styles
    colorMode(HSB, 360, 100, 100, 1); // Use HSB for easier color cycling
    noStroke();
    let bgRes = 0.02; // Noise resolution
    let patchSize = max(10, cellSize); // Scale patch size with cell size
    for (let y = 0; y < height; y += patchSize) {
        for (let x = 0; x < width; x += patchSize) {
            let noiseVal = noise(x * bgRes, y * bgRes + bgOffset);
            let hue = map(noiseVal, 0, 1, 180, 360); // Cycle through blues/purples/reds
            let sat = map(noise(x * bgRes + 100, y * bgRes + bgOffset + 50), 0, 1, 40, 90); // Vary saturation
            let bright = map(noise(x * bgRes + 200, y * bgRes + bgOffset + 100), 0, 1, 15, 45); // Vary brightness (keep it dark)
            fill(hue, sat, bright, 0.8); // Semi-transparent noise patches
            rect(x, y, patchSize, patchSize);
        }
    }
    bgOffset += 0.005; // Slowly shift the noise pattern
    colorMode(RGB, 255); // Reset color mode
    pop();
}

function drawUI() {
    fill(255);
    textSize(max(10, cellSize * 0.8)); // Scale text size, ensure minimum
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);

    // Optional: Display next piece preview (more complex)
    // Optional: Display level or speed
}

function drawGameOverScreen() {
    // --- Dim Background ---
    fill(0, 0, 0, 180); // Semi-transparent black overlay
    rect(0, 0, width, height);

    // --- Rotate Final Structure ---
    push();
    // Center the rotation roughly where the pieces are
    let avgX = 0;
    let avgY = 0;
    let pieceCount = 0;
     for(let y=0; y<BOARD_HEIGHT; y++){
        for(let x=0; x<BOARD_WIDTH; x++){
            if(board[y][x]){
                avgX += x;
                avgY += y;
                pieceCount++;
            }
        }
    }
    if (pieceCount > 0) {
        avgX /= pieceCount;
        avgY /= pieceCount;
    } else {
        avgX = BOARD_WIDTH / 2;
        avgY = BOARD_HEIGHT / 2;
    }

    translate(avgX * cellSize + cellSize / 2, avgY * cellSize + cellSize / 2); // Translate origin to center of mass
    let timeFactor = (millis() - gameOverTimer) / 5000; // Rotate over 5 seconds
    gameOverRotation = sin(timeFactor * PI) * 0.1; // Gentle back-and-forth rock
    // gameOverRotation += 0.01; // Continuous spin
     rotate(gameOverRotation);
    translate(-(avgX * cellSize + cellSize / 2), -(avgY * cellSize + cellSize / 2)); // Translate back

    // Draw the final board state (rotated)
    // Need to redraw grid lines as well if rotating the whole board
    stroke(80, 80, 80, 150); // Grid color
    strokeWeight(1);
    noFill();
     for(let y=0; y<BOARD_HEIGHT; y++){
        for(let x=0; x<BOARD_WIDTH; x++){
            rect(x * cellSize, y * cellSize, cellSize, cellSize); // Redraw grid under rotation
            if(board[y][x]){
                drawLegoBrick(x, y, color(board[y][x].color), board[y][x].isTall); // Redraw bricks
            }
        }
    }
    pop(); // Restore normal drawing context


    // --- Display Text ---
    fill(255);
    textSize(max(14, cellSize * 1.5));
    textAlign(CENTER, CENTER);
    text("GAME OVER!", width / 2, height / 3);

    textSize(max(12, cellSize));
    text(`Final Score: ${score}`, width / 2, height / 2);

    // --- Display High Scores ---
    textSize(max(10, cellSize * 0.7));
    textAlign(CENTER, CENTER);
    text("High Scores:", width / 2, height * 0.6);
    let scoreY = height * 0.65;
    for (let i = 0; i < highScores.length; i++) {
         let entry = highScores[i];
         let displayText = `${i + 1}. ${entry.score}`;
         if (entry.name === "YOU") {
            fill('#F4B400'); // Highlight YOUR score in Yellow! ✨
            displayText += " < YOU";
         } else {
             fill(220); // Grey for others
         }
         text(displayText, width / 2, scoreY + i * max(12, cellSize * 0.9));
         fill(255); // Reset fill for next line
    }


     // --- Restart instructions ---
     textSize(max(12, cellSize * 0.8));
     text("Click or Tap to Restart", width/2, height * 0.9);


}


// --- Input Handling ---

function keyPressed() {
    // Add a console log to see if the function is even firing
    console.log("Key Pressed Code:", keyCode, "Key:", key); // DEBUG

    // If game is over, allow restart on any key? Or just specific ones?
    if (gameState === 'GAME_OVER') {
        // Let's allow restart on Enter for desktop
        if (keyCode === ENTER) {
             startGame();
        }
        return; // Don't process game controls if game over
    }

    if (gameState !== 'PLAYING' || !currentPiece) {
         console.log("Input ignored: Not playing or no current piece."); // DEBUG
         return; // Ignore input if not playing or piece is null
    }


    // Use keyCode for arrows, key for letters/space
    if (keyCode === LEFT_ARROW) {
        console.log("Attempting move left"); // DEBUG
        movePiece(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
        console.log("Attempting move right"); // DEBUG
        movePiece(1, 0);
    } else if (keyCode === DOWN_ARROW) {
        console.log("Attempting move down"); // DEBUG
        // Move down one step immediately
        if (!movePiece(0, 1)) {
             // If soft drop fails, maybe land? Or just stop? Let's just stop.
             // landing happens automatically anyway.
        }
        fallTimer = millis(); // Reset fall timer after manual down move
    } else if (keyCode === UP_ARROW || keyCode === ENTER) { // Use UP or ENTER to rotate
        console.log("Attempting rotate"); // DEBUG
        rotatePiece();
    } else if (key === ' ') { // Use Space Bar for hard drop
        console.log("Attempting hard drop"); // DEBUG
        hardDrop();
    } else {
        console.log("Unmapped key"); // DEBUG
        return; // Don't prevent default for unmapped keys
    }

    // Prevent default browser action (like scrolling with arrow keys)
    // only for keys we actually handle
    return false;
}

// --- Mobile Input Handling ---
// (Keep mobile functions as they were, assuming they worked)
function touchStarted() {
    // Make sure clicks/taps register even if keypress doesn't work
    console.log("Touch Started"); // DEBUG

    if (millis() - lastInputTime < inputDebounce) return false; // Debounce

    if (gameState === 'GAME_OVER') {
        // Restart game on tap/click
        console.log("Restarting game via touch/click"); // DEBUG
        startGame();
        return false; // Prevent default browser actions
    }

    if (gameState === 'PLAYING' && currentPiece) {
        touchStartX = mouseX;
        touchStartY = mouseY;
        touchMovedX = mouseX; // Initialize moved position
        touchMovedY = mouseY;
        isDragging = false; // Reset dragging flag

         // Double Tap check for drop
        let now = millis();
        if (now - lastTapTime < 300) { // 300ms threshold for double tap
             console.log("Double Tap Drop"); // DEBUG
             hardDrop();
             lastTapTime = 0; // Reset tap time to prevent triple tap issues
             lastInputTime = now;
             return false; // Consume event
        }
        lastTapTime = now;

        // Prevent default page scroll?
        return false;
    }
     return true; // Allow default for other states if needed
}

function touchMoved() {
     if (gameState !== 'PLAYING' || !currentPiece) return true; // Allow scroll if not playing
     if (millis() - lastInputTime < inputDebounce / 3) return false; // More aggressive debounce during drag

    touchMovedX = mouseX;
    touchMovedY = mouseY;
    isDragging = true; // It's a drag if touchMoved is called

    let deltaX = touchMovedX - touchStartX;
    let threshold = cellSize * 0.8; // Drag threshold

    // Move piece horizontally based on drag distance
    if (abs(deltaX) > threshold) {
        if (deltaX > 0) {
            movePiece(1, 0);
        } else {
            movePiece(-1, 0);
        }
        // Reset start position for continuous dragging relative to current spot
        touchStartX = mouseX;
        lastInputTime = millis();
    }

    return false; // Prevent scrolling during drag
}

function touchEnded() {
     if (gameState !== 'PLAYING' || !currentPiece) return true; // Allow default if not playing
     if (millis() - lastInputTime < inputDebounce) return false; // Debounce


    if (isDragging) {
        // Check for swipe down at the end of a drag
        let deltaY = touchMovedY - touchStartY;
        let deltaX = touchMovedX - touchStartX; // Check horizontal distance too
         if (deltaY > cellSize * 1.5 && abs(deltaY) > abs(deltaX) * 1.5 ) { // Significant downward movement wins
             console.log("Swipe Down Drop"); // DEBUG
             hardDrop();
         }
         // Check for swipe up
         else if (deltaY < -cellSize * 1.5 && abs(deltaY) > abs(deltaX) * 1.5) {
              console.log("Swipe Up Rotate"); // DEBUG
              rotatePiece();
         }
    } else {
        // If it wasn't a drag, it was a tap (and not a double tap)
        // Check if tap was significantly upward for rotation
         let deltaY = mouseY - touchStartY; // Use final mouseY
         if (deltaY < -cellSize * 0.5) { // Small upward flick rotates
            console.log("Tap Up Rotate"); // DEBUG
            rotatePiece();
         } else {
             // Default tap action (could be rotate or nothing)
             // Let's make simple tap rotate too for ease
             console.log("Simple Tap Rotate"); // DEBUG
             rotatePiece();
         }
    }

    isDragging = false; // Reset drag state
    lastInputTime = millis();
    return false; // Prevent default actions
}

// Optional: Handle mouse clicks similarly to taps for desktop testing
function mousePressed() {
    console.log("Mouse Pressed"); // DEBUG
   // Forward to touchStarted logic for consistency IF not already handled by touch
   // (p5 runs mouse events even on touch devices sometimes)
   if (touches.length === 0) {
      // Only simulate if no active touches are present
      touchStarted();
   }
   return false; // Prevent default
}

function mouseReleased() {
   if (touches.length === 0) {
       console.log("Mouse Released (simulating touch end)"); // DEBUG
      // Simulate touch end if mouse was potentially dragging and no touches active
       touchEnded();
   }
   return false; // Prevent default
}

// Double click for hard drop on desktop
function doubleClicked() {
    if (gameState === 'PLAYING' && currentPiece) {
         console.log("Double Click Drop"); // DEBUG
         hardDrop();
        return false; // Prevent default
    }
     return true;
}


// Handle window resizing
function windowResized() {
     // Recalculate canvas size and cell size
    let canvasWidth = Math.min(windowWidth * 0.9, BOARD_WIDTH * BASE_CELL_SIZE * 1.5);
    cellSize = Math.floor(canvasWidth / (BOARD_WIDTH + 6));
    let canvasHeight = Math.min(windowHeight * 0.95, BOARD_HEIGHT * cellSize);
    canvasWidth = BOARD_WIDTH * cellSize;

     // Ensure minimum cell size
    cellSize = max(5, cellSize); // Prevent cells from becoming too small
    canvasWidth = BOARD_WIDTH * cellSize;
    canvasHeight = BOARD_HEIGHT * cellSize;


    resizeCanvas(canvasWidth, canvasHeight);
     // May need to adjust text sizes etc. here if they don't scale well
    console.log("Resized canvas:", canvasWidth, canvasHeight, "CellSize:", cellSize);
}
