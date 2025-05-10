// Game Constants (some are now dynamic!)
const COLS = 7;
const ROWS = 6;
let CELL_SIZE; // This will be calculated dynamically for responsiveness
let BOARD_WIDTH;
let BOARD_HEIGHT;

const BOARD_COLOR = '#4682B4'; // Steel Blue
const RED_COLOR = '#FF6347'; // Tomato
const YELLOW_COLOR = '#FFD700'; // Gold
const EMPTY = 0;
const PLAYER_RED = 1;
const PLAYER_YELLOW = 2;

// Input area related: how tall the clickable drop zone at the top is, relative to a cell
const DROP_AREA_HEIGHT_FACTOR = 1.2;

// Game State
let board;
let currentPlayer;
let gameOver;
let winner;
// Animation speed is now 60% faster! (15 * 1.6 = 24)
let fallingDisc = { active: false, col: -1, player: EMPTY, y: 0, targetY: 0, speed: 24 };
let moveHistory = []; // To store moves for the BACK button

// DOM elements (only status and back button now, as drop buttons are drawn on canvas)
let statusDiv;
let backButton;
let playAgainButton;

function setup() {
    // Calculate the ideal cell size based on window dimensions
    calculateCanvasSize();

    // Create the canvas and attach it to the 'board-container' div
    const canvas = createCanvas(BOARD_WIDTH, BOARD_HEIGHT);
    canvas.parent('board-container');

    // Get and set up DOM elements
    statusDiv = select('#status');
    backButton = select('#back-button');
    backButton.mousePressed(undoLastMove);

    // Create the 'Play Again' button but keep it hidden until needed
    playAgainButton = createButton('Play Again? 👉👈');
    playAgainButton.mousePressed(initializeGame);
    playAgainButton.parent(select('#game-container'));
    playAgainButton.id('play-again-button'); // Give it an ID for easy selection
    playAgainButton.hide(); // Hide initially

    // Start the game!
    initializeGame();
}

// Recalculate canvas size and redraw when the window is resized (great for mobile orientation changes!)
function windowResized() {
    calculateCanvasSize();
    resizeCanvas(BOARD_WIDTH, BOARD_HEIGHT);
    draw(); // Redraw the board immediately after resizing
}

// Determines the optimal CELL_SIZE for the board to fit the screen
function calculateCanvasSize() {
    // Use a percentage of the window width and height to leave some margin
    let availableWidth = windowWidth * 0.9;
    let availableHeight = windowHeight * 0.7; // Reserve space for title, status, buttons

    // Calculate potential CELL_SIZE based on column count for width
    let cellWidthBasedOnCols = floor(availableWidth / COLS);

    // Calculate potential CELL_SIZE based on row count for height
    // We consider 6 rows + the extra height for the tap-to-drop zone
    let totalRowsForCalculation = ROWS + DROP_AREA_HEIGHT_FACTOR;
    let cellHeightBasedOnRows = floor(availableHeight / totalRowsForCalculation);

    // Pick the smaller CELL_SIZE to ensure the board fits both dimensions
    CELL_SIZE = min(cellWidthBasedOnCols, cellHeightBasedOnRows);

    // Ensure a minimum cell size so it's not impossibly small
    if (CELL_SIZE < 40) CELL_SIZE = 40;

    // Set the final board dimensions
    BOARD_WIDTH = COLS * CELL_SIZE;
    BOARD_HEIGHT = (ROWS + DROP_AREA_HEIGHT_FACTOR) * CELL_SIZE; // Board is taller to include drop zone
}

