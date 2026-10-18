// --- Constants ---
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 40; // Let's use 40 for visibility, 80 is very tall!
const BASE_CELL_SIZE = 20; // Base size, adjust for screen
let cellSize; // Actual cell size calculated based on screen

const PIECE_WIDTHS = [2, 4, 8, 16]; // Original Lego Widths (1xN becomes Nx1 when rotated)
const SHORT_HEIGHT = 1;
const TALL_HEIGHT = 3; // Represents "thickness" visually slightly different

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
    drawShadowPiece(); // Draw shadow first
    drawPiece(currentPiece, currentPiece.x, currentPiece.y);
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
        rotation: 0, // 0: horizontal, 1: vertical
        width: initialWidth, // Current width
        height: initialHeight // Current height
    };

    // --- Game Over Check ---
    if (!isValidPosition(currentPiece, currentPiece.x, currentPiece.y)) {
        gameState = 'GAME_OVER';
        gameOverTimer = millis(); // Start timer for animation/display
        addHighScore(score);
        // console.log("GAME OVER! Final Score:", score);
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

    let originalShape = currentPiece.shape;
    let originalWidth = currentPiece.width;
    let originalHeight = currentPiece.height;
    let originalX = currentPiece.x;
    let originalY = currentPiece.y;

    // Swap width and height
    currentPiece.width = originalHeight;
    currentPiece.height = originalWidth;

    // Create new shape (simple swap for 1xN)
    currentPiece.shape = createPieceShape(currentPiece.width, currentPiece.height);
    currentPiece.rotation = (currentPiece.rotation + 1) % 2; // Toggle rotation state

     // --- Collision check after rotation ---
     // Basic boundary check first
     // Try to reposition if out of bounds (wall kick - simplified)
    let kickX = 0;
    if (currentPiece.x + currentPiece.width > BOARD_WIDTH) {
        kickX = BOARD_WIDTH - (currentPiece.x + currentPiece.width);
    } else if (currentPiece.x < 0) {
        kickX = -currentPiece.x;
    }
     // Check if the kicked position is valid
    if (isValidPosition(currentPiece, currentPiece.x + kickX, currentPiece.y)) {
        currentPiece.x += kickX; // Apply kick
        fallTimer = millis(); // Reset timer after successful rotation
        return true;
    } else {
        // If rotation (even with kick) is invalid, revert
        currentPiece.shape = originalShape;
        currentPiece.width = originalWidth;
        currentPiece.height = originalHeight;
        currentPiece.x = originalX;
        currentPiece.y = originalY;
        currentPiece.rotation = (currentPiece.rotation + 1) % 2; // Revert rotation state too
        return false;
    }
}


function hardDrop() {
    if (!currentPiece) return;
    let dropY = currentPiece.y;
    while (isValidPosition(currentPiece, currentPiece.x, dropY + 1)) {
        dropY++;
    }
    // Only land if it actually moved down
    if (dropY > currentPiece.y) {
        currentPiece.y = dropY;
        landPiece(); // Land immediately after drop
    } else {
        // If it couldn't even drop one step, just land it where it is
        landPiece();
    }
}

function isValidPosition(piece, checkX, checkY) {
    if (!piece || !piece.shape) return false; // Safety check

    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            // Check only occupied cells of the piece's shape
            if (piece.shape[y][x]) {
                let boardX = checkX + x;
                let boardY = checkY + y;

                // Check boundaries
                if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                    return false; // Out of bounds (don't check top boundary here)
                }

                // Check collision with landed pieces (only below the very top)
                if (boardY >= 0 && board[boardY][boardX]) {
                    return false; // Collides with another piece
                }
            }
        }
    }
    return true; // Position is valid
}

