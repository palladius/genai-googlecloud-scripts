// --- Game Configuration ---
let canvasWidth = 800;
let canvasHeight = 400;
let groundLevel;
let gravity = 0.6;
let jumpForce = -11;
let initialGameSpeed = 5;
let speedIncreaseFactor = 0.001;
let fireballSpeed = 8;
let pointsPerKill = 5;
let maxJumps = 2; // For double jump

// --- Game State ---
let gameState = 'characterSelect'; // 'characterSelect', 'playing', 'gameOver'
let score = 0;
let gameSpeed;

// --- Player ---
let player;
let playerWidth = 50; // Base width, will be updated
let playerHeight = 40; // Base height, will be updated
let selectedCharacterIndex = 0;
let jumpsRemaining;

// --- Characters ---
let characters = [
    { name: "Ale", drawFunc: drawDragon, width: 55, height: 40 },
    { name: "Seby", drawFunc: drawGiraffe, width: 40, height: 65 },
    { name: "Papino", drawFunc: drawPuffin, width: 45, height: 35 },
    { name: "Waffle", drawFunc: drawWaffle, width: 40, height: 40 },
    { name: "Silvana", drawFunc: drawDog, width: 40, height: 30 } // Added Silvana
];

// --- Obstacles ---
let obstacles = [];
let obstacleWidth = 40;
let minObstacleHeight = 50;
let maxObstacleHeight = 150;
let obstacleSpawnRate = 90;
let obstacleTypes = ['bottom', 'top', 'floating'];

// --- Fireballs & Effects ---
let fireballs = [];
let explosions = [];

// --- Background ---
let bgScrollSpeedFactor = 0.3;
let bgX1 = 0;
let bgX2;

// --- Touch Control Helpers ---
let startButtonArea = { x: 0, y: 0, w: 0, h: 0 }; // Clickable start area
let characterPreviewAreas = []; // Clickable areas for character previews

// --- Asset Drawing Functions (Less Pixelated) ---

function drawDragon(x, y, w, h, velocity) {
    push();
    translate(x, y);
    noStroke();
    fill(200, 0, 0); // Darker Red Body
    ellipse(w / 2, h * 0.6, w * 0.9, h * 0.7);
    fill(220, 50, 50); // Lighter Red Head
    ellipse(w * 0.8, h * 0.35, w * 0.45, h * 0.4);
    fill(255, 255, 100); // Yellow eye
    ellipse(w * 0.85, h * 0.3, w * 0.1, h * 0.15);
    fill(0); // Pupil
    ellipse(w * 0.87, h * 0.3, w * 0.05, h * 0.08);
    fill(150, 0, 0); // Wing
    let wingAngle = map(constrain(velocity, -5, 5), -5, 5, -PI / 6, PI / 6);
    translate(w * 0.4, h * 0.4);
    rotate(wingAngle);
    beginShape();
    vertex(0, 0); vertex(w * 0.4, -h * 0.5); vertex(w * 0.5, h * 0.1); vertex(w * 0.1, h * 0.2);
    endShape(CLOSE);
    pop();
}

function drawGiraffe(x, y, w, h, velocity) {
    push();
    translate(x, y);
    noStroke();
    fill(240, 200, 80); // Yellowish Body
    ellipse(w / 2, h * 0.75, w, h * 0.4);
    fill(180, 140, 60); // Legs
    rect(w * 0.3, h * 0.8, w * 0.15, h * 0.2); rect(w * 0.55, h * 0.8, w * 0.15, h * 0.2);
    rect(w * 0.4, h * 0.1, w * 0.2, h * 0.7); // Neck
    fill(240, 200, 80); // Head
    ellipse(w * 0.5, h * 0.15, w * 0.5, h * 0.25);
    fill(150, 100, 40); // Brown spots
    ellipse(w * 0.4, h * 0.7, w * 0.2, w * 0.2); ellipse(w * 0.6, h * 0.8, w * 0.25, w * 0.2); ellipse(w * 0.5, h * 0.4, w * 0.1, w * 0.2);
    fill(0); // Eye
    ellipse(w * 0.6, h * 0.1, w * 0.1, w * 0.1);
    pop();
}

