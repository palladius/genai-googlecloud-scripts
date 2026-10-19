

// p5.js Endless Runner - Pixel Quest (with Double Jump)
// --- Game Configuration ---
const PLAYER_SIZE = 40;
const GROUND_HEIGHT = 50;
const GRAVITY_FORCE = 0.6;
const JUMP_FORCE = -12; // Force applied for each jump
const OBSTACLE_BASE_SPEED = 5;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 80;
const OBSTACLE_SPAWN_RATE = 90; // Lower = more frequent obstacles (frames)
const BACKGROUND_SCROLL_SPEED_FACTOR = 0.5; // How fast background scrolls relative to obstacles

// --- Game Variables ---
let player;
let obstacles = [];
let score = 0;
let gameState = 'START'; // START, PLAYING, GAME_OVER
let gameSpeed = OBSTACLE_BASE_SPEED;
let spawnTimer = 0;

// --- Assets ---
let playerImg; // Variable for player image (optional, loads in preload)
let backgroundImg; // Variable for background image (optional, loads in preload)
let bgX = 0; // Background scroll offset

// --- p5.js Functions ---

function preload() {
    // Preload assets here
    // IMPORTANT: Replace image URLs if needed, or upload directly to p5.js editor.
    // CORS issues might prevent loading from external sites like Freepik directly.
    // If images fail, the game will fallback to drawing shapes.
    try {
        // Example Player Image (Optional - uncomment and provide URL or upload)
        // playerImg = loadImage('URL_TO_YOUR_PIXEL_PLAYER_SPRITE.png');

        // Example Background Image (Replace/Upload if needed)
        // Uploading 'medieval-background.jpg' to the p5.js editor and using
        // backgroundImg = loadImage('medieval-background.jpg'); is often more reliable.
//        backgroundImg = loadImage('https://img.freepik.com/free-vector/pixel-art-fantasy-castle-landscape_23-2151154231.jpg');
//backgroundImg = loadImage('istockphoto-1371387288-640x640.jpg');
        backgroundImg = loadImage('seby-bicicletta.jpg');

        console.log("Assets loading attempt...");
    } catch (e) {
        console.error("Error loading assets. Using fallback graphics.", e);
    }
}

function setup() {
    createCanvas(windowWidth > 800 ? 800 : windowWidth, 400);
    textFont('monospace');

    // Initialize player (using the updated Player class with double jump)
    player = new Player();

    // Set image mode for background if loaded
    if (backgroundImg) {
        imageMode(CORNER);
    }

    noStroke();
    textAlign(CENTER, CENTER);
}

function draw() {
    // 1. Draw Background
    drawBackground();

    // 2. Handle Game States
    switch (gameState) {
        case 'START':
            showStartScreen();
            break;
        case 'PLAYING':
            runGame();
            break;
        case 'GAME_OVER':
            showGameOverScreen();
            break;
    }
}

// --- Game Logic Functions ---

function runGame() {
    // Update & Show Player
    // Apply gravity force before updating position
    player.applyForce(createVector(0, GRAVITY_FORCE));
    player.update(); // Updates position and checks for ground collision/resets jumps
    player.show();

    // Spawn Obstacles
    spawnTimer++;
    if (spawnTimer > OBSTACLE_SPAWN_RATE) {
       if (random(1) < 0.8) { // Add some randomness
           obstacles.push(new Obstacle());
       }
       spawnTimer = 0;
    }

    // Update & Show Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].show();

        // Collision Check
        if (player.hits(obstacles[i])) {
            gameOver();
            break; // Exit loop
        }

        // Remove off-screen obstacles & Score
        if (obstacles[i].isOffscreen()) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.1; // Increase difficulty
        }
    }

    // Display Score
    showScore();
}

function startGame() {
    gameState = 'PLAYING';
    loop(); // Ensure game loop is running
}

function gameOver() {
    gameState = 'GAME_OVER';
    noLoop(); // Stop the game loop
}

function resetGame() {
    score = 0;
    obstacles = [];
    player = new Player(); // Re-initialize player (resets jumps etc.)
    bgX = 0;
    gameSpeed = OBSTACLE_BASE_SPEED;
    spawnTimer = 0;
}

// --- Drawing Functions ---

function drawBackground() {
    if (backgroundImg && backgroundImg.width > 0) { // Check if image loaded successfully
        image(backgroundImg, bgX, 0, width, height);
        image(backgroundImg, bgX + width, 0, width, height);

        if (gameState === 'PLAYING') {
            bgX -= gameSpeed * BACKGROUND_SCROLL_SPEED_FACTOR;
            if (bgX <= -width) {
                bgX = 0;
            }
        }
    } else {
        // Fallback solid color background
        background(135, 206, 250); // Sky blue
         if (!backgroundImg) console.warn("Background image failed to load or not provided."); // Log warning once maybe?
    }

    // Draw Ground
    fill(80, 150, 80); // Greenish ground
    rect(0, height - GROUND_HEIGHT, width, GROUND_HEIGHT);
}

function showStartScreen() {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    fill(255);
    textSize(48);
    text('Pixel Runner Quest', width / 2, height / 3);

    textSize(24);
    text('SPACEBAR or Click to Jump', width / 2, height / 2); // Clarified controls
    text('(You can jump twice!)', width/2, height/2 + 30);
    text('Avoid the Obstacles!', width / 2, height / 2 + 70);

    textSize(28);
    fill(200, 200, 0);
    text('Press SPACE or Click to Start', width / 2, height * 2 / 3 + 20);
}