function draw() {
    background(255); // White background for clarity

    // Draw the top "drop area" where players tap/click
    for (let c = 0; c < COLS; c++) {
        fill(BOARD_COLOR + 'B3'); // Semi-transparent blue for the tap zone
        noStroke();
        rect(c * CELL_SIZE, 0, CELL_SIZE, DROP_AREA_HEIGHT_FACTOR * CELL_SIZE);

        // Draw column numbers for clarity
        fill(255); // White text
        textSize(CELL_SIZE * 0.4);
        textAlign(CENTER, CENTER);
        text(c + 1, c * CELL_SIZE + CELL_SIZE / 2, (DROP_AREA_HEIGHT_FACTOR * CELL_SIZE) / 2);
        stroke(0); // Reset stroke
    }

    // Draw the main game board base (blue rectangle), shifted down by the drop area height
    fill(BOARD_COLOR);
    rect(0, DROP_AREA_HEIGHT_FACTOR * CELL_SIZE, BOARD_WIDTH, ROWS * CELL_SIZE);

    // Draw the "holes" in the board
    fill(255); // White color for the holes
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let x = c * CELL_SIZE + CELL_SIZE / 2;
            let y = (r + DROP_AREA_HEIGHT_FACTOR) * CELL_SIZE + CELL_SIZE / 2; // Offset by drop area
            ellipse(x, y, CELL_SIZE * 0.8, CELL_SIZE * 0.8); // Draw a white circle
        }
    }

    // Draw all the discs already placed on the board
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== EMPTY) {
                let x = c * CELL_SIZE + CELL_SIZE / 2;
                let y = (r + DROP_AREA_HEIGHT_FACTOR) * CELL_SIZE + CELL_SIZE / 2; // Offset
                fill(board[r][c] === PLAYER_RED ? RED_COLOR : YELLOW_COLOR);
                ellipse(x, y, CELL_SIZE * 0.8, CELL_SIZE * 0.8);
            }
        }
    }

    // Handle and draw the falling disc animation
    if (fallingDisc.active) {
        let x = fallingDisc.col * CELL_SIZE + CELL_SIZE / 2;
        fill(fallingDisc.player === PLAYER_RED ? RED_COLOR : YELLOW_COLOR);
        ellipse(x, fallingDisc.y, CELL_SIZE * 0.8, CELL_SIZE * 0.8);

        fallingDisc.y += fallingDisc.speed; // Move the disc down at the adjusted speed

        // Check if the disc has reached its target position
        if (fallingDisc.y >= fallingDisc.targetY) {
            fallingDisc.active = false; // Stop animation
            // Finalize the move (place on board, check win/tie, switch player)
            finalizeMove(fallingDisc.col, fallingDisc.targetRow, fallingDisc.player);
        }
    }

    // If the game is over, stop drawing and display the game over message
    if (gameOver) {
        noLoop(); // Stop the draw loop to save resources
        displayGameOver();
    }
}

function initializeGame() {
    // Reset the board to empty
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = EMPTY;
        }
    }

    currentPlayer = PLAYER_RED;
    gameOver = false;
    winner = EMPTY;
    fallingDisc.active = false; // Ensure no disc is animating
    moveHistory = []; // Clear all past moves

    updateStatus(); // Update the status message
    enableInput(); // Ensure input is re-enabled for a new game
    loop(); // Resume the draw loop if it was stopped
}

// Handle keyboard input (keys '1' through '7')
function keyPressed() {
    if (gameOver || fallingDisc.active) return; // No input during game over or animation

    if (keyCode >= 49 && keyCode <= 55) { // ASCII for '1' to '7'
        let col = keyCode - 49; // Convert key code to 0-6 column index
        dropDisc(col);
    }
}

// Handle mouse/touch input directly on the canvas
function mousePressed() {
    if (gameOver || fallingDisc.active) return; // No input during game over or animation

    // Check if the click/touch is within the canvas bounds
    if (mouseX >= 0 && mouseX <= BOARD_WIDTH && mouseY >= 0 && mouseY <= BOARD_HEIGHT) {
        // Check if the click/touch is within the top "drop area"
        if (mouseY < DROP_AREA_HEIGHT_FACTOR * CELL_SIZE) {
            let col = floor(mouseX / CELL_SIZE); // Determine which column was clicked
            if (col >= 0 && col < COLS) { // Ensure the column is valid
                dropDisc(col);
            }
        }
    }
}

// Logic to drop a disc in a column
function dropDisc(col) {
    // Find the lowest empty row in the selected column
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === EMPTY) {
            // Found a valid spot, start the falling animation
            fallingDisc.active = true;
            fallingDisc.col = col;
            fallingDisc.player = currentPlayer;
            // Start the disc just above the board, relative to the drop area
            fallingDisc.y = (DROP_AREA_HEIGHT_FACTOR - 1) * CELL_SIZE;
            fallingDisc.targetRow = r;
            // Calculate the final Y position for the disc, including the drop area offset
            fallingDisc.targetY = (r + DROP_AREA_HEIGHT_FACTOR) * CELL_SIZE + CELL_SIZE / 2;

            // Store the move in history *before* the animation finishes
            moveHistory.push({ col: col, row: r, player: currentPlayer });

            disableInput(); // Disable input until animation is done

            // If game was previously over (e.g., after undoing a winning move), restart draw loop
            if (gameOver) {
                 gameOver = false;
                 loop();
            }
            return; // Valid move, exit function
        }
    }

    // If we reach here, the column is full
    console.log(`Column ${col + 1} is full! Try another one, buddy!`);
    // (You could add a temporary on-screen message here if you want!)
}