function drawPuffin(x, y, w, h, velocity) {
    push();
    translate(x, y);
    noStroke();
    fill(255); // White belly
    ellipse(w / 2, h * 0.6, w * 0.9, h * 0.7);
    fill(0); // Black back/head
    arc(w / 2, h * 0.6, w * 0.9, h * 0.7, PI, TWO_PI);
    ellipse(w * 0.7, h * 0.4, w * 0.4, h * 0.4);
    fill(255, 100, 0); // Orange Beak
    triangle(w * 0.85, h * 0.3, w * 0.85, h * 0.5, w * 1.1, h * 0.4);
    fill(200, 200, 200); // Greyish Beak Part
    rect(w * 0.8, h * 0.3, w*0.05, h*0.2);
    fill(0); // Eye
    ellipse(w * 0.75, h * 0.35, w * 0.1, w * 0.1);
    fill(50); // Wing
    let wingAngle = map(constrain(velocity, -5, 5), -5, 5, -PI / 8, PI / 8);
    translate(w * 0.45, h * 0.55);
    rotate(wingAngle);
    ellipse(0, 0, w * 0.5, h * 0.2);
    pop();
}

function drawWaffle(x, y, w, h, velocity) {
    push();
    translate(x, y);
    fill(210, 180, 140); // Waffle color
    stroke(180, 150, 110); // Grid lines
    strokeWeight(1);
    rect(0, 0, w, h, 3);
    let lines = 4;
    for (let i = 1; i < lines; i++) {
        line(0, (h / lines) * i, w, (h / lines) * i);
        line((w / lines) * i, 0, (w / lines) * i, h);
    }
    noStroke();
    fill(50); // Eyes
    ellipse(w*0.3, h*0.3, w*0.15, w*0.15);
    ellipse(w*0.7, h*0.3, w*0.15, w*0.15);
    pop();
}

// New function for Silvana (the dog)
function drawDog(x, y, w, h, velocity) {
    push();
    translate(x, y);
    noStroke();

    // Body
    fill(160, 82, 45); // Brown color
    ellipse(w / 2, h * 0.6, w * 0.8, h * 0.6);

    // Head
    fill(160, 82, 45);
    ellipse(w * 0.3, h * 0.3, w * 0.5, h * 0.5);

    // Ears
    fill(160, 82, 45);
    ellipse(w * 0.1, h * 0.1, w * 0.2, h * 0.3); // Left ear
    ellipse(w * 0.5, h * 0.1, w * 0.2, h * 0.3); // Right ear

    // Snout
    fill(100, 50, 20); // Darker brown
    ellipse(w * 0.1, h * 0.45, w * 0.3, h * 0.2);

    // Nose
    fill(0);
    ellipse(w * 0.05, h * 0.45, w * 0.1, h * 0.1);

    // Eyes
    fill(0);
    ellipse(w * 0.3, h * 0.25, w * 0.1, h * 0.1);

    // Tail
    fill(160, 82, 45);
    let tailAngle = map(constrain(velocity, -5, 5), -5, 5, -PI / 4, PI / 4);
    translate(w * 0.6, h * 0.6);
    rotate(tailAngle);
    ellipse(w * 0.2, 0, w * 0.3, h * 0.2);

    pop();
}

function drawStoneObstacle(x, y, w, h) {
  push();
  translate(x, y);
  fill(100); stroke(60); strokeWeight(2);
  rect(0, 0, w, h, 5);
  noStroke(); fill(80);
  for (let i = 0; i < 3; i++) {
      let crackX = random(w * 0.1, w * 0.9); let crackY = random(h * 0.1, h * 0.9);
      let crackW = random(w * 0.1, w * 0.3); let crackH = random(2, 4);
      beginShape();
      vertex(crackX, crackY); vertex(crackX + crackW * 0.3, crackY + crackH * 0.5);
      vertex(crackX + crackW, crackY + crackH); vertex(crackX + crackW * 0.7, crackY - crackH * 0.5);
      endShape(CLOSE);
  }
  pop();
}

function drawDungeonBackground(offsetX) {
    push();
    translate(offsetX, 0);
    background(40, 35, 35);
    let brickWidth = 80; let brickHeight = 40;
    stroke(50, 45, 45); strokeWeight(2);
    for (let y = -brickHeight; y < canvasHeight; y += brickHeight) {
        for (let x = -brickWidth; x < canvasWidth * 2; x += brickWidth) {
            let xOffset = (floor(y / brickHeight)) % 2 === 0 ? 0 : brickWidth / 2;
            fill(random(65, 75), random(55, 65), random(55, 65));
            rect(x + xOffset, y, brickWidth, brickHeight, 3);
        }
    }
    pop();
}

