// --- Global Variables & Constants ---
let player;
let bullets = [];
let enemies = [];
let stars = [];

let score = 0;
let lives = 3;
let gameState = 'start'; // 'start', 'playing', 'gameOver'

const playerRadius = 15;
const playerOrbitRadius = 200; // How far the player orbits from the center
const playerSpeed = 0.05; // Radians per frame
const bulletSpeed = 8;
const enemySpawnRate = 60; // Lower number = more frequent spawns (frames)
const maxEnemies = 15;

// Google Colors ❤️💙💛💚 (Let's add white for the player explicitly)
const googleColors = [
  [219, 68, 55], // Red
  [66, 133, 244], // Blue
  [244, 180, 0], // Yellow
  [15, 157, 88] // Green
];
const playerColor = [255, 255, 255]; // White

// --- p5.js Core Functions ---

function setup() {
  createCanvas(windowWidth, windowHeight); // Use window size
  angleMode(RADIANS);
  textAlign(CENTER, CENTER);
  textSize(20);
  noStroke(); // Looks cleaner for this style

  // Initialize player at the bottom center of the orbit
  player = new Player(PI + HALF_PI, playerOrbitRadius);

  // Create a simple starfield
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(width) // Depth for parallax
    });
  }
}

function draw() {
  background(0, 0, 20); // Dark space blue

  // Center coordinate system for the 3D effect
  translate(width / 2, height / 2);

  drawStarfield(); // Draw stars first

  // --- Game State Machine ---
  switch (gameState) {
    case 'start':
      displayStartScreen();
      break;
    case 'playing':
      runGame();
      break;
    case 'gameOver':
      displayGameOverScreen();
      break;
  }
}

// --- Game Logic Functions ---

function runGame() {
  // --- Spawning ---
  if (frameCount % enemySpawnRate === 0 && enemies.length < maxEnemies) {
    spawnEnemy();
  }

  // --- Updates & Display ---
  player.update();
  player.display();

  // Update and display bullets
  // Loop backwards to allow removing items safely
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();
    if (bullets[i].isOffScreen()) {
      bullets.splice(i, 1); // Remove if it went too far
    }
  }

  // Update and display enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].display();

    // Check if enemy reached player's orbit (collision)
    if (enemies[i].z <= playerOrbitRadius + enemies[i].size / 2) {
      // Simple angle check for collision with player
      let angleDiff = abs(player.angle - enemies[i].angle);
      // Normalize angle difference (handle wrap around 2*PI)
      angleDiff = min(angleDiff, TWO_PI - angleDiff);

      if (angleDiff < (playerRadius + enemies[i].size) / playerOrbitRadius) { // Approximate collision check
         console.log("Player Hit! 😱");
         lives--;
         enemies.splice(i, 1); // Remove enemy
         if (lives <= 0) {
            gameState = 'gameOver';
         }
         // Add visual feedback? Screen shake? Sound? (Future ideas!)
         continue; // Skip bullet collision check for this frame
      }
       // If enemy passed player plane without hitting
       else if (enemies[i].z < playerOrbitRadius - enemies[i].size) {
            console.log("Enemy slipped past! 😨");
            enemies.splice(i,1); // Remove enemy that got past
            // Maybe lose a life here too? Or just points? Let's just remove for now.
       }
    }
  }

  // --- Collision Detection (Bullets vs Enemies) ---
  checkCollisions();

  // --- UI ---
  displayHUD(); // Score and Lives

  // --- Check Game Over Condition ---
   if (lives <= 0) {
     gameState = 'gameOver';
   }
}

function drawStarfield() {
  push(); // Isolate star drawing transformations
  fill(255);
  noStroke();
  for (let star of stars) {
    let sx = map(star.x / star.z, 0, 1, 0, width);
    let sy = map(star.y / star.z, 0, 1, 0, height);
    let r = map(star.z, 0, width, 6, 0); // Stars closer to center appear smaller
    ellipse(sx, sy, r, r);

    // Move stars "towards" the viewer slightly for parallax
    star.z -= 1; // Adjust speed as needed
    if (star.z < 1) {
      // Reset star when it gets too close/behind
      star.x = random(-width, width);
      star.y = random(-height, height);
      star.z = random(width * 0.5, width); // Reset further back
    }
  }
  pop();
}


function spawnEnemy() {
  console.log("Spawning Enemy! 👾");
  const enemyAngle = random(TWO_PI); // Random angle
  const enemyDepth = width * 0.8; // Start far away (adjust based on canvas width)
  const enemySpeed = random(1, 3); // Varying speeds
  const enemyColor = random(googleColors);
  enemies.push(new Enemy(enemyAngle, enemyDepth, enemySpeed, enemyColor));
}