// Called after the disc animation completes
function finalizeMove(col, row, player) {
    board[row][col] = player; // Place the disc on the game board

    // Check for a win
    if (checkWin(row, col, player)) {
        gameOver = true;
        winner = player;
    } else if (checkTie()) { // Check for a tie if no win
        gameOver = true;
        winner = EMPTY; // EMPTY winner means a tie
    } else {
        // If no win or tie, switch to the next player
        currentPlayer = (currentPlayer === PLAYER_RED) ? PLAYER_YELLOW : PLAYER_RED;
    }

    updateStatus(); // Update the game status message
    enableInput(); // Re-enable input
}

// Checks for 4 in a row after a disc is placed
function checkWin(row, col, player) {
    // Check horizontally
    if (checkLine(row, col, player, 0, 1) + checkLine(row, col, player, 0, -1) >= 3) return true;
    // Check vertically (only downwards is needed from the last placed disc)
    if (checkLine(row, col, player, 1, 0) >= 3) return true;
    // Check diagonally (top-left to bottom-right)
    if (checkLine(row, col, player, 1, 1) + checkLine(row, col, player, -1, -1) >= 3) return true;
    // Check diagonally (top-right to bottom-left)
    if (checkLine(row, col, player, 1, -1) + checkLine(row, col, player, -1, 1) >= 3) return true;

    return false; // No win found
}

// Helper function to count connected discs in a line
function checkLine(row, col, player, deltaRow, deltaCol) {
    let count = 0;
    let r = row + deltaRow;
    let c = col + deltaCol;

    // Iterate in the given direction, counting matching discs
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        r += deltaRow;
        c += deltaCol;
    }
    return count;
}

// Checks if the board is full (a tie)
function checkTie() {
    // A simple way: if the top row has no empty cells, the board is full
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === EMPTY) {
            return false; // Found an empty cell, not a tie yet
        }
    }
    return true; // Top row is full, it's a tie!
}

// Allows undoing the last move
function undoLastMove() {
    // Cannot undo during animation or if no moves have been made
    if (fallingDisc.active || moveHistory.length === 0) {
        console.log("Can't go back in time right now! 🕰️");
        return;
    }

    // If the game was over, bring it back to life!
    if (gameOver) {
        gameOver = false;
        loop(); // Resume the draw loop
    }

    // Get the last move from history
    const lastMove = moveHistory.pop();
    const { col, row, player } = lastMove;

    // Remove the disc from the board
    board[row][col] = EMPTY;

    // Switch back to the player who just moved
    currentPlayer = player;

    updateStatus(); // Refresh the status message
    console.log(`Undid move in column ${col + 1}. It's now ${currentPlayer === PLAYER_RED ? 'Red' : 'Yellow'}'s turn again!`);
}

// Updates the status message on the screen
function updateStatus() {
    if (gameOver) {
        if (winner === PLAYER_RED) {
            statusDiv.html('🎉 Red Wins! 🎉').class('green-text');
        } else if (winner === PLAYER_YELLOW) {
            statusDiv.html('🎉 Yellow Wins! 🎉').class('green-text');
        } else {
            statusDiv.html('😟 It\'s a Tie! 😟').class('blue-text');
        }
        playAgainButton.show(); // Show the "Play Again" button
    } else {
        playAgainButton.hide(); // Hide the "Play Again" button if game is active

        if (currentPlayer === PLAYER_RED) {
            statusDiv.html('It\'s Red\'s turn! 🔴').class('red-text');
        } else {
            statusDiv.html('It\'s Yellow\'s turn! 🟡').class('yellow-text');
        }
    }
}

// Disables interactive elements during animation or game over
function disableInput() {
    backButton.attribute('disabled', true);
    if (playAgainButton) playAgainButton.attribute('disabled', true);
}

// Enables interactive elements when safe to do so
function enableInput() {
     if (!fallingDisc.active) { // Only enable if no disc is currently falling
        backButton.removeAttribute('disabled');
        if (playAgainButton) playAgainButton.removeAttribute('disabled');
    }
}
