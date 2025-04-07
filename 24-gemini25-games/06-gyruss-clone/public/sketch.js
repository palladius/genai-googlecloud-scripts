// G-RUSS - A Gyruss-inspired p5.js game

// --- Game Configuration ---
const PLAYER_CHAR = 'G';
const PLAYER_SIZE = 30;
const PLAYER_COLOR = [255, 255, 255]; // White
const PLAYER_ROT_SPEED = 0.05; // Radians per frame
const BULLET_SPEED = 7;
const BULLET_SIZE = 6;
const BULLET_COLOR = [255, 255, 0]; // Yellow
const ENEMY_SIZE = 20;
const FAST_ENEMY_SIZE_MULT = 1.2;
const ENEMY_SPAWN_RATE = 60; // Lower is faster (frames)
const ENEMY_BASE_SPEED = 1;
const ENEMY_FAST_SPEED_MULT = 2.5; // How much faster fast enemies are
const ENEMY_ORBIT_SPEED_MAX = 0.02; // Radians per frame (randomized)
const FAST_ENEMY_CHANCE = 0.2; // 1 in 5
const SCORE_NORMAL = 10;
const SCORE_FAST = 30;
const EXPLOSION_DURATION = 25; // Frames
const EXPLOSION_MAX_SIZE = 40;

// Google Colors (Hex for easy use, converted later)
const GOOGLE_COLORS_HEX = ['#DB4437', '#4285F4', '#0F9D58', '#F4B400']; // Red, Blue, Green, Yellow
let googleColorsP5 = []; // To store p5.color objects

// --- Game State Variables ---
let playerAngle = 0;
let playerRadius; // Calculated in setup based on canvas size
let bullets = [];
let enemies = [];
let explosions = [];
let score = 0;
let enemySpawnTimer = 0;
let gameFont; // Optional custom font

// --- p5.js Core Functions ---

// function preload() {
//   // Optional: Load assets like fonts or sounds here
//   // gameFont = loadFont('path/to/your/font.ttf');
// }

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Convert hex colors to p5.color objects
  googleColorsP5 = GOOGLE_COLORS_HEX.map(hex => color(hex));

  // Calculate player's circular path radius
  playerRadius = min(width, height) * 0.4;

  // Set text defaults
  textAlign(CENTER, CENTER);
  // if (gameFont) {
  //   textFont(gameFont);
  // }

  console.log("G-RUSS Initialized! 🚀 Ready to blast some colorful aliens!");
  console.log("Controls: LEFT/RIGHT Arrows to move, SPACE to shoot.");
  console.log("Touch: Tap screen to shoot.");
}

function draw() {
  background(0); // Black space background

  // --- Update Game Objects ---
  handleInput();
  updatePlayer();
  updateBullets();
  spawnEnemies();
  updateEnemies();
  updateExplosions();

  // --- Collision Detection ---
  checkCollisions();

  // --- Draw Game Objects ---
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawExplosions();
  drawUI();
}

// --- Input Handling ---

function handleInput() {
  // Keyboard movement
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left Arrow or A
    playerAngle -= PLAYER_ROT_SPEED;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right Arrow or D
    playerAngle += PLAYER_ROT_SPEED;
  }
   // Keep player angle reasonable (optional, prevents very large numbers)
   // playerAngle = playerAngle % TWO_PI;
}

function keyPressed() {
  if (key === ' ' || keyCode === 32) { // Space bar
    shoot();
  }
  // Prevent default browser action for space
  return false;
}

// mousePressed() automatically handles taps on touch devices
function mousePressed() {
  shoot();
  // Prevent default browser action for touch
  return false;
}

// touchStarted() can also be used explicitly for touch
function touchStarted() {
  shoot();
  // Prevent default browser action for touch
  return false;
}


// --- Update Functions ---

function updatePlayer() {
  // Player position is derived from angle and radius in the draw function
  // Nothing complex needed here for now
}

function shoot() {
  // Calculate player's current cartesian position
  let px = width / 2 + playerRadius * cos(playerAngle);
  let py = height / 2 + playerRadius * sin(playerAngle);

  // Calculate angle from player towards the center of the screen
  let angleToCenter = atan2(height / 2 - py, width / 2 - px);

  // Create a new bullet object
  bullets.push({
    x: px,
    y: py,
    vx: cos(angleToCenter) * BULLET_SPEED,
    vy: sin(angleToCenter) * BULLET_SPEED
  });
  // console.log("Pew! 쏘다! 💥", bullets.length); // Fun log message!
}


function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;

    // Remove bullet if it goes way off screen or near center
    let distSqToCenter = (b.x - width / 2)**2 + (b.y - height / 2)**2;
    if (b.x < -50 || b.x > width + 50 || b.y < -50 || b.y > height + 50 || distSqToCenter < 100) { // 10*10 radius check
      bullets.splice(i, 1);
    }
  }
}