function drawFireball(x, y, size) {
    push();
    translate(x, y);
    noStroke();
    for (let i = size; i > 0; i -= 2) {
        let inter = map(i, 0, size, 0, 1);
        let c = lerpColor(color(255, 50, 0, 200), color(255, 200, 0, 150), inter);
        fill(c);
        ellipse(0, 0, i, i);
    }
    pop();
}

function drawExplosion(x, y, lifeFactor) { // lifeFactor 1 -> 0
    push();
    translate(x, y);
    noStroke();
    let baseSize = obstacleWidth * 1.5;
    let currentSize = baseSize * (1.5 - lifeFactor);
    let alpha = 200 * lifeFactor;
    for(let i = 0; i < 5; i++) {
        let angle = random(TWO_PI);
        let dist = random(currentSize * 0.5) * (1-lifeFactor);
        let particleSize = random(5, 15) * lifeFactor;
        let c = random([color(255, 50, 0, alpha), color(255, 150, 0, alpha), color(255, 255, 100, alpha)]);
        fill(c);
        ellipse(cos(angle) * dist, sin(angle) * dist, particleSize, particleSize);
    }
    fill(255, 255, 200, alpha * 0.5); // Central glow
    ellipse(0, 0, currentSize * 0.8, currentSize * 0.8);
    pop();
}

// --- p5.js Core Functions ---

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  // smooth(); // Default, keep smoothing enabled
  rectMode(CORNER);
  ellipseMode(CENTER);
  textAlign(CENTER, CENTER);

  groundLevel = canvasHeight - 50;
  bgX2 = width;

  player = {
    x: width * 0.2,
    y: height / 2,
    velocity: 0,
    width: playerWidth, // Will be updated on selection
    height: playerHeight, // Will be updated on selection
    character: characters[selectedCharacterIndex], // Store chosen character data

    update: function() {
      this.velocity += gravity;
      this.y += this.velocity;
      // Ground collision and jump reset
      if (this.y + this.height > groundLevel) {
        this.y = groundLevel - this.height;
        this.velocity = 0;
        jumpsRemaining = maxJumps;
      }
      // Ceiling collision
      if (this.y < 0) { this.y = 0; this.velocity = 0; }
    },
    jump: function() {
        if (jumpsRemaining > 0) { this.velocity = jumpForce; jumpsRemaining--; }
    },
    shoot: function() {
        fireballs.push({
            x: this.x + this.width, y: this.y + this.height / 2,
            speed: fireballSpeed + gameSpeed, size: 15
        });
    },
    draw: function() {
      this.character.drawFunc(this.x, this.y, this.width, this.height, this.velocity);
    },
    collidesWith: function(obstacle) {
        let pL = this.x, pR = this.x + this.width, pT = this.y, pB = this.y + this.height;
        let oL = obstacle.x, oR = obstacle.x + obstacle.width, oT = obstacle.y, oB = obstacle.y + obstacle.height;
        return pR > oL && pL < oR && pB > oT && pT < oB;
    }
  };

  // Pre-calculate character preview areas for touch detection
  calculatePreviewAreas();
  // Set initial player dimensions based on default character and calc start button
  selectCharacter(selectedCharacterIndex);
  // Reset game variables
  resetGame();
  // Ensure we start at the character select screen
  gameState = 'characterSelect';
}

function draw() {
  // --- Background ---
  let currentBgScrollSpeed = gameSpeed * bgScrollSpeedFactor;
  drawDungeonBackground(bgX1);
  drawDungeonBackground(bgX2);
  if (gameState === 'playing') {
      bgX1 -= currentBgScrollSpeed; bgX2 -= currentBgScrollSpeed;
      if (bgX1 <= -width) bgX1 = width; if (bgX2 <= -width) bgX2 = width;
  }

  // --- Ground ---
  fill(60, 50, 50); noStroke();
  rect(0, groundLevel, width, height - groundLevel);

  // --- Game State Logic ---
  if (gameState === 'characterSelect') {
    displayCharacterSelectScreen();
  } else if (gameState === 'playing') {
    updateAndDrawGame();
  } else if (gameState === 'gameOver') {
    updateAndDrawGame(); // Draw last frame
    displayGameOverScreen();
  }

   // --- Always On Top: Score & Instructions ---
   displayScore();
   displayInstructions();
}