function landPiece() {
    if (!currentPiece) return;

    // Add the piece to the board grid
    for (let y = 0; y < currentPiece.height; y++) {
        for (let x = 0; x < currentPiece.width; x++) {
            if (currentPiece.shape[y][x]) {
                let boardX = currentPiece.x + x;
                let boardY = currentPiece.y + y;
                // Make sure it lands within bounds (should always be true if isValidPosition worked)
                if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                    board[boardY][boardX] = {
                        color: currentPiece.color,
                        isTall: currentPiece.isTall,
                        originalWidth: currentPiece.originalWidth // Store info needed for stack check
                    };
                } else if (boardY < 0) {
                     // This piece has landed partially or fully above the top - GAME OVER
                     gameState = 'GAME_OVER';
                     gameOverTimer = millis();
                     addHighScore(score);
                     // console.log("GAME OVER! Piece landed too high.");
                     return; // Stop further processing
                }
            }
        }
    }

    score += PIECE_LAND_SCORE;

    // Check for the special 3-thin-stack rule *before* clearing normal rows
    checkThinStack(currentPiece);

    // Check for and clear completed rows
    clearCompletedRows();


    // Spawn the next piece if the game isn't over
    if (gameState === 'PLAYING') {
        spawnNewPiece();
    }
}

function checkThinStack(landedPiece) {
    // Only trigger for THIN pieces
    if (landedPiece.isTall) return;

    // Need to check the column(s) where the piece landed
    for (let xOffset = 0; xOffset < landedPiece.width; xOffset++) {
        let checkX = landedPiece.x + xOffset;
        let checkY = landedPiece.y; // The row where the piece landed

        // Check if the piece actually occupies this cell (for rotated pieces)
        // Since rotation makes it Nx1, width will be 1 if vertical
        if (landedPiece.rotation === 1 && xOffset > 0) continue; // Only check base column if vertical
        // If horizontal, check all cells in the row it landed in
        if (landedPiece.rotation === 0 && landedPiece.height > 1) {
             // This shouldn't happen with current shapes, but safety check
             continue;
        }


        // Check the two cells directly below
        if (checkY + 1 < BOARD_HEIGHT && checkY + 2 < BOARD_HEIGHT) {
            let cellBelow1 = board[checkY + 1][checkX];
            let cellBelow2 = board[checkY + 2][checkX];

            // Check if both cells below exist, are THIN, and match the landed piece's ORIGINAL type
            if (cellBelow1 && !cellBelow1.isTall && cellBelow1.originalWidth === landedPiece.originalWidth &&
                cellBelow2 && !cellBelow2.isTall && cellBelow2.originalWidth === landedPiece.originalWidth) {

                // --- Match found! ---
                // console.log(`Thin stack detected at (${checkX}, ${checkY})! Clearing row ${checkY}.`);

                // Simple effect: Just clear the row where the *third* piece landed.
                clearRow(checkY);
                score += THIN_STACK_BONUS; // Add bonus score

                 // Add a visual effect marker maybe? (Could be complex)
                // For now, just clear the row immediately.
                // We might need to shift rows down after this clear as well.
                shiftRowsDown(checkY -1); // Shift everything above the cleared row


                // Since we cleared a row, we can stop checking other columns for this piece
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
     for (let x = 0; x < BOARD_WIDTH; x++) {
         board[rowIndex][x] = null;
     }
     // TODO: Add particle effect or flash here?
}

function shiftRowsDown(startY) {
    for (let y = startY; y >= 0; y--) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y + 1][x] = board[y][x]; // Move row down
            board[y][x] = null; // Clear original row
        }
    }
}


function addHighScore(newScore) {
    highScores.push({ score: newScore, name: "YOU" });
    // Sort descending
    highScores.sort((a, b) => b.score - a.score);
    // Keep only top 10
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }
    // Replace "YOU" with "ANON" for next game, except for the latest entry if it's top 10
    // This logic is a bit tricky, let's just mark the current one. The list shows ANON otherwise.
}


// --- Drawing Functions ---

function drawBoard() {
    stroke(80); // Grid color
    strokeWeight(1);
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            // Draw grid lines
            noFill();
            rect(x * cellSize, y * cellSize, cellSize, cellSize);

            // Draw landed pieces
            if (board[y][x]) {
                drawLegoBrick(x, y, board[y][x].color, board[y][x].isTall);
            }
        }
    }
}

function drawPiece(piece, px, py, isShadow = false) {
     if (!piece || !piece.shape) return; // Safety check

    for (let y = 0; y < piece.height; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (piece.shape[y][x]) {
                let drawX = px + x;
                let drawY = py + y;
                // Only draw if within board bounds vertically (allow drawing above top for entry)
                if (drawY < BOARD_HEIGHT) {
                     drawLegoBrick(drawX, drawY, piece.color, piece.isTall, isShadow);
                }
            }
        }
    }
}

