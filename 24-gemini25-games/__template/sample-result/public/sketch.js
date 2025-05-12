// p5.js Endless Runner - Pixel Quest
// --- Game Configuration ---
const PLAYER_SIZE = 40;
const GROUND_HEIGHT = 50;
const GRAVITY_FORCE = 0.6;
const JUMP_FORCE = -12;
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
let playerImg; // Variable for player image
let backgroundImg; // Variable for background image
let bgX = 0; // Background scroll offset

// --- p5.js Functions ---

function preload() {
    // Preload assets here
    // IMPORTANT: Replace these URLs with actual, reliable image sources!
    // These are placeholders and might break. Find pixel art Pokemon-like
    // sprites and medieval backgrounds (ideally seamless/tileable).
    try {
        // Example Player Image (simple pixel character placeholder)
        // You'll likely want a transparent PNG sprite
        // playerImg = loadImage('URL_TO_YOUR_PIXEL_PLAYER_SPRITE.png');

        // Example Background Image (Pixelated Medieval Style)
  //      backgroundImg = loadImage('https://img.freepik.com/free-vector/pixel-art-fantasy-castle-landscape_23-2151154231.jpg');
//        backgroundImg = loadImage('medieval-background.jpg');
        backgroundImg = loadImage('istockphoto-1371387288-640x640.jpg');


        console.log("Assets loading...");
    } catch (e) {
        console.error("Error loading assets:", e);
        // The game will fallback to drawing shapes if images fail to load.
    }
}

function setup() {
    createCanvas(windowWidth > 800 ? 800 : windowWidth, 400); // Responsive width up to 800px
    textFont('monospace'); // Monospaced font looks more "retro"

    // Initialize player
    player = new Player();

    // Set image mode for background if loaded
    if (backgroundImg) {
        imageMode(CORNER);
    }

    noStroke(); // Cleaner look for shapes
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
    player.applyForce(createVector(0, GRAVITY_FORCE));
    player.update();
    player.show();

    // Spawn Obstacles
    spawnTimer++;
    if (spawnTimer > OBSTACLE_SPAWN_RATE) {
       if (random(1) < 0.8) { // Add some randomness to spawning
           obstacles.push(new Obstacle());
       }
       spawnTimer = 0; // Reset timer
    }


    // Update & Show Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].show();

        // Collision Check
        if (player.hits(obstacles[i])) {
            gameOver();
            break; // Exit loop immediately on game over
        }

        // Remove off-screen obstacles & Score
        if (obstacles[i].isOffscreen()) {
            obstacles.splice(i, 1);
            score++;
            // Increase difficulty slightly over time
            gameSpeed += 0.1;
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
    // Optional: Add a sound effect here
    noLoop(); // Stop the game loop to freeze the screen
}

function resetGame() {
    score = 0;
    obstacles = [];
    player = new Player(); // Reset player position and velocity
    bgX = 0; // Reset background position
    gameSpeed = OBSTACLE_BASE_SPEED;
    spawnTimer = 0;
}

// --- Drawing Functions ---

function drawBackground() {
    if (backgroundImg) {
        // Draw scrolling background image
        image(backgroundImg, bgX, 0, width, height);
        // Draw a second copy for seamless looping
        image(backgroundImg, bgX + width, 0, width, height);

        // Scroll background only when playing
        if (gameState === 'PLAYING') {
            bgX -= gameSpeed * BACKGROUND_SCROLL_SPEED_FACTOR;
            // Reset position when the first image scrolls completely off-screen
            if (bgX <= -width) {
                bgX = 0;
            }
        }
    } else {
        // Fallback solid color background
        background(135, 206, 250); // Sky blue
    }

    // Draw Ground
    fill(80, 150, 80); // Greenish ground
    rect(0, height - GROUND_HEIGHT, width, GROUND_HEIGHT);
}

function showStartScreen() {
    fill(0, 0, 0, 150); // Semi-transparent overlay
    rect(0, 0, width, height);

    fill(255); // White text
    textSize(48);
    text('Pixel Runner Quest', width / 2, height / 3);

    textSize(24);
    text('Press SPACEBAR to Jump', width / 2, height / 2);
    text('Avoid the Obstacles!', width / 2, height / 2 + 40);

    textSize(28);
    fill(200, 200, 0); // Yellowish prompt
    text('Press SPACE to Start', width / 2, height * 2 / 3 + 20);
}

function showGameOverScreen() {
    // Keep drawing the background and ground from the main draw loop
    // Add a darker overlay
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);


    fill(255, 50, 50); // Red 'Game Over'
    textSize(60);
    text('GAME OVER', width / 2, height / 3);

    fill(255); // White score
    textSize(32);
    text(`Final Score: ${score}`, width / 2, height / 2);

    textSize(24);
    fill(200, 200, 200); // Lighter gray prompt
    text('Press SPACE to Restart', width / 2, height * 2 / 3);

    // Draw the player and obstacles one last time (since noLoop was called)
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
    textAlign(CENTER, CENTER); // Reset for other text elements if needed
}

// --- Input Handling ---