// --- Input Handling ---

function keyPressed() {
    // Desktop controls
    if (gameState === 'characterSelect') {
        if (keyCode === LEFT_ARROW) {
            selectedCharacterIndex = (selectedCharacterIndex - 1 + characters.length) % characters.length;
            selectCharacter(selectedCharacterIndex); // Update selection visuals/button
        } else if (keyCode === RIGHT_ARROW) {
            selectedCharacterIndex = (selectedCharacterIndex + 1) % characters.length;
            selectCharacter(selectedCharacterIndex); // Update selection visuals/button
        } else if (key === ' ' || keyCode === ENTER || keyCode === RETURN) {
            if(startButtonArea.w > 0) { startGame(); } // Start only if button valid
        }
    } else if (gameState === 'playing') {
        if (key === ' ' || keyCode === UP_ARROW) { player.jump(); }
        else if (key === 'f' || key === 'F') { player.shoot(); }
    } else if (gameState === 'gameOver') {
        if (key === ' ' || keyCode === ENTER || keyCode === RETURN) {
            resetGame(); gameState = 'characterSelect';
        }
    }
}

function touchStarted() {
    // Mobile controls
    if (!touches || touches.length === 0) return; // Exit if no touch data
    let touchX = touches[0].x;
    let touchY = touches[0].y;

    if (gameState === 'characterSelect') {
        // 1. Check tap on character previews
        let characterTapped = false;
        for (let i = 0; i < characterPreviewAreas.length; i++) {
            let area = characterPreviewAreas[i];
            if (touchX > area.x && touchX < area.x + area.w && touchY > area.y && touchY < area.y + area.h) {
                selectCharacter(i);
                characterTapped = true;
                break;
            }
        }
        // 2. Check tap on START button (only if character wasn't tapped)
        if (!characterTapped && startButtonArea.w > 0) { // Check button validity
             if (touchX > startButtonArea.x && touchX < startButtonArea.x + startButtonArea.w &&
                 touchY > startButtonArea.y && touchY < startButtonArea.y + startButtonArea.h) {
                 startGame();
             }
        }
    } else if (gameState === 'playing') {
        if (touchX < width / 2) { player.jump(); } // Left side tap = Jump
        else { player.shoot(); }                 // Right side tap = Fire
    } else if (gameState === 'gameOver') {
        resetGame(); gameState = 'characterSelect'; // Any tap restarts
    }

    return false; // Prevent default browser touch behavior (IMPORTANT!)
}


// --- Game Logic Functions ---

function calculatePreviewAreas() {
    characterPreviewAreas = []; // Clear previous
    let spacing = width / (characters.length + 1);
    for (let i = 0; i < characters.length; i++) {
        let char = characters[i];
        let previewW = char.width * 1.5; let previewH = char.height * 1.5;
        let charX = spacing * (i + 1) - previewW / 2; // Top-left X
        let charY = height / 2 - previewH / 2;       // Top-left Y
        let nameHeight = 30; // Approx space for name text

        characterPreviewAreas.push({
            x: charX - previewW * 0.05, y: charY - previewH * 0.05, // Add padding
            w: previewW * 1.1, h: previewH * 1.1 + nameHeight // Include name space
        });
    }
}

function selectCharacter(index) {
    selectedCharacterIndex = index;
    player.character = characters[index];
    player.width = characters[index].width;
    player.height = characters[index].height;

    // Update start button position based on the selected character's area
    if (characterPreviewAreas.length > index) { // Ensure areas are calculated
        let selectedArea = characterPreviewAreas[index];
        startButtonArea = {
             x: selectedArea.x, y: selectedArea.y + selectedArea.h + 5, // Below character box
             w: selectedArea.w, h: 40 // Fixed button height
        };
    } else {
        startButtonArea = { x: 0, y: 0, w: 0, h: 0 }; // Invalidate if areas not ready
    }

    // Ensure player isn't stuck
    player.y = constrain(player.y, 0, groundLevel - player.height);
}