function drawLegoBrick(boardX, boardY, col, isTall, isShadow = false) {
    let xPos = boardX * cellSize;
    let yPos = boardY * cellSize;
    let studSize = cellSize * 0.6;
    let studOffset = (cellSize - studSize) / 2;

    // Base Rectangle
    if (isShadow) {
        // Draw semi-transparent outline for shadow
        noFill();
        strokeWeight(2);
        stroke(red(col), green(col), blue(col), 100); // Use piece color but transparent
    } else {
        // Draw solid brick
        fill(col);
        noStroke();
         rect(xPos, yPos, cellSize, cellSize, cellSize * 0.1); // Slightly rounded corners

         // Add subtle 3D effect for tall bricks (e.g., slightly darker bottom edge)
        // if (isTall) {
        //     fill(red(col)*0.8, green(col)*0.8, blue(col)*0.8); // Darker shade
        //     rect(xPos, yPos + cellSize * 0.8, cellSize, cellSize * 0.2, cellSize * 0.1);
        // }


        // --- Draw Stud ---
        // Use slightly lighter/darker shades for stud 3D effect
        let studColorLight = lerpColor(color(col), color(255), 0.3); // Mix with white
        let studColorDark = lerpColor(color(col), color(0), 0.2); // Mix with black

        // Draw darker bottom half of stud
        fill(studColorDark);
        ellipse(xPos + cellSize / 2, yPos + cellSize / 2 + studSize * 0.1, studSize, studSize); // Slightly offset

         // Draw lighter top half of stud
         fill(studColorLight);
         ellipse(xPos + cellSize / 2, yPos + cellSize / 2, studSize * 0.95, studSize * 0.95); // Slightly smaller top

        // Draw main stud color circle
        fill(col);
        ellipse(xPos + cellSize / 2, yPos + cellSize / 2, studSize * 0.85, studSize * 0.85); // Main color
    }
     // Draw the rect outline for shadow after potential fills
     if (isShadow) {
          rect(xPos, yPos, cellSize, cellSize, cellSize * 0.1);
     }

    // Reset drawing styles
    strokeWeight(1);
    stroke(80); // Reset to grid color for board lines
}


function drawShadowPiece() {
    if (!currentPiece) return;

    let shadowPiece = { ...currentPiece }; // Shallow copy is fine
    shadowPiece.y = currentPiece.y;

    // Find the lowest valid Y position
    while (isValidPosition(shadowPiece, shadowPiece.x, shadowPiece.y + 1)) {
        shadowPiece.y++;
    }

    // Draw the piece outline at the shadow position
    drawPiece(shadowPiece, shadowPiece.x, shadowPiece.y, true); // Pass true for isShadow
}


function drawFancyBackground() {
    // Simple example: Flowing Perlin noise colors
    push(); // Isolate background drawing styles
    colorMode(HSB, 360, 100, 100, 1); // Use HSB for easier color cycling
    noStroke();
    let bgRes = 0.02; // Noise resolution
    for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < width; x += 10) {
            let noiseVal = noise(x * bgRes, y * bgRes + bgOffset);
            let hue = map(noiseVal, 0, 1, 180, 360); // Cycle through blues/purples/reds
            let sat = map(noise(x * bgRes + 100, y * bgRes + bgOffset + 50), 0, 1, 40, 90); // Vary saturation
            let bright = map(noise(x * bgRes + 200, y * bgRes + bgOffset + 100), 0, 1, 15, 45); // Vary brightness (keep it dark)
            fill(hue, sat, bright, 0.8); // Semi-transparent noise patches
            rect(x, y, 10, 10);
        }
    }
    bgOffset += 0.005; // Slowly shift the noise pattern
    colorMode(RGB, 255); // Reset color mode
    pop();
}

function drawUI() {
    fill(255);
    textSize(cellSize * 0.8); // Scale text size
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
    drawBoard();
    pop(); // Restore normal drawing context


    // --- Display Text ---
    fill(255);
    textSize(cellSize * 1.5);
    textAlign(CENTER, CENTER);
    text("GAME OVER!", width / 2, height / 3);

    textSize(cellSize);
    text(`Final Score: ${score}`, width / 2, height / 2);

    // --- Display High Scores ---
    textSize(cellSize * 0.7);
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
         text(displayText, width / 2, scoreY + i * (cellSize * 0.9));
    }
     fill(255); // Reset fill

     // --- Restart instructions ---
     textSize(cellSize * 0.8);
     text("Click or Tap to Restart", width/2, height * 0.9);


}


