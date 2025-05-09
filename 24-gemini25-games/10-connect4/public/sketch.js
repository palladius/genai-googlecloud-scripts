// Game Constants
const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 80; // Size of each cell (and disc)
const BOARD_WIDTH = COLS * CELL_SIZE;
const BOARD_HEIGHT = ROWS * CELL_SIZE;
const BOARD_COLOR = '#4682B4'; // Steel Blue
const RED_COLOR = '#FF6347'; // Tomato
const YELLOW_COLOR = '#FFD700'; // Gold
const EMPTY = 0;
const PLAYER_RED = 1;
const PLAYER_YELLOW = 2;

// Game State
let board;
let currentPlayer;
let gameOver;
let winner;
let fallingDisc = { active: false, col: -1, player: EMPTY, y: 0, targetY: 0 };
let moveHistory = []; // To store moves for the BACK button

// DOM elements
let statusDiv;
let dropButtons = [];
let backButton;

function setup() {
    // Create the canvas inside the board-container div
    const canvas = createCanvas(BOARD_WIDTH, BOARD_HEIGHT);
    canvas.parent('board-container');

    // Get DOM elements
    statusDiv = select('#status');
    const buttonsContainer = select('#buttons-container');
    backButton = select('#back-button');

    // Create drop buttons dynamically
    for (let i = 0; i < COLS; i++) {
        const button = createButton(`${i + 1}`);
        button.addClass('drop-button');
        button.parent(buttonsContainer);
        button.mousePressed(() => handleInput(i)); // Attach click handler
        dropButtons.push(button);
    }

    // Attach handler to the BACK button
    backButton.mousePressed(undoLastMove);

    initializeGame();
}

function initializeGame() {
    // Create an empty board (2D array)
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
    fallingDisc.active = false; // Reset falling disc animation
    moveHistory = []; // Clear move history

    updateStatus();
}

function draw() {
    background(255); // White background for contrast

    // Draw the board base (blue rectangle)
    fill(BOARD_COLOR);
    rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw the holes (where the discs go)
    // We draw the board color first, then "cut out" circles by drawing white circles
    // This gives the appearance of holes
    fill(255); // White color for the holes
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let x = c * CELL_SIZE + CELL_SIZE / 2;
            let y = r * CELL_SIZE + CELL_SIZE / 2;
            ellipse(x, y, CELL_SIZE * 0.8, CELL_SIZE * 0.8); // Draw a white circle
        }
    }

    // Draw placed discs
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== EMPTY) {
                let x = c * CELL_SIZE + CELL_SIZE / 2;
                let y = r * CELL_SIZE + CELL_SIZE / 2;
                fill(board[r][c] === PLAYER_RED ? RED_COLOR : YELLOW_COLOR);
                ellipse(x, y, CELL_SIZE * 0.8, CELL_SIZE * 0.8);
            }
        }
    }

    // Draw falling disc animation
    if (fallingDisc.active) {
        let x = fallingDisc.col * CELL_SIZE + CELL_SIZE / 2;
        fill(fallingDisc.player === PLAYER_RED ? RED_COLOR : YELLOW_COLOR);
        ellipse(x, fallingDisc.y, CELL_SIZE * 0.8, CELL_SIZE * 0.8);

        // Move the disc down
        fallingDisc.y += 15; // Adjust falling speed

        // Check if it reached the target row
        if (fallingDisc.y >= fallingDisc.targetY) {
            fallingDisc.active = false;
            // Now that the animation is done, finalize the move
            finalizeMove(fallingDisc.col, fallingDisc.targetRow, fallingDisc.player);
        }
    }

    // Draw game over message if applicable
    if (gameOver) {
        noLoop(); // Stop the draw loop
        displayGameOver();
    }
}

// Handle keyboard input (1-7)
function keyPressed() {
    if (gameOver || fallingDisc.active) return;

    // Check keys '1' through '7' (key codes 49 through 55)
    if (keyCode >= 49 && keyCode <= 55) {
        let col = keyCode - 49; // Convert key code to column index (0-6)
        handleInput(col);
    }
}

// Handle input from keyboard or buttons
function handleInput(col) {
    if (gameOver || fallingDisc.active) return;

    dropDisc(col);
}

function dropDisc(col) {
    // Find the lowest empty row in the selected column
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === EMPTY) {
            // Valid move found, start animation
            fallingDisc.active = true;
            fallingDisc.col = col;
            fallingDisc.player = currentPlayer;
            fallingDisc.y = 0 - CELL_SIZE / 2; // Start just above the board
            fallingDisc.targetRow = r;
            fallingDisc.targetY = r * CELL_SIZE + CELL_SIZE / 2;

            // Store the move *before* it's officially on the board for animation purposes
            // The board state will be updated in finalizeMove
            moveHistory.push({ col: col, row: r, player: currentPlayer });

            // Temporarily disable input during animation
            disableInput();

            // Start the draw loop again if it was stopped for game over
            if (gameOver) {
                 gameOver = false; // Reset game over state temporarily for animation
                 loop();
            }
            return; // Found a valid spot, exit the function
        }
    }

    // If loop finishes, column is full
    console.log(`Column ${col + 1} is full! Try another one.`);
    // Optionally, display a message to the user
}