function checkCollisions() {
  // Loop through enemies and bullets to check for hits
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      // Calculate distance in the 'plane' where the enemy currently is
      // This requires projecting bullet position onto the enemy's depth plane

      // Simple approximation: Check when bullet Z matches enemy Z
      // A more accurate way involves projecting, but let's keep it simpler.
      // We know bullets travel 'inwards' (decreasing Z).
      // Let's check distance when bullet is *near* the enemy's depth.

      let enemy = enemies[i];
      let bullet = bullets[j];

      // Calculate the bullet's projected (x, y) at the enemy's depth (z)
      // Assuming bullet starts at player orbit radius and goes towards center (0,0)
      // This isn't perfectly accurate as bullets start from player X,Y,
      // but it's a decent approximation for this style.
      let bulletDistTravelled = bullet.startZ - bullet.z;
      let totalDistToCenter = bullet.startZ;
      let travelRatio = bulletDistTravelled / totalDistToCenter;

      let bulletProjX = bullet.startX * (1 - travelRatio);
      let bulletProjY = bullet.startY * (1 - travelRatio);

       // Calculate the enemy's current X, Y in the world space
       let enemyX = cos(enemy.angle) * enemy.z;
       let enemyY = sin(enemy.angle) * enemy.z;


      // Check distance between projected bullet and enemy's current position
      // Only check if bullet Z is close to enemy Z
      if (abs(bullet.z - enemy.z) < bulletSpeed + enemy.speed) { // Check if Z positions are close
          let d = dist(bulletProjX, bulletProjY, enemyX, enemyY);

          if (d < enemy.size / 2 + 2) { // Collision! (2 is bullet radius approx)
            console.log("Hit! 💥 Score:", score);
            score += 10; // Add score
            enemies.splice(i, 1); // Remove enemy
            bullets.splice(j, 1); // Remove bullet
            break; // Stop checking this enemy against other bullets
          }
      }
    }
  }
}


// --- UI Display Functions ---

function displayHUD() {
  push(); // Isolate HUD drawing
  resetMatrix(); // Use standard 2D coordinates for HUD
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
  text(`Lives: ${lives}`, width - 100, 20);
  pop();
}

function displayStartScreen() {
  push();
  fill(255);
  textSize(48);
  text("p5.Gyruss Clone", 0, -50);
  textSize(24);
  text("Use ARROW KEYS to move", 0, 20);
  text("SPACEBAR or TAP screen to shoot", 0, 50);
  textSize(20);
  text("Click or Press SPACE to Start", 0, 100);
  pop();
}

function displayGameOverScreen() {
  push();
  background(0, 0, 20, 150); // Semi-transparent overlay
  fill(219, 68, 55); // Red for Game Over
  textSize(60);
  text("GAME OVER", 0, -50);
  fill(255);
  textSize(32);
  text(`Final Score: ${score}`, 0, 20);
  textSize(20);
  text("Click or Press SPACE to Restart", 0, 80);
  pop();
}

// --- Input Handling ---

let moveLeft = false;
let moveRight = false;

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    moveLeft = true;
  } else if (keyCode === RIGHT_ARROW) {
    moveRight = true;
  } else if (key === ' ') { // Use key for spacebar
     handleShoot();
     if (gameState === 'start' || gameState === 'gameOver') {
         restartGame();
     }
  }
  return false; // Prevent default browser behavior
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) {
    moveLeft = false;
  } else if (keyCode === RIGHT_ARROW) {
    moveRight = false;
  }
  return false; // Prevent default browser behavior
}

// Handle both mouse clicks and touch taps
function mousePressed() {
  handleShoot();
   if (gameState === 'start' || gameState === 'gameOver') {
       restartGame();
   }
   return false; // Prevent default browser behavior
}

// touchStarted is the equivalent for touch devices
function touchStarted() {
    handleShoot();
    if (gameState === 'start' || gameState === 'gameOver') {
        restartGame();
    }
    return false; // Prevent default browser behavior
}


function handleShoot() {
    if (gameState === 'playing') {
        player.shoot();
    }
}

function restartGame() {
    console.log("Restarting game... ✨");
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    player.angle = PI + HALF_PI; // Reset player position
    gameState = 'playing';
}


// --- Classes ---

class Player {
  constructor(startAngle, orbitRadius) {
    this.angle = startAngle;
    this.orbitRadius = orbitRadius;
    this.speed = playerSpeed;
    this.radius = playerRadius;
    this.color = playerColor;
    // Store current x, y for shooting direction and display
    this.x = cos(this.angle) * this.orbitRadius;
    this.y = sin(this.angle) * this.orbitRadius;
  }