function spawnEnemies() {
  enemySpawnTimer++;
  if (enemySpawnTimer >= ENEMY_SPAWN_RATE) {
    enemySpawnTimer = 0;

    let isFast = random(1) < FAST_ENEMY_CHANCE;
    let startAngle = random(TWO_PI);
    // Start further out than the player's ring
    let startRadius = max(width, height) * 0.6;
    let enemySpeed = isFast ? ENEMY_BASE_SPEED * ENEMY_FAST_SPEED_MULT : ENEMY_BASE_SPEED;
    let enemyOrbitSpeed = random(-ENEMY_ORBIT_SPEED_MAX, ENEMY_ORBIT_SPEED_MAX);

    enemies.push({
      angle: startAngle,
      radius: startRadius,
      color: random(googleColorsP5),
      isFast: isFast,
      speed: enemySpeed,          // Speed towards center
      orbitSpeed: enemyOrbitSpeed // Speed orbiting center
    });
    // console.log(`New enemy! ${isFast ? '🏎️ Fast!' : '🐌 Normal'}`);
  }
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    // Move towards center
    e.radius -= e.speed;
    // Orbit around center
    e.angle += e.orbitSpeed;

    // Remove enemy if it reaches the center (or goes past player maybe?)
    if (e.radius < 0) { // Reached center
      enemies.splice(i, 1);
      // Potential game over logic or penalty here?
      // console.log("Enemy reached center! 😱");
    }
  }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].timer--;
        if (explosions[i].timer <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// --- Collision Detection ---

function checkCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    // Calculate enemy's cartesian position
    let ex = width / 2 + e.radius * cos(e.angle);
    let ey = height / 2 + e.radius * sin(e.angle);
    let enemyCurrentSize = e.isFast ? ENEMY_SIZE * FAST_ENEMY_SIZE_MULT : ENEMY_SIZE;

    for (let j = bullets.length - 1; j >= 0; j--) {
      let b = bullets[j];
      // Simple distance check between bullet center and enemy center
      let distance = dist(b.x, b.y, ex, ey);

      if (distance < (enemyCurrentSize / 2 + BULLET_SIZE / 2)) {
        // --- HIT! ---
        score += e.isFast ? SCORE_FAST : SCORE_NORMAL;
        createExplosion(ex, ey, e.color); // Create explosion at hit location

        // Remove enemy and bullet
        enemies.splice(i, 1);
        bullets.splice(j, 1);

        // console.log(`Hit! Score: ${score} ${e.isFast ? '🤑 (Fast!)' : '💰'}`);

        // Important: Since enemy 'i' is gone, break the inner loop
        // and continue checking the next enemy.
        break;
      }
    }
  }
}

function createExplosion(x, y, p5Color) {
    explosions.push({
        x: x,
        y: y,
        color: p5Color, // Already a p5.color object
        timer: EXPLOSION_DURATION,
        maxTimer: EXPLOSION_DURATION,
        size: EXPLOSION_MAX_SIZE
    });
}


// --- Drawing Functions ---

function drawPlayer() {
  // Calculate position based on current angle and radius
  let px = width / 2 + playerRadius * cos(playerAngle);
  let py = height / 2 + playerRadius * sin(playerAngle);

  push(); // Isolate transformations and styles
  translate(px, py);
  // Rotate the 'G' to point inwards (towards the center)
  // Add PI/2 because default text orientation is horizontal
  rotate(playerAngle + HALF_PI);

  fill(PLAYER_COLOR);
  noStroke();
  textSize(PLAYER_SIZE);
  text(PLAYER_CHAR, 0, 0); // Draw 'G' at the translated origin
  pop(); // Restore previous drawing state
}

function drawEnemies() {
  for (let e of enemies) {
    // Calculate position based on current angle and radius
    let ex = width / 2 + e.radius * cos(e.angle);
    let ey = height / 2 + e.radius * sin(e.angle);
    let enemyCurrentSize = e.isFast ? ENEMY_SIZE * FAST_ENEMY_SIZE_MULT : ENEMY_SIZE;

    push();
    translate(ex, ey);
    // Optional: Rotate enemies to face center or along movement path
    // rotate(e.angle + HALF_PI); // Point inwards like player
    fill(e.color); // Use the stored p5.color object
    noStroke();
    ellipse(0, 0, enemyCurrentSize, enemyCurrentSize); // Draw as circle

    // Add visual flair for fast enemies
    if (e.isFast) {
        stroke(255, 255, 255, 150); // White outline, slightly transparent
        strokeWeight(2);
        noFill();
        ellipse(0, 0, enemyCurrentSize * 1.2, enemyCurrentSize * 1.2); // Outer ring
    }
    pop();
  }
}

function drawBullets() {
  fill(BULLET_COLOR);
  noStroke();
  for (let b of bullets) {
    ellipse(b.x, b.y, BULLET_SIZE, BULLET_SIZE);
  }
}

function drawExplosions() {
    for (let exp of explosions) {
        push();
        translate(exp.x, exp.y);
        let progress = (exp.maxTimer - exp.timer) / exp.maxTimer; // 0 to 1
        let currentSize = lerp(5, exp.size, progress); // Grow
        let alpha = map(exp.timer, exp.maxTimer, 0, 255, 0); // Fade out

        // Get the base color and set the calculated alpha
        let explosionColor = exp.color;
        explosionColor.setAlpha(alpha);

        fill(explosionColor);
        noStroke();
        ellipse(0, 0, currentSize, currentSize);
        pop();
    }
}

function drawUI() {
  fill(255); // White text
  textSize(24);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 20, 20);

  // Optional: Add game over text, instructions, etc.
}

// --- Utility Functions ---

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalculate player radius based on new dimensions
  playerRadius = min(width, height) * 0.4;
  console.log("Resized canvas!");
}