function showGameOverScreen() {
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    fill(255, 50, 50);
    textSize(60);
    text('GAME OVER', width / 2, height / 3);

    fill(255);
    textSize(32);
    text(`Final Score: ${score}`, width / 2, height / 2);

    textSize(24);
    fill(200, 200, 200);
    text('Press SPACE or Click to Restart', width / 2, height * 2 / 3);

    // Draw the final state
    player.show();
    for(let obs of obstacles) {
        obs.show();
    }
}

function showScore() {
    fill(255);
    textSize(28);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 15, 15);
    textAlign(CENTER, CENTER);
}

// --- Input Handling ---

function handleInput() {
    switch (gameState) {
        case 'START':
            startGame();
            break;
        case 'PLAYING':
            player.jump(); // Player class handles double jump logic
            break;
        case 'GAME_OVER':
            resetGame();
            startGame();
            break;
    }
}

function keyPressed() {
    if (key === ' ') {
        handleInput();
        return false; // Prevent default browser behavior (scrolling)
    }
}

function mousePressed() {
    handleInput();
    return false; // Prevent default browser behavior (text selection, etc.)
}


// --- Classes ---

// ========================================
// == Player Class (with Double Jump) ===
// ========================================
class Player {
    constructor() {
        this.w = PLAYER_SIZE;
        this.h = PLAYER_SIZE;
        this.x = 60;
        this.y = height - GROUND_HEIGHT - this.h;
        this.baseY = this.y;

        this.velocity = createVector(0, 0);

        // --- Double Jump Logic Variables ---
        this.jumpsMade = 0;   // Counter for jumps since last touching the ground
        this.maxJumps = 2;    // Max jumps allowed (1 ground + 1 air = double jump)
    }

    applyForce(force) {
        // Used primarily for gravity in this game
        this.velocity.add(force);
    }

    jump() {
        // --- Double Jump Logic ---
        // Check if we haven't exceeded the maximum allowed jumps
        if (this.jumpsMade < this.maxJumps) {
            // Set velocity directly for a consistent jump height feel
            this.velocity.y = JUMP_FORCE;
            this.jumpsMade++; // Increment the jump counter
        }
    }

    update() {
        // Apply vertical velocity to change position
        this.y += this.velocity.y;

        // Check for ground collision
        if (this.y >= this.baseY) {
            this.y = this.baseY;    // Snap precisely to ground level
            this.velocity.y = 0;     // Stop vertical movement when grounded

            // --- Double Jump Logic ---
            this.jumpsMade = 0;      // Reset jump counter upon landing
        }
        // Gravity is applied via player.applyForce(gravity) in runGame() *before* this update() runs.
    }

    show() {
        // Draw the player
        if (playerImg && playerImg.width > 0) { // Check if player image loaded
            imageMode(CENTER);
            image(playerImg, this.x + this.w / 2, this.y + this.h / 2, this.w, this.h);
            imageMode(CORNER); // Reset image mode
        } else {
            // Fallback: Draw a simple pixelated rectangle
             noStroke();
             let pixelSize = 5;
             for (let i = 0; i < this.w; i += pixelSize) {
                 for (let j = 0; j < this.h; j += pixelSize) {
                     // Alternate colors slightly for texture
                    if ((i/pixelSize + j/pixelSize) % 2 === 0) {
                         fill(255, 200, 0); // Lighter yellow
                    } else {
                         fill(240, 180, 0); // Darker yellow/orange
                    }
                     rect(this.x + i, this.y + j, pixelSize, pixelSize);
                 }
             }
        }
         noStroke();
    }

    hits(obstacle) {
        // Simple AABB collision detection
        let playerLeft = this.x;
        let playerRight = this.x + this.w;
        let playerTop = this.y;
        let playerBottom = this.y + this.h;

        let obsLeft = obstacle.x;
        let obsRight = obstacle.x + obstacle.w;
        let obsTop = obstacle.y;
        let obsBottom = obstacle.y + obstacle.h;

        return (
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerBottom > obsTop &&
            playerTop < obsBottom
        );
    }
} // --- End of Player Class ---


// ========================================
// ======== Obstacle Class =============
// ========================================
class Obstacle {
    constructor() {
        this.w = OBSTACLE_WIDTH;
        this.h = random(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT);
        this.x = width;
        this.y = height - GROUND_HEIGHT - this.h;
    }

    update() {
        this.x -= gameSpeed; // Move left based on current game speed
    }

    show() {
        // Draw the obstacle (e.g., a simple medieval rock/fence post)
         noStroke();
         // Main part
         fill(100, 70, 50); // Brownish color
         rect(this.x, this.y, this.w, this.h);
         // Simple shading
         fill(80, 50, 30); // Darker top/bottom shade
         rect(this.x, this.y, this.w, 5); // Top shade
         rect(this.x, this.y + this.h - 5, this.w, 5); // Bottom shade
         noStroke(); // Ensure no stroke leaks
    }

    isOffscreen() {
        return this.x < -this.w;
    }
} // --- End of Obstacle Class ---
