// --- Game Configuration ---
let canvasWidth = 800;
let canvasHeight = 400;
let groundLevel;
let gravity = 0.6;
let jumpForce = -12;
let initialGameSpeed = 5;
let speedIncreaseFactor = 0.001; // How quickly the game speeds up

// --- Game State ---
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let gameSpeed;

// --- Player (Dragon) ---
let player;
let playerWidth = 50;
let playerHeight = 40;
let playerSprite; // To hold the pixel art drawing function

// --- Obstacles ---
let obstacles = [];
let obstacleWidth = 40;
let minObstacleHeight = 50;
let maxObstacleHeight = 150;
let obstacleGap = 150; // Vertical gap for the player
let obstacleSpawnRate = 90; // Lower number = more frequent obstacles (frames)
let obstacleTypes = ['bottom', 'top', 'floating'];

// --- Background ---
let bgScrollSpeedFactor = 0.3; // How fast the background scrolls relative to gameSpeed
let bgX1 = 0;
let bgX2; // Will be set to canvasWidth in setup

// --- Assets (Pixel Art Functions) ---

// Function to draw the pixelated dragon
function drawPixelDragon(x, y, w, h) {
  push();
  translate(x, y);
  noStroke();

  // Basic Red Dragon Shape
  fill(180, 0, 0); // Dark Red Body
  rect(w * 0.1, h * 0.2, w * 0.8, h * 0.6); // Main Body
  rect(w * 0.6, h * 0.1, w * 0.3, h * 0.3); // Head area
  rect(w * 0.0, h * 0.4, w * 0.3, h * 0.4); // Tail base

  fill(255, 50, 50); // Lighter Red Highlights/Details
  rect(w * 0.2, h * 0.3, w * 0.6, h * 0.2); // Belly stripe
  rect(w * 0.7, h * 0.15, w * 0.1, h * 0.1); // Eye spot placeholder

  // Simple Wing (Flap position based slightly on vertical velocity)
  fill(150, 0, 0);
  let wingOffset = map(constrain(player.velocity, -5, 5), -5, 5, -h * 0.2, h * 0.2);
  rect(w * 0.3, h * 0.1 + wingOffset, w * 0.4, h * 0.2); // Upper wing part
  rect(w * 0.4, h * 0.0 + wingOffset, w * 0.2, h * 0.4); // Wing joint

  pop();
}

// Function to draw a pixelated stone block (for obstacles)
function drawPixelStone(x, y, w, h) {
  push();
  translate(x, y);
  noStroke();
  fill(100); // Base gray
  rect(0, 0, w, h);

  // Cracks / Details
  fill(80);
  for (let i = 0; i < 5; i++) {
      let crackX = random(w * 0.1, w * 0.9);
      let crackY = random(h * 0.1, h * 0.9);
      let crackW = random(w * 0.05, w * 0.15);
      let crackH = random(h * 0.05, h * 0.15);
      rect(crackX, crackY, crackW, crackH);
  }
  // Darker edges
  fill(60);
  rect(0,0,w, h*0.1);
  rect(0,h*0.9,w, h*0.1);
  rect(0,0,w*0.1, h);
  rect(w*0.9,0,w*0.1, h);
  pop();
}

// Function to draw the dungeon background pattern
function drawDungeonBackground(offsetX) {
    push();
    translate(offsetX, 0);
    background(40, 35, 35); // Dark background color

    // Draw repeating stone bricks
    let brickWidth = 80;
    let brickHeight = 40;
    fill(70, 60, 60); // Brick color
    stroke(50, 45, 45); // Mortar color
    strokeWeight(2);

    for (let y = 0; y < canvasHeight; y += brickHeight) {
        for (let x = -brickWidth; x < canvasWidth * 2; x += brickWidth) { // Draw wider than needed for scroll
            let xOffset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            rect(x + xOffset, y, brickWidth, brickHeight);
        }
    }
    pop();
}