// --- Input Handling ---

function keyPressed() {
    if (gameState !== 'PLAYING') return;

    if (keyCode === LEFT_ARROW) {
        movePiece(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
        movePiece(1, 0);
    } else if (keyCode === DOWN_ARROW) {
        // Move down one step immediately
        if (!movePiece(0, 1)) {
             landPiece(); // Land if it can't move down
        }
        fallTimer = millis(); // Reset fall timer after manual down move
    } else if (keyCode === UP_ARROW || keyCode === ENTER || key === ' ') {
        // Rotate piece (UP or ENTER)
        if (keyCode === UP_ARROW || keyCode === ENTER) {
             rotatePiece();
        }
        // Hard Drop (SPACE)
        else if (key === ' ') {
            hardDrop();
        }
    }
}

// --- Mobile Input Handling ---

function touchStarted() {
    if (millis() - lastInputTime < inputDebounce) return false; // Debounce

    if (gameState === 'GAME_OVER') {
        // Restart game on tap/click
        startGame();
        return false; // Prevent default browser actions
    }

    if (gameState === 'PLAYING') {
        touchStartX = mouseX;
        touchStartY = mouseY;
        touchMovedX = mouseX; // Initialize moved position
        touchMovedY = mouseY;
        isDragging = false; // Reset dragging flag

         // Double Tap check for drop
        let now = millis();
        if (now - lastTapTime < 300) { // 300ms threshold for double tap
             hardDrop();
             lastTapTime = 0; // Reset tap time to prevent triple tap issues
             lastInputTime = now;
             return false; // Consume event
        }
        lastTapTime = now;

        return false; // Prevent default browser actions like scrolling
    }
     return true; // Allow default for other states if needed
}

function touchMoved() {
     if (gameState !== 'PLAYING') return true; // Allow scroll if not playing
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
     if (gameState !== 'PLAYING') return true; // Allow default if not playing
     if (millis() - lastInputTime < inputDebounce) return false; // Debounce


    if (isDragging) {
        // Check for swipe down at the end of a drag
        let deltaY = touchMovedY - touchStartY;
        let deltaX = touchMovedX - touchStartX; // Check horizontal distance too
         if (deltaY > cellSize * 1.5 && abs(deltaY) > abs(deltaX) * 1.5 ) { // Significant downward movement wins
             hardDrop();
             // console.log("Swipe Down Drop");
         }
         // Check for swipe up
         else if (deltaY < -cellSize * 1.5 && abs(deltaY) > abs(deltaX) * 1.5) {
              rotatePiece();
              // console.log("Swipe Up Rotate");
         }
    } else {
        // If it wasn't a drag, it was a tap (and not a double tap)
        // Check if tap was significantly upward for rotation
         let deltaY = mouseY - touchStartY; // Use final mouseY
         if (deltaY < -cellSize * 0.5) { // Small upward flick rotates
            rotatePiece();
            // console.log("Tap Up Rotate");
         } else {
             // Default tap action (could be rotate or nothing)
             // Let's make simple tap rotate too for ease
             rotatePiece();
              // console.log("Simple Tap Rotate");
         }
    }

    isDragging = false; // Reset drag state
    lastInputTime = millis();
    return false; // Prevent default actions
}

// Optional: Handle mouse clicks similarly to taps for desktop testing
function mousePressed() {
   // Forward to touchStarted logic for consistency IF not already handled by touch
   // (p5 runs mouse events even on touch devices sometimes)
   if (touches.length === 0) {
      touchStarted(); // Simulate tap start
   }
   return false; // Prevent default
}

function mouseReleased() {
   if (touches.length === 0) {
      // Simulate touch end if mouse was potentially dragging
       touchEnded();
   }
   return false; // Prevent default
}

// Double click for hard drop on desktop
function doubleClicked() {
    if (gameState === 'PLAYING') {
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

    resizeCanvas(canvasWidth, canvasHeight);
     // May need to adjust text sizes etc. here if they don't scale well
    console.log("Resized canvas:", canvasWidth, canvasHeight, "CellSize:", cellSize);
  }