function keyPressed() {
    // Check if the key pressed is the spacebar
    if (key === ' ') {
        switch (gameState) {
            case 'START':
                startGame();
                break;
            case 'PLAYING':
                player.jump();
                break;
            case 'GAME_OVER':
                resetGame();
                startGame();
                break;
        }
        // Prevent default browser behavior for spacebar (scrolling)
        return false;
    }
}

// Allow mouse click to jump as well (optional, good for mobile testing)
function mousePressed() {
     if (gameState === 'PLAYING') {
        player.jump();
     } else if (gameState === 'START') {
         startGame();
     } else if (gameState === 'GAME_OVER') {
         resetGame();
         startGame();
     }
     // Prevent default browser behavior for mouse click
     return false;
}


// --- Classes ---

class Player {
    constructor() {
        this.w = PLAYER_SIZE;
        this.h = PLAYER_SIZE;
        this.x = 60;
        // Start player on the ground
        this.y = height - GROUND_HEIGHT - this.h;
        this.baseY = this.y; // Ground level reference

        this.velocity = createVector(0, 0);
        this.isJumping = false;
    }

    applyForce(force) {
        this.velocity.add(force);
    }

    jump() {
        // Only allow jumping if the player is on the ground
        if (!this.isJumping) {
            this.applyForce(createVector(0, JUMP_FORCE));
            this.isJumping = true;
             // Optional: Add a jump sound effect here
        }
    }

    update() {
        // Apply velocity
        this.y += this.velocity.y;

        // Apply damping/air resistance (optional)
        // this.velocity.y *= 0.99;

        // Check for ground collision
        if (this.y >= this.baseY) {
            this.y = this.baseY; // Snap to ground
            this.velocity.y = 0;  // Stop vertical movement
            this.isJumping = false; // Can jump again
        }
    }

    show() {
        // Draw the player
        if (playerImg) {
            // Draw the loaded image - adjust x,y if image has whitespace
             imageMode(CENTER); // Draw from center might be easier
             image(playerImg, this.x + this.w / 2, this.y + this.h / 2, this.w, this.h);
             imageMode(CORNER); // Reset if needed elsewhere
        } else {
            // Fallback: Draw a simple pixelated rectangle
            fill(255, 200, 0); // Yellowish placeholder
            // For a more "pixelated" rect look:
            noStroke();
             // Draw multiple small squares to simulate pixels (example)
             let pixelSize = 5;
             for (let i = 0; i < this.w; i += pixelSize) {
                 for (let j = 0; j < this.h; j += pixelSize) {
                    // Alternate colors slightly for texture
                    if ((i/pixelSize + j/pixelSize) % 2 === 0) {
                         fill(255, 200, 0);
                    } else {
                         fill(240, 180, 0);
                    }
                     rect(this.x + i, this.y + j, pixelSize, pixelSize);
                 }
             }
            // Or just a simple rect:
            // fill(255, 200, 0);
            // stroke(50); // Add outline if desired
            // strokeWeight(1);
            // rect(this.x, this.y, this.w, this.h);
        }
         noStroke(); // Ensure no stroke leaks
    }

    hits(obstacle) {
        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        // Using player's position (top-left) and dimensions

        // Player boundaries
        let playerLeft = this.x;
        let playerRight = this.x + this.w;
        let playerTop = this.y;
        let playerBottom = this.y + this.h;

        // Obstacle boundaries
        let obsLeft = obstacle.x;
        let obsRight = obstacle.x + obstacle.w;
        let obsTop = obstacle.y;
        let obsBottom = obstacle.y + obstacle.h; // Ground is bottom

        // Check for overlap
        return (
            playerRight > obsLeft &&    // Player's right edge > obstacle's left edge
            playerLeft < obsRight &&    // Player's left edge < obstacle's right edge
            playerBottom > obsTop &&    // Player's bottom edge > obstacle's top edge
            playerTop < obsBottom       // Player's top edge < obstacle's bottom edge (less critical here)
        );
    }
}

class Obstacle {
    constructor() {
        this.w = OBSTACLE_WIDTH;
        this.h = random(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT); // Random height
        this.x = width; // Start off-screen right
        // Position obstacle on the ground
        this.y = height - GROUND_HEIGHT - this.h;
    }

    update() {
        this.x -= gameSpeed; // Move left based on current game speed
    }

    show() {
        // Draw the obstacle (e.g., a simple medieval rock/fence post)
        fill(100, 70, 50); // Brownish color
        // For a slightly more textured look:
         noStroke();
         rect(this.x, this.y, this.w, this.h); // Main part
         fill(80, 50, 30); // Darker top/bottom shade
         rect(this.x, this.y, this.w, 5); // Top shade
         rect(this.x, this.y + this.h - 5, this.w, 5); // Bottom shade

        // Simple rect alternative:
        // fill(100, 70, 50);
        // stroke(40);
        // strokeWeight(1);
        // rect(this.x, this.y, this.w, this.h);
         noStroke(); // Ensure no stroke leaks
    }

    isOffscreen() {
        // Check if the obstacle has moved completely off the left side
        return this.x < -this.w;
    }
}