// --- p5.js Functions ---

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  noSmooth(); // Crucial for pixelated look!
  rectMode(CORNER); // Use corner mode for easier positioning

  groundLevel = canvasHeight - 50; // Leave some space at the bottom
  bgX2 = width;

  player = {
    x: width * 0.2,
    y: height / 2,
    velocity: 0,
    width: playerWidth,
    height: playerHeight,

    update: function() {
      this.velocity += gravity;
      this.y += this.velocity;

      // Prevent falling through the ground
      if (this.y + this.height > groundLevel) {
        this.y = groundLevel - this.height;
        this.velocity = 0;
      }
      // Prevent going above the screen
       if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
      }
    },

    jump: function() {
       // Allow jumping only if near the ground (or maybe slightly above)
       // Remove this condition if you want infinite air jumps
      // if (this.y + this.height >= groundLevel - 5) {
         this.velocity = jumpForce;
      // }
    },

    draw: function() {
      drawPixelDragon(this.x, this.y, this.width, this.height);
    },

    // Collision check (Axis-Aligned Bounding Box)
    collidesWith: function(obstacle) {
      let playerLeft = this.x;
      let playerRight = this.x + this.width;
      let playerTop = this.y;
      let playerBottom = this.y + this.height;

      let obsLeft = obstacle.x;
      let obsRight = obstacle.x + obstacle.width;
      let obsTop = obstacle.y;
      let obsBottom = obstacle.y + obstacle.height;

      // Check for non-collision first (easier)
      if (playerRight < obsLeft ||
          playerLeft > obsRight ||
          playerBottom < obsTop ||
          playerTop > obsBottom) {
        return false; // No collision
      } else {
        return true; // Collision detected
      }
    }
  };

  playerSprite = drawPixelDragon; // Assign the drawing function
  resetGame();
}

function draw() {
  // --- Background Scrolling ---
  let currentBgScrollSpeed = gameSpeed * bgScrollSpeedFactor;
  drawDungeonBackground(bgX1);
  drawDungeonBackground(bgX2);
  if (gameState === 'playing') {
      bgX1 -= currentBgScrollSpeed;
      bgX2 -= currentBgScrollSpeed;

      if (bgX1 <= -width) {
          bgX1 = width;
      }
      if (bgX2 <= -width) {
          bgX2 = width;
      }
  }


  // --- Draw Ground ---
  fill(60, 50, 50); // Dark stone color for the ground
  noStroke();
  rect(0, groundLevel, width, height - groundLevel);


  // --- Game State Logic ---
  if (gameState === 'start') {
    displayStartScreen();
  } else if (gameState === 'playing') {
    updateAndDrawGame();
  } else if (gameState === 'gameOver') {
    updateAndDrawGame(); // Draw the last frame
    displayGameOverScreen();
  }

  // --- Always Draw Instructions ---
  displayInstructions();

}

function keyPressed() {
  if (key === ' ' || keyCode === 32) { // Space bar
    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'playing') {
      player.jump();
    } else if (gameState === 'gameOver') {
      resetGame();
      gameState = 'start';
    }
  }
}

// --- Game Logic Functions ---

function resetGame() {
  score = 0;
  gameSpeed = initialGameSpeed;
  obstacles = [];
  player.y = height / 2;
  player.velocity = 0;
  bgX1 = 0;
  bgX2 = width;
}

function startGame() {
    resetGame(); // Ensure clean start
    gameState = 'playing';
}