// Called once the falling disc animation is complete
function finalizeMove(col, row, player) {
    board[row][col] = player; // Place the disc on the board

    // Check for win or tie
    if (checkWin(row, col, player)) {
        gameOver = true;
        winner = player;
    } else if (checkTie()) {
        gameOver = true;
        winner = EMPTY; // Indicates a tie
    } else {
        // Switch player only if game is not over
        currentPlayer = (currentPlayer === PLAYER_RED) ? PLAYER_YELLOW : PLAYER_RED;
    }

    updateStatus();
    enableInput(); // Re-enable input after move is finalized
}


function checkWin(row, col, player) {
    // Check horizontally
    if (checkLine(row, col, player, 0, 1) + checkLine(row, col, player, 0, -1) >= 3) return true;
    // Check vertically
    if (checkLine(row, col, player, 1, 0) >= 3) return true;
    // Check diagonally (top-left to bottom-right)
    if (checkLine(row, col, player, 1, 1) + checkLine(row, col, player, -1, -1) >= 3) return true;
    // Check diagonally (top-right to bottom-left)
    if (checkLine(row, col, player, 1, -1) + checkLine(row, col, player, -1, 1) >= 3) return true;

    return false; // No win found
}

// Helper function to check a line of discs in a given direction
function checkLine(row, col, player, deltaRow, deltaCol) {
    let count = 0;
    let r = row + deltaRow;
    let c = col + deltaCol;

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        r += deltaRow;
        c += deltaCol;
    }
    return count;
}

function checkTie() {
    // Check if the top row is full (a simple way to check for a full board)
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === EMPTY) {
            return false; // Found an empty cell, not a tie yet
        }
    }
    return true; // Top row is full, it's a tie
}

function undoLastMove() {
    if (gameOver || fallingDisc.active || moveHistory.length === 0) {
        console.log("Cannot undo now!");
        return;
    }

    // Get the last move
    const lastMove = moveHistory.pop();
    const { col, row, player } = lastMove;

    // Clear the disc from the board
    board[row][col] = EMPTY;

    // Switch back the player
    currentPlayer = player; // The player who just moved is now the current player again

    // If the game was over, reset game over state
    if (gameOver) {
        gameOver = false;
        winner = EMPTY;
        loop(); // Resume the draw loop if it was stopped
    }

    updateStatus();
    console.log(`Undid move in column ${col + 1}`);
}


function updateStatus() {
    if (gameOver) {
        if (winner === PLAYER_RED) {
            statusDiv.html('🎉 Red Wins! 🎉').class('green-text');
        } else if (winner === PLAYER_YELLOW) {
            statusDiv.html('🎉 Yellow Wins! 🎉').class('green-text');
        } else {
            statusDiv.html('😟 It\'s a Tie! 😟').class('blue-text');
        }
        // Add a button to play again after game over
        if (!select('#play-again-button')) {
            const playAgainButton = createButton('Play Again? 👉👈');
            playAgainButton.mousePressed(initializeGame);
            playAgainButton.parent(select('#game-container')); // Add it below the status
            playAgainButton.id('play-again-button'); // Give it an ID for easy selection
        }
         select('#play-again-button').show(); // Ensure it's visible
    } else {
         // Hide the play again button if it exists and the game isn't over
        const playAgainButton = select('#play-again-button');
        if (playAgainButton) {
            playAgainButton.hide();
        }

        if (currentPlayer === PLAYER_RED) {
            statusDiv.html('It\'s Red\'s turn! 🔴').class('red-text');
        } else {
            statusDiv.html('It\'s Yellow\'s turn! 🟡').class('yellow-text');
        }
    }
}

// Disable input (buttons and keyboard) during animation or game over
function disableInput() {
    for(let i = 0; i < dropButtons.length; i++) {
        dropButtons[i].attribute('disabled', true);
    }
    backButton.attribute('disabled', true);
}

// Enable input (buttons and keyboard)
function enableInput() {
     if (!gameOver && !fallingDisc.active) {
        for(let i = 0; i < dropButtons.length; i++) {
            dropButtons[i].removeAttribute('disabled');
        }
        backButton.removeAttribute('disabled');
    } else if (gameOver && !fallingDisc.active) {
         // If game is over but animation is done, only back button might be re-enabled
         backButton.removeAttribute('disabled'); // Allow undoing the winning move
    }
}