  update() {
    // Handle movement based on flags
    if (moveLeft) {
      this.angle -= this.speed;
    }
    if (moveRight) {
      this.angle += this.speed;
    }
    // Keep angle within 0 to TWO_PI
    this.angle = (this.angle + TWO_PI) % TWO_PI;

    // Update position based on angle
    this.x = cos(this.angle) * this.orbitRadius;
    this.y = sin(this.angle) * this.orbitRadius;
  }

  display() {
    push(); // Isolate player drawing
    fill(this.color);
    // Draw player as a triangle pointing inwards
    translate(this.x, this.y); // Move to player's orbit position
    rotate(this.angle + HALF_PI); // Point triangle towards center
    triangle(
      0, -this.radius,      // Top point
      -this.radius / 1.5, this.radius / 2, // Bottom left
      this.radius / 1.5, this.radius / 2   // Bottom right
    );
    pop();
  }

  shoot() {
     console.log("Shoot! Pew pew!🔫");
     // Bullet starts at player's current location (x, y) at the player's orbit depth (z)
     bullets.push(new Bullet(this.x, this.y, this.orbitRadius));
  }
}

class Bullet {
  constructor(startX, startY, startZ) {
     // Initial position in 3D space (relative to center)
    this.x = startX;
    this.y = startY;
    this.z = startZ; // Start at player's depth

    // Store start for calculations
    this.startX = startX;
    this.startY = startY;
    this.startZ = startZ;

    this.speed = bulletSpeed;
    this.color = [255, 255, 0]; // Yellow bullets
    this.size = 4;
  }

  update() {
     // Move "inwards" towards the vanishing point (center) by decreasing Z
     this.z -= this.speed;

     // Update apparent X, Y based on Z depth (perspective)
     // This assumes the bullet travels straight towards (0,0,0) from its start point
     let travelRatio = this.z / this.startZ; // How much closer to center (Z=0)
     if (this.startZ > 0 && this.z > 0) { // Avoid division by zero / weirdness past center
         this.x = this.startX * travelRatio;
         this.y = this.startY * travelRatio;
     } else {
         // If it reaches or passes center, keep it moving logically 'inwards'
         // For simplicity, just let it continue based on speed; it will be removed if off-screen
         // A more complex projection might be needed for perfect accuracy past center.
         this.x *= (1 - this.speed/this.z); // This isn't quite right, but approximates continued travel
         this.y *= (1 - this.speed/this.z);
     }
  }

  display() {
    push();
    fill(this.color);
    // Scale bullet size based on depth - smaller when further away
    let displayRadius = map(this.z, 0, this.startZ, 1, this.size, true); // Clamp size
    ellipse(this.x, this.y, displayRadius * 2, displayRadius * 2);
    pop();
  }

  isOffScreen() {
    // Remove bullet if it goes too far 'into' the screen (low z)
    return this.z < 0;
  }
}

class Enemy {
  constructor(startAngle, startZ, speed, color) {
    this.angle = startAngle;
    this.z = startZ; // Depth - higher value is further away
    this.speed = speed; // Speed moving towards the player plane (decreasing Z)
    this.color = color;
    this.initialZ = startZ; // Remember starting depth for scaling

    // Calculate initial X, Y based on angle and depth
    this.x = cos(this.angle) * this.z;
    this.y = sin(this.angle) * this.z;

    // Size scales with distance - larger when closer
    this.baseSize = 25; // Base size when at player plane (z=playerOrbitRadius)
    this.size = this.calculateSize();
  }

  calculateSize() {
      // Calculate size based on depth. Let's make them appear larger as Z decreases.
      // Map Z from initial depth down to player orbit radius to a size range.
      // Use a non-linear mapping (like pow) for better perspective effect.
      let closenessFactor = pow(playerOrbitRadius / this.z, 0.8); // Power makes closer objects scale up faster
      return this.baseSize * closenessFactor;

      // Simpler linear mapping (less dramatic perspective):
      // return map(this.z, playerOrbitRadius, this.initialZ, this.baseSize, 5, true); // Map z to size (closer=bigger)
  }

  update() {
    // Move towards the player (decrease Z)
    this.z -= this.speed;

    // Optional: Add some sideways or circular motion here later for variety

    // Recalculate apparent X, Y based on new Z and original angle
    this.x = cos(this.angle) * this.z;
    this.y = sin(this.angle) * this.z;

    // Update size based on new depth
    this.size = this.calculateSize();
  }

  display() {
    push();
    fill(this.color);
    // Simple ellipse for enemies for now
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }
}

// Adjust canvas size if window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
   // Could potentially recalculate star positions or enemy depths here if needed
}