function updateAndDrawGame() {
  // --- Update Player ---
  player.update();

  // --- Update Obstacles ---
  // Spawn new obstacles periodically
  if (frameCount % obstacleSpawnRate === 0) {
    spawnObstacle();
  }

  // Move and draw existing obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;
    obstacles[i].draw();

    // Check for collision
    if (player.collidesWith(obstacles[i])) {
      gameState = 'gameOver';
      // Optional: Add a sound effect or visual cue here
    }

    // Remove obstacles that are off-screen
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      score++; // Increment score when an obstacle is passed
    }
  }

    // --- Draw Player ---
  player.draw();


  // --- Increase Difficulty ---
  gameSpeed += speedIncreaseFactor;
  // Optional: decrease obstacleSpawnRate over time too
  // obstacleSpawnRate = max(30, 90 - floor(score / 5)); // Example: gets faster spawn up to a limit

  // --- Draw Score ---
  displayScore();
}

function spawnObstacle() {
  let obstacleHeight = random(minObstacleHeight, maxObstacleHeight);
  let type = random(obstacleTypes);
  let newObstacle = {
      x: width,
      y: 0, // Default y
      width: obstacleWidth,
      height: obstacleHeight,
      draw: function() {
          drawPixelStone(this.x, this.y, this.width, this.height);
      }
  };

  if (type === 'bottom') {
      newObstacle.y = groundLevel - obstacleHeight;
  } else if (type === 'top') {
      newObstacle.y = 0;
  } else { // 'floating'
      // Ensure floating obstacles aren't too close to top/bottom initially
      let minY = obstacleGap / 2;
      let maxY = groundLevel - obstacleGap / 2 - obstacleHeight;
      newObstacle.y = random(minY, maxY);
  }


  // --- Simplified Gap Logic: ---
  // If the last obstacle was tall and low, maybe force the next one high?
  // Or, more simply, just ensure *some* gap exists relative to the ground/ceiling.

  // Basic check: don't always spawn floor/ceiling obstacles right after each other
  if (obstacles.length > 0) {
      let lastObstacle = obstacles[obstacles.length - 1];
      // Crude logic to prevent impossible immediate sequences
      if (type === 'bottom' && lastObstacle.y + lastObstacle.height > groundLevel - 5) {
         type = random(['top', 'floating']); // Change if last was also bottom
         if (type === 'top') newObstacle.y = 0;
         else {
            let minY = obstacleGap / 2;
            let maxY = groundLevel - obstacleGap / 2 - newObstacle.height;
            newObstacle.y = random(minY, maxY);
         }
      } else if (type === 'top' && lastObstacle.y === 0){
          type = random(['bottom', 'floating']); // Change if last was also top
          if (type === 'bottom') newObstacle.y = groundLevel - newObstacle.height;
          else {
            let minY = obstacleGap / 2;
            let maxY = groundLevel - obstacleGap / 2 - newObstacle.height;
            newObstacle.y = random(minY, maxY);
         }
      }
  }

  obstacles.push(newObstacle);
}


// --- Display Functions ---

function displayScore() {
  fill(255);
  textSize(24);
  textAlign(RIGHT, TOP);
  textFont('monospace'); // Monospaced font looks good with pixel style
  text("Score: " + score, width - 20, 20);
}

function displayInstructions() {
    fill(255, 255, 255, 200); // White text with some transparency
    textSize(16);
    textAlign(CENTER, TOP);
    textFont('monospace');
    let instructionText = "";
    if (gameState === 'start') {
        instructionText = "Press [SPACE] to Start";
    } else if (gameState === 'playing') {
        instructionText = "[SPACE] = Jump";
    } else if (gameState === 'gameOver') {
        instructionText = "Press [SPACE] to Restart";
    }
    text(instructionText, width / 2, 20);
}

function displayStartScreen() {
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  text("DRAGON RUNNER", width / 2, height / 2 - 40);
  // Instructions are handled by displayInstructions()
}

function displayGameOverScreen() {
  fill(255, 0, 0, 200); // Semi-transparent red overlay
  rect(0, 0, width, height);

  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  text("GAME OVER", width / 2, height / 2 - 40);

  textSize(24);
  text("Final Score: " + score, width / 2, height / 2 + 20);

   // Instructions are handled by displayInstructions()
}