function resetGame() {
  score = 0;
  gameSpeed = initialGameSpeed;
  obstacles = [];
  fireballs = [];
  explosions = [];
  player.y = height / 2; // Reset vertical position
  player.velocity = 0;
  jumpsRemaining = maxJumps; // Reset jumps
  bgX1 = 0; bgX2 = width; // Reset background scroll
}

function startGame() {
    // We might be starting from character select or restart, ensure clean state
    resetGame();
    // Ensure player character visuals are correct based on selection
    selectCharacter(selectedCharacterIndex);
    gameState = 'playing';
}

function updateAndDrawGame() {
  // --- Player Update ---
  player.update();

  // --- Obstacle Update & Draw ---
  if (gameState === 'playing' && frameCount % obstacleSpawnRate === 0) { // Only spawn while playing
    spawnObstacle();
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (gameState === 'playing') obstacles[i].x -= gameSpeed; // Only move while playing
    obstacles[i].draw();

    // Player collision (only matters while playing)
    if (gameState === 'playing' && player.collidesWith(obstacles[i])) {
      gameState = 'gameOver'; // Optional: Add hit sound/effect
    }

    // Remove off-screen obstacles
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // --- Fireball Update & Draw ---
  for (let i = fireballs.length - 1; i >= 0; i--) {
      if (gameState === 'playing') fireballs[i].x += fireballs[i].speed; // Move only playing
      drawFireball(fireballs[i].x, fireballs[i].y, fireballs[i].size);

      // Fireball-Obstacle collision (only matters while playing)
      let hitObstacle = false;
      if (gameState === 'playing') {
          for (let j = obstacles.length - 1; j >= 0; j--) {
              if (fireballs[i].x > obstacles[j].x && fireballs[i].x < obstacles[j].x + obstacles[j].width &&
                  fireballs[i].y > obstacles[j].y && fireballs[i].y < obstacles[j].y + obstacles[j].height) {
                  createExplosion(obstacles[j].x + obstacles[j].width / 2, obstacles[j].y + obstacles[j].height / 2);
                  obstacles.splice(j, 1);
                  fireballs.splice(i, 1);
                  score += pointsPerKill;
                  hitObstacle = true;
                  // Optional: Add explosion sound
                  break; // One fireball hits one obstacle max
              }
          }
      }

      // Remove off-screen or hit fireballs
      if ((!hitObstacle && fireballs[i] && fireballs[i].x > width) || hitObstacle) {
            // Need careful check here as splice changes indices
            if (!hitObstacle) { // Only splice if it wasn't already removed by hitting
                 fireballs.splice(i, 1);
            }
      }
  }

   // --- Explosion Update & Draw ---
   for (let i = explosions.length - 1; i >= 0; i--) {
       // Explosions fade even if game over
       explosions[i].life -= 1 / frameRate();
       if (explosions[i].life <= 0) {
           explosions.splice(i, 1);
       } else {
           drawExplosion(explosions[i].x, explosions[i].y, explosions[i].life / explosions[i].duration);
       }
   }

  // --- Draw Player ---
  player.draw();

  // --- Increase Difficulty (Only while playing) ---
  if (gameState === 'playing') {
    gameSpeed += speedIncreaseFactor;
  }
}

function spawnObstacle() {
  let obstacleHeight = random(minObstacleHeight, maxObstacleHeight);
  let type = random(obstacleTypes);
  let newObstacle = {
      x: width, y: 0, width: obstacleWidth, height: obstacleHeight,
      draw: function() { drawStoneObstacle(this.x, this.y, this.width, this.height); }
  };

  let safeGap = player.height * 1.8; // Min gap estimate

  if (type === 'bottom') {
      newObstacle.y = groundLevel - obstacleHeight;
      if (obstacleHeight > canvasHeight - groundLevel - safeGap) { // Clamp if too tall
          newObstacle.height = groundLevel - safeGap; newObstacle.y = groundLevel - newObstacle.height;
      }
  } else if (type === 'top') {
      newObstacle.y = 0;
      if (obstacleHeight > groundLevel - safeGap) { newObstacle.height = groundLevel - safeGap; } // Clamp if too tall
  } else { // floating
      let minY = safeGap / 2; let maxY = groundLevel - safeGap / 2 - obstacleHeight;
      if (maxY < minY) maxY = minY; // Prevent invalid range
      newObstacle.y = random(minY, maxY);
  }

  // Basic check to prevent immediately impossible sequences (less critical with shooting)
  if (obstacles.length > 0) {
      let last = obstacles[obstacles.length-1];
      if (last.y === 0 && last.height >= groundLevel - safeGap) { // If last was almost full height top
          if (newObstacle.y === 0 && newObstacle.height >= groundLevel - safeGap) { // And this one is too
               type = random(['bottom', 'floating']); // Force change
               if (type === 'bottom') { newObstacle.y = groundLevel - newObstacle.height; }
               else { let minY = safeGap/2; let maxY = groundLevel-safeGap/2-newObstacle.height; if(maxY<minY)maxY=minY; newObstacle.y=random(minY,maxY);}
          }
      }
       // Could add similar check for bottom obstacles
  }
  obstacles.push(newObstacle);
}

function createExplosion(x, y) {
    explosions.push({ x: x, y: y, duration: 0.4, life: 0.4 });
}


// --- Display Functions ---

function displayScore() {
  fill(255); textSize(24); textAlign(RIGHT, TOP); textFont('monospace');
  text("Score: " + score, width - 20, 20);
}

function displayInstructions() {
    fill(255, 255, 255, 220); textSize(16); textAlign(CENTER, TOP); textFont('monospace');
    let instructionText = "";
    let keyboardHint = "";

    if (gameState === 'characterSelect') {
        instructionText = "Tap Character | Tap START";
        keyboardHint = "(or ARROWS + SPACE/ENTER)";
    } else if (gameState === 'playing') {
        instructionText = "Tap Left = Jump | Tap Right = Fire";
        keyboardHint = "(or SPACE + F)";
    } else if (gameState === 'gameOver') {
        instructionText = "Tap Screen to Restart";
        keyboardHint = "(or SPACE/ENTER)";
    }

    // Draw instructions, potentially multi-line
    textAlign(CENTER, TOP);
    text(instructionText, width / 2, 50); // Main instructions
    if (keyboardHint) {
        textSize(12); // Smaller hint
        fill(255, 255, 255, 180); // Slightly dimmer
        text(keyboardHint, width / 2, 70); // Hint below main instructions
    }
}

function displayCharacterSelectScreen() {
  // Title
  fill(255); textSize(48); textAlign(CENTER, CENTER); textFont('monospace');
  text("CHOOSE YOUR RUNNER", width / 2, height * 0.2);

  // Display Characters & Highlight
  let spacing = width / (characters.length + 1);
  for (let i = 0; i < characters.length; i++) {
    let char = characters[i];
    let area = characterPreviewAreas[i]; // Use pre-calculated area
    let previewW = char.width * 1.5;
    let previewH = char.height * 1.5;
    let charX_center = spacing * (i + 1); // Center for drawing
    let charY_center = height / 2;

    // Draw character centered within its logical area space
    char.drawFunc(charX_center - previewW / 2, charY_center - previewH / 2, previewW, previewH, 0);

    // Draw Name below character
    textSize(18); fill(255); textAlign(CENTER, CENTER);
    text(char.name, charX_center, area.y + previewH + 15); // Position relative to top of box

    // Highlight selected using the calculated area
    if (i === selectedCharacterIndex) {
      noFill(); stroke(255, 220, 0); strokeWeight(4);
      rect(area.x, area.y, area.w, area.h, 10);

      // Draw the START button using its calculated area
      if (startButtonArea.w > 0) { // Draw only if valid
          fill(80, 200, 80, 200); stroke(255); strokeWeight(2);
          rect(startButtonArea.x, startButtonArea.y, startButtonArea.w, startButtonArea.h, 8);
          fill(255); noStroke(); textSize(20); textFont('monospace'); textAlign(CENTER, CENTER);
          text("START", startButtonArea.x + startButtonArea.w / 2, startButtonArea.y + startButtonArea.h / 2);
      }
    }
  }
  noStroke(); // Reset stroke
}

function displayGameOverScreen() {
  // Overlay
  fill(150, 0, 0, 180); noStroke();
  rect(0, 0, width, height);

  // Text
  fill(255); textSize(60); textAlign(CENTER, CENTER); textFont('monospace');
  text("GAME OVER", width / 2, height / 2 - 40);
  textSize(32);
  text("Final Score: " + score, width / 2, height / 2 + 40);

  // Instructions are handled by displayInstructions() which is always drawn
}
