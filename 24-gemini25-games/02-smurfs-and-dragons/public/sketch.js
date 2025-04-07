// sketch.js - WITH Difficulty, Improved Text, AND Auto-Shooting!

// --- Game Configuration ---
const MAX_SOLDIERS = 200;
const ARMY_AREA_HEIGHT = 100;
const LEFT_CHOICE_RATIO = 0.4;
const RIGHT_CHOICE_RATIO = 0.4;
const ARROW_SPEED = 7; // How fast arrows fly
const ARROW_SPAWN_RATE = 10; // Lower is faster (spawn every X frames)
const RED_CHOICE_MITIGATION_CAP = 10; // Negative choices can be shot up to become +10

let playerSoldiers = 1;
let score = 0;
let playerX;
let playerTargetX;

let challenges = [];
let arrows = []; // ADDED: Array for arrows
let currentSchema;
let currentSchemaIndex = 0;
let challengeSpawnTimer;
let challengeInterval = 5000;
let intervalDecreaseRate = 50;
let minInterval = 1500;

let instructionText = "Arrows auto-fire! Aim at RED choices [-X] to make them less negative!"; // UPDATED instruction
let instructionTimer = 300; // Show longer initially

let gameOver = false;
let gameStarted = false;
let difficultySelected = false;
let selectedDifficulty = 'MEDIUM';
let difficultyMultiplier = 1.0;

const difficultySettings = {
    'EASY':   { intervalMult: 1.1,  decreaseMult: 0.8, speedMult: 0.9, labelColor: [144, 238, 144] },
    'MEDIUM': { intervalMult: 0.9,  decreaseMult: 1.0, speedMult: 1.0, labelColor: [255, 255, 0] },
    'HARD':   { intervalMult: 0.7, decreaseMult: 1.3, speedMult: 1.2, labelColor: [255, 69, 0] }
};

// --- Colors ---
let GREEN_ARMY, RED_ENEMY, BLUE_SMURF, BLUE_CHOICE, RED_CHOICE, GOLD_SCORE, WHITE_TEXT;
let DRAGON_GREEN, BACKGROUND_COLOR_1, BACKGROUND_COLOR_2, GRASS_COLOR;
let BUTTON_COLOR, BUTTON_TEXT_COLOR, ARROW_COLOR; // ADDED ARROW_COLOR

// --- Challenge Schemas (Unchanged) ---
const schemas = [
  { interval: 5000, decrease: 50, challenges: [ { type: 'choice', data: ['+5', '+3'] }, { type: 'enemy', data: { type: 'soldier', count: 2 } }, { type: 'choice', data: ['+10', '*2'] }, { type: 'enemy', data: { type: 'smurf', count: 5 } }, { type: 'choice', data: ['+8', '-5'] }, { type: 'enemy', data: { type: 'soldier', count: 7 } }, { type: 'choice', data: ['*2', '+15'] }, { type: 'enemy', data: { type: 'smurf', count: 10 } }, { type: 'choice', data: ['+20', '-10'] }, { type: 'enemy', data: { type: 'soldier', count: 10 } }, { type: 'choice', data: ['*3', '+25'] }, { type: 'enemy', data: { type: 'dragon', hp: 15 } }, { type: 'choice', data: ['+15', '+15'] }, { type: 'enemy', data: { type: 'smurf', count: 15 } }, { type: 'choice', data: ['*2', '-5'] }, { type: 'enemy', data: { type: 'soldier', count: 12 } }, { type: 'choice', data: ['+10', '*3'] }, { type: 'enemy', data: { type: 'dragon', hp: 20 } }, { type: 'choice', data: ['+30', '-15'] }, { type: 'enemy', data: { type: 'soldier', count: 18 } }, ] },
  { interval: 4500, decrease: 60, challenges: [ { type: 'choice', data: ['+20', '*2'] }, { type: 'enemy', data: { type: 'soldier', count: 15 } }, { type: 'choice', data: ['*3', '+30'] }, { type: 'enemy', data: { type: 'smurf', count: 20 } }, { type: 'choice', data: ['-10', '*2'] }, { type: 'enemy', data: { type: 'dragon', hp: 25 } }, { type: 'choice', data: ['+50', '*3'] }, { type: 'enemy', data: { type: 'soldier', count: 25 } }, { type: 'choice', data: ['/2', '-20'] }, { type: 'enemy', data: { type: 'smurf', count: 25 } }, { type: 'choice', data: ['*4', '+60'] }, { type: 'enemy', data: { type: 'dragon', hp: 30 } }, { type: 'choice', data: ['-15', '+15'] }, { type: 'enemy', data: { type: 'soldier', count: 20 } }, { type: 'choice', data: ['*2', '/2'] }, { type: 'enemy', data: { type: 'smurf', count: 30 } }, { type: 'choice', data: ['+40', '*3'] }, { type: 'enemy', data: { type: 'dragon', hp: 35 } }, { type: 'choice', data: ['-30', '/3'] }, { type: 'enemy', data: { type: 'soldier', count: 30 } }, ] },
  { interval: 4000, decrease: 70, challenges: [ { type: 'choice', data: ['*3', '+50'] }, { type: 'enemy', data: { type: 'dragon', hp: 30 } }, { type: 'choice', data: ['/2', '-25'] }, { type: 'enemy', data: { type: 'soldier', count: 30 }, }, { type: 'choice', data: ['*2', '*3'] }, { type: 'enemy', data: { type: 'smurf', count: 35 } }, { type: 'choice', data: ['+70', '-35'] }, { type: 'enemy', data: { type: 'soldier', count: 35 } }, { type: 'choice', data: ['/3', '*2'] }, { type: 'enemy', data: { type: 'dragon', hp: 40 } }, { type: 'choice', data: ['+100', '*4'] }, { type: 'enemy', data: { type: 'smurf', count: 40 } }, { type: 'choice', data: ['-50', '/2'] }, { type: 'enemy', data: { type: 'soldier', count: 40 } }, { type: 'choice', data: ['*5', '+80'] }, { type: 'enemy', data: { type: 'dragon', hp: 45 } }, { type: 'choice', data: ['/4', '-40'] }, { type: 'enemy', data: { type: 'smurf', count: 45 } }, { type: 'choice', data: ['+90', '*3'] }, { type: 'enemy', data: { type: 'soldier', count: 45 } }, { type: 'choice', data: ['-60', '/3'] }, ] },
  { interval: 3500, decrease: 80, challenges: [ { type: 'choice', data: ['*5', '+100'] }, { type: 'enemy', data: { type: 'soldier', count: 40 } }, { type: 'choice', data: ['/4', '-50'] }, { type: 'enemy', data: { type: 'dragon', hp: 50 } }, { type: 'choice', data: ['+80', '*4'] }, { type: 'enemy', data: { type: 'smurf', count: 50 } }, { type: 'choice', data: ['/2', '/3'] }, { type: 'enemy', data: { type: 'soldier', count: 50 } }, { type: 'choice', data: ['*6', '+120'] }, { type: 'enemy', data: { type: 'dragon', hp: 55 } }, { type: 'choice', data: ['-75', '/5'] }, { type: 'enemy', data: { type: 'smurf', count: 55 } }, { type: 'choice', data: ['+150', '*5'] }, { type: 'enemy', data: { type: 'soldier', count: 55 } }, { type: 'choice', data: ['/3', '-60'] }, { type: 'enemy', data: { type: 'dragon', hp: 60 } }, { type: 'choice', data: ['*7', '+140'] }, { type: 'enemy', data: { type: 'smurf', count: 60 } }, { type: 'choice', data: ['-80', '/4'] }, { type: 'enemy', data: { type: 'soldier', count: 60 } }, ] },
  { interval: 3000, decrease: 100, minInterval: 1000, challenges: [ { type: 'choice', data: ['*10', '+200'] }, { type: 'enemy', data: { type: 'dragon', hp: 70 } }, { type: 'choice', data: ['/5', '-100'] }, { type: 'enemy', data: { type: 'soldier', count: 60 } }, { type: 'enemy', data: { type: 'smurf', count: 60 } }, { type: 'choice', data: ['*8', '*9'] }, { type: 'enemy', data: { type: 'dragon', hp: 75 } }, { type: 'choice', data: ['/2', '/4'] }, { type: 'enemy', data: { type: 'soldier', count: 65 } }, { type: 'enemy', data: { type: 'smurf', count: 65 } }, { type: 'choice', data: ['+150', '-150'] }, { type: 'enemy', data: { type: 'dragon', hp: 80 } }, { type: 'choice', data: ['*6', '/6'] }, { type: 'enemy', data: { type: 'soldier', count: 70 } }, { type: 'enemy', data: { type: 'smurf', count: 70 } }, { type: 'choice', data: ['+250', '*10'] }, { type: 'enemy', data: { type: 'dragon', hp: 100 } }, { type: 'choice', data: ['-100', '/5'] }, { type: 'enemy', data: { type: 'soldier', count: 80 } }, { type: 'enemy', data: { type: 'smurf', count: 80 } }, { type: 'choice', data: ['*1', '+0'] }, { type: 'enemy', data: { type: 'dragon', hp: 120 } }, ] }
];
let schemaChallengeIndex = 0;

// --- p5.js Functions ---

function setup() {
  let canvasW = min(600, windowWidth * 0.9);
  let canvasH = min(800, windowHeight * 0.9);
  if (canvasW > canvasH * 0.7) {
      canvasW = canvasH * 0.7;
  }
  createCanvas(canvasW, canvasH);

  playerX = width / 2;
  playerTargetX = playerX;

  // Initialize colors
  GREEN_ARMY = color(34, 139, 34, 220); RED_ENEMY = color(220, 20, 60, 220); BLUE_SMURF = color(65, 105, 225, 220);
  BLUE_CHOICE = color(0, 191, 255); RED_CHOICE = color(255, 69, 0); GOLD_SCORE = color(255, 215, 0); WHITE_TEXT = color(255);
  DRAGON_GREEN = color(0, 100, 0); BACKGROUND_COLOR_1 = color(135, 206, 250); BACKGROUND_COLOR_2 = color(70, 130, 180);
  GRASS_COLOR = color(124, 252, 0); BUTTON_COLOR = color(100, 100, 200, 200); BUTTON_TEXT_COLOR = color(255);
  ARROW_COLOR = color(139, 69, 19); // Brown for arrows

  frameRate(60);
  textAlign(CENTER, CENTER);
  textSize(18);
}

function draw() {
  if (!gameStarted) {
    showStartScreen();
    return;
  }

  if (gameOver) {
    showGameOverScreen();
    return;
  }

  // --- Updates ---
  handleInput();
  updatePlayerPosition();
  handleShooting(); // ADDED: Handle automatic arrow spawning
  updateArrows();   // ADDED: Update arrow positions and check collisions
  updateChallenges();
  spawnChallenge();
  checkCollisions(); // Player collision with challenges
  updateScore();
  checkGameOver();

  // --- Drawing ---
  drawBackground();
  drawPlayerArmy();
  drawArrows();     // ADDED: Draw the arrows
  drawChallenges();
  drawUI();
  drawInstructions();
}

function mousePressed() {
    if (!gameStarted) {
        let btnY = height * 0.6, btnHeight = 50, btnWidth = width * 0.25;
        let easyX = width * 0.25 - btnWidth / 2, mediumX = width * 0.5 - btnWidth / 2, hardX = width * 0.75 - btnWidth / 2;
        if (mouseY > btnY - btnHeight / 2 && mouseY < btnY + btnHeight / 2) {
            if (mouseX > easyX && mouseX < easyX + btnWidth) startGame('EASY');
            else if (mouseX > mediumX && mouseX < mediumX + btnWidth) startGame('MEDIUM');
            else if (mouseX > hardX && mouseX < hardX + btnWidth) startGame('HARD');
        }
    } else if (gameOver) {
        gameStarted = false; gameOver = false; loop();
    }
}


// --- Game Logic Functions ---

function startGame(difficulty) {
    selectedDifficulty = difficulty;
    let diffSetting = difficultySettings[selectedDifficulty];
    difficultyMultiplier = diffSetting.speedMult;
    playerSoldiers = 1; score = 0; challenges = []; arrows = []; // Clear arrows too
    currentSchemaIndex = 0; schemaChallengeIndex = 0; gameOver = false;
    loadSchema(0);
    playerX = width / 2; playerTargetX = playerX;
    instructionText = "Arrows auto-fire! Aim at RED choices [-X] to make them less negative!";
    instructionTimer = 300; // Reset timer for instructions
    gameStarted = true;
    loop();
    console.log(`Starting game with difficulty: ${selectedDifficulty}`);
}

function resetGame() { /* Effectively handled by startGame now */ }

function loadSchema(schemaIdx) {
  if (schemaIdx >= schemas.length) {
      console.log("All schemas completed! Continuing on hardest level.");
      schemaIdx = schemas.length - 1;
      difficultyMultiplier *= 1.1; challengeInterval *= 0.9;
  }
   currentSchemaIndex = schemaIdx; currentSchema = schemas[currentSchemaIndex]; schemaChallengeIndex = 0;
   let diffSetting = difficultySettings[selectedDifficulty];
   challengeInterval = currentSchema.interval * diffSetting.intervalMult;
   intervalDecreaseRate = currentSchema.decrease * diffSetting.decreaseMult;
   minInterval = (currentSchema.minInterval || 1500) * diffSetting.intervalMult;
   challengeSpawnTimer = millis();
   console.log(`Loaded Schema ${currentSchemaIndex + 1} (${selectedDifficulty}). Interval: ${challengeInterval.toFixed(0)}ms, SpeedMult: ${difficultyMultiplier.toFixed(1)}`);
}

function handleInput() { /* Unchanged */
  if (mouseIsPressed) playerTargetX = mouseX;
  else { if (keyIsDown(LEFT_ARROW)) playerTargetX -= 15; if (keyIsDown(RIGHT_ARROW)) playerTargetX += 15; }
  playerTargetX = constrain(playerTargetX, 0, width);
}

function updatePlayerPosition() { /* Unchanged */
    let easing = 0.1; playerX += (playerTargetX - playerX) * easing; playerX = constrain(playerX, 0, width);
}

// --- Shooting Logic ---
function handleShooting() {
    if (frameCount % ARROW_SPAWN_RATE === 0) {
        spawnArrow();
    }
}

function spawnArrow() {
    let arrow = {
        x: playerX, // Spawn from current player X
        y: height - ARMY_AREA_HEIGHT, // Spawn just above army area
        speed: ARROW_SPEED
    };
    arrows.push(arrow);
}

function updateArrows() {
    for (let i = arrows.length - 1; i >= 0; i--) {
        arrows[i].y -= arrows[i].speed;
        // Remove if off-screen
        if (arrows[i].y < 0) {
            arrows.splice(i, 1);
            continue; // Skip collision check for this removed arrow
        }
        // Check collision with red choices
        if (checkArrowCollision(arrows[i])) {
             arrows.splice(i, 1); // Remove arrow if it hits
        }
    }
}

function checkArrowCollision(arrow) {
    let boxWidth = width * LEFT_CHOICE_RATIO * 0.85;
    let boxHeight = 70;
    let leftBoxX = (width * LEFT_CHOICE_RATIO) / 2 - boxWidth / 2;
    let rightBoxX = width * (1.0 - RIGHT_CHOICE_RATIO / 2) - boxWidth / 2;

    for (let chal of challenges) {
        if (chal.type === 'choice') {
            let chalY = chal.y;
            let boxTop = chalY - boxHeight / 2;
            let boxBottom = chalY + boxHeight / 2;

            // Check collision with Left choice IF IT'S RED ('-')
            if (chal.data[0][0] === '-') {
                if (arrow.x > leftBoxX && arrow.x < leftBoxX + boxWidth && arrow.y > boxTop && arrow.y < boxBottom) {
                    modifyRedChoice(chal, 0); // Hit left choice
                    return true; // Arrow hit something
                }
            }
             // Check collision with Right choice IF IT'S RED ('-')
             if (chal.data[1][0] === '-') {
                if (arrow.x > rightBoxX && arrow.x < rightBoxX + boxWidth && arrow.y > boxTop && arrow.y < boxBottom) {
                    modifyRedChoice(chal, 1); // Hit right choice
                    return true; // Arrow hit something
                }
            }
            // NOTE: Currently NOT mitigating division ('/') choices, only subtraction.
        }
    }
    return false; // Arrow hit nothing this frame
}

function modifyRedChoice(challenge, choiceIndex) {
    let opString = challenge.data[choiceIndex];
    if (opString[0] !== '-') return; // Safety check, should only be called on '-'

    let currentValue = parseInt(opString); // e.g., "-20" -> -20
    let newValue = currentValue + 1;      // Becomes -19

    // Cap the mitigation at the defined positive value
    newValue = min(newValue, RED_CHOICE_MITIGATION_CAP); // e.g., max +10

    // Format the new string
    let newOpString;
    if (newValue >= 0) {
        newOpString = "+" + newValue; // Always show + for positive results or zero
    } else {
        newOpString = "" + newValue; // e.g., "-19", "-1"
    }

    // Update the challenge data
    challenge.data[choiceIndex] = newOpString;
    score += 1; // Give a small score bonus for hitting a red choice!

    // console.log(`Mitigated choice ${choiceIndex}: ${opString} -> ${newOpString}`); // Debug
}


// --- Challenge & Game State Updates ---
function spawnChallenge() { /* Unchanged */
  if (millis() - challengeSpawnTimer > challengeInterval) {
    if (schemaChallengeIndex < currentSchema.challenges.length) { createChallenge(currentSchema.challenges[schemaChallengeIndex]); schemaChallengeIndex++; }
    else { score += 500 * (currentSchemaIndex + 1); loadSchema(currentSchemaIndex + 1); challengeSpawnTimer = millis(); return; }
    challengeSpawnTimer = millis(); challengeInterval = max(minInterval, challengeInterval - intervalDecreaseRate);
  }
}
function createChallenge(challengeDef) { /* Unchanged */
  let baseSpeed = 1.8 + (currentSchemaIndex * 0.4);
  let newChallenge = { x: width / 2, y: -50, type: challengeDef.type, data: challengeDef.data, speed: baseSpeed * difficultyMultiplier };
  challenges.push(newChallenge);
}
function updateChallenges() { /* Unchanged */
  for (let i = challenges.length - 1; i >= 0; i--) { challenges[i].y += challenges[i].speed; if (challenges[i].y > height + 50) challenges.splice(i, 1); }
}
function checkCollisions() { /* Player collisions - Unchanged */
    let playerYLine = height - ARMY_AREA_HEIGHT / 2;
    for (let i = challenges.length - 1; i >= 0; i--) {
        let chal = challenges[i];
        if (chal.y >= playerYLine && chal.y < playerYLine + chal.speed * 2) {
            let choiceMade = false;
            if (chal.type === 'choice') {
                let leftZoneEnd = width * LEFT_CHOICE_RATIO, rightZoneStart = width * (1.0 - RIGHT_CHOICE_RATIO);
                if (playerX < leftZoneEnd) { applyOperation(chal.data[0]); score += 10; choiceMade = true; }
                else if (playerX > rightZoneStart) { applyOperation(chal.data[1]); score += 10; choiceMade = true; }
                else { score += 5; choiceMade = true; }
            } else if (chal.type === 'enemy') {
                let damage = (chal.data.type === 'dragon') ? chal.data.hp : chal.data.count;
                playerSoldiers -= damage; playerSoldiers = max(0, playerSoldiers); score -= damage; choiceMade = true;
            }
            if (choiceMade) { challenges.splice(i, 1); playerSoldiers = min(playerSoldiers, MAX_SOLDIERS); playerSoldiers = round(playerSoldiers); }
        }
    }
}
function applyOperation(opString) { /* Unchanged */
    playerSoldiers = Number(playerSoldiers); let operator = opString[0]; let value = Number(opString.substring(1)); let initialSoldiers = playerSoldiers;
    if (operator === '+') { playerSoldiers += value; score += value * 2; }
    else if (operator === '-') { playerSoldiers -= value; score -= value; }
    else if (operator === '*') { playerSoldiers *= value; score += max(0, round(playerSoldiers - initialSoldiers)) * 3; }
    else if (operator === '/') { if (value !== 0) { playerSoldiers = floor(playerSoldiers / value); score -= max(0, round(initialSoldiers - playerSoldiers)) * 2; } }
    playerSoldiers = max(0, playerSoldiers); playerSoldiers = min(playerSoldiers, MAX_SOLDIERS); playerSoldiers = round(playerSoldiers);
}
function updateScore() { /* Unchanged */ score += 0.01 * difficultyMultiplier; score = max(0, score); }
function checkGameOver() { /* Unchanged */ if (playerSoldiers <= 0) gameOver = true; }


// --- Drawing Functions ---

function drawBackground() { /* Unchanged */
    for (let i = 0; i < height; i++) { let inter = map(i, 0, height, 0, 1); let c = lerpColor(BACKGROUND_COLOR_1, BACKGROUND_COLOR_2, inter); stroke(c); line(0, i, width, i); }
    noStroke(); fill(GRASS_COLOR); rect(0, height - ARMY_AREA_HEIGHT, width, ARMY_AREA_HEIGHT);
    fill(160, 160, 160); let towerWidth = width * 0.05, towerHeight = ARMY_AREA_HEIGHT * 1.5; rect(0, height - towerHeight, towerWidth, towerHeight); rect(width - towerWidth, height - towerHeight, towerWidth, towerHeight);
    fill(140, 140, 140); for(let i=0; i < 3; i++){ rect(towerWidth / 4 * i, height - towerHeight - 10, towerWidth / 4, 10); rect(width - towerWidth + (towerWidth / 4 * i), height - towerHeight - 10, towerWidth / 4, 10); }
}
function drawPlayerArmy() { /* Unchanged */
  let displayCount = min(round(playerSoldiers), 30); let soldierSize = 15; let spacing = 2; let totalWidth = displayCount * (soldierSize + spacing) - spacing; let startX = playerX - totalWidth / 2;
  fill(0, 80, 0, 100); rectMode(CENTER); rect(playerX, height - ARMY_AREA_HEIGHT / 2, max(soldierSize*2, totalWidth + 20) , soldierSize * 2, 5); rectMode(CORNER);
  for (let i = 0; i < displayCount; i++) { let x = startX + i * (soldierSize + spacing); let y = height - ARMY_AREA_HEIGHT / 2 - soldierSize / 2; drawSoldier(x, y, soldierSize, GREEN_ARMY); }
  fill(WHITE_TEXT); textAlign(CENTER, CENTER); textSize(16); text(max(0,round(playerSoldiers)), playerX, height - ARMY_AREA_HEIGHT / 2 + soldierSize * 0.7);
}

// ADDED: Draw arrows
function drawArrows() {
    push();
    fill(ARROW_COLOR);
    stroke(0); // Black outline for visibility
    strokeWeight(1);
    for (let arrow of arrows) {
        // Simple triangle shape for arrow
        triangle(arrow.x, arrow.y, arrow.x - 4, arrow.y + 10, arrow.x + 4, arrow.y + 10);
        // Optional: Add a line for the shaft
        // line(arrow.x, arrow.y + 10, arrow.x, arrow.y + 15);
    }
    pop();
}

function drawChallenges() { /* Unchanged */
  for (let chal of challenges) { if (chal.type === 'choice') drawChoiceChallenge(chal); else if (chal.type === 'enemy') drawEnemyChallenge(chal); }
}
function drawChoiceChallenge(chal) { /* MODIFIED: Fill color now uses getOperationColor on current data */
    let boxWidth = width * LEFT_CHOICE_RATIO * 0.85; let boxHeight = 70;
    let leftBoxX = (width * LEFT_CHOICE_RATIO) / 2 - boxWidth / 2; let rightBoxX = width * (1.0 - RIGHT_CHOICE_RATIO / 2) - boxWidth / 2;
    // Draw Left choice - Get color based on CURRENT data string
    fill(getOperationColor(chal.data[0]));
    rect(leftBoxX, chal.y - boxHeight / 2, boxWidth, boxHeight, 10);
    drawFormattedOperation(chal.data[0], leftBoxX + boxWidth / 2, chal.y);
    // Draw Right choice - Get color based on CURRENT data string
    fill(getOperationColor(chal.data[1]));
    rect(rightBoxX, chal.y - boxHeight / 2, boxWidth, boxHeight, 10);
    drawFormattedOperation(chal.data[1], rightBoxX + boxWidth / 2, chal.y);
    textAlign(CENTER, CENTER); // Reset just in case
}
function drawFormattedOperation(opString, centerX, centerY) { /* Unchanged */
    let operator = opString[0]; let numberStr = opString.substring(1); if (operator === '*') operator = 'X';
    let opSize = 40, numSize = 32, textPadding = 8;
    push(); textSize(opSize); let opWidth = textWidth(operator); textSize(numSize); let numWidth = textWidth(numberStr);
    let totalTextWidth = opWidth + textPadding + numWidth; let startTextX = centerX - (totalTextWidth / 2);
    fill(WHITE_TEXT); textAlign(LEFT, CENTER); textSize(opSize); text(operator, startTextX, centerY);
    textSize(numSize); text(numberStr, startTextX + opWidth + textPadding, centerY);
    pop();
}
function drawEnemyChallenge(chal) { /* Unchanged */
    let displaySize = 20; let spacing = 5; let enemyCount = (chal.data.type === 'dragon') ? 1 : chal.data.count;
    let totalWidth = enemyCount * (displaySize + spacing) - spacing; let startX = width / 2 - totalWidth / 2;
    if (chal.data.type === 'dragon') drawDragon(width / 2, chal.y, 60, chal.data.hp);
    else { let drawLimit = 20; for (let i = 0; i < min(enemyCount, drawLimit) ; i++) { let x = startX + i * (displaySize + spacing); if (chal.data.type === 'soldier') drawSoldier(x, chal.y, displaySize, RED_ENEMY); else if (chal.data.type === 'smurf') drawSmurf(x, chal.y, displaySize); } if(enemyCount > drawLimit) { fill(WHITE_TEXT); textAlign(CENTER, CENTER); textSize(14); text(`+${enemyCount - drawLimit}`, width/2 , chal.y + displaySize); } }
    fill(WHITE_TEXT); textAlign(CENTER, CENTER); textSize(16); let label = (chal.data.type === 'dragon') ? `${chal.data.hp} HP` : `${chal.data.count}`; text(label, width / 2, chal.y + displaySize * 1.5);
}
function drawUI() { /* Unchanged */
  fill(GOLD_SCORE); textSize(24); textAlign(RIGHT, TOP); text("Score: " + floor(score), width - 10, 10);
   if (gameStarted) { let diffSetting = difficultySettings[selectedDifficulty]; fill(diffSetting.labelColor); textAlign(CENTER, TOP); textSize(16); text(selectedDifficulty, width / 2, 10); }
   fill(WHITE_TEXT); textSize(16); textAlign(LEFT, TOP); text(`Level: ${currentSchemaIndex + 1}`, 10, 10);
}
function drawInstructions() { /* Unchanged */
  if (instructionTimer > 0 && gameStarted) {
    fill(0, 0, 0, 150); rectMode(CENTER); rect(width / 2, height / 3, width * 0.8, 60, 10); rectMode(CORNER);
    fill(WHITE_TEXT); textSize(18); textAlign(CENTER, CENTER); text(instructionText, width / 2, height / 3); instructionTimer--;
  }
}
function showStartScreen() { /* Unchanged */
    drawBackground(); textAlign(CENTER, CENTER); fill(WHITE_TEXT); textSize(32); text("Medieval Math Marauders!", width / 2, height * 0.2);
    textSize(20); text("Choose your challenge!", width/2, height * 0.35);
    let btnY = height * 0.6, btnHeight = 50, btnWidth = width * 0.25;
    let easyX = width * 0.25 - btnWidth / 2, medX = width * 0.5 - btnWidth / 2, hardX = width * 0.75 - btnWidth / 2;
    let easyColor = difficultySettings['EASY'].labelColor, medColor = difficultySettings['MEDIUM'].labelColor, hardColor = difficultySettings['HARD'].labelColor;
    fill(easyColor[0], easyColor[1], easyColor[2], 200); rect(easyX, btnY - btnHeight / 2, btnWidth, btnHeight, 10); fill(BUTTON_TEXT_COLOR); textSize(24); text("EASY", easyX + btnWidth / 2, btnY);
    fill(medColor[0], medColor[1], medColor[2], 200); rect(medX, btnY - btnHeight / 2, btnWidth, btnHeight, 10); fill(BUTTON_TEXT_COLOR); textSize(24); text("MEDIUM", medX + btnWidth / 2, btnY);
    fill(hardColor[0], hardColor[1], hardColor[2], 200); rect(hardX, btnY - btnHeight / 2, btnWidth, btnHeight, 10); fill(BUTTON_TEXT_COLOR); textSize(24); text("HARD", hardX + btnWidth / 2, btnY);
}
function showGameOverScreen() { /* Unchanged */
    fill(0, 0, 0, 150); rect(0, 0, width, height); fill(RED_CHOICE); textAlign(CENTER, CENTER); textSize(48); text("GAME OVER!", width / 2, height / 3);
    fill(GOLD_SCORE); textSize(32); text("Final Score: " + floor(score), width / 2, height / 2);
    let diffSetting = difficultySettings[selectedDifficulty]; fill(diffSetting.labelColor); textSize(22); text(`Difficulty: ${selectedDifficulty}`, width/2, height * 0.58);
    fill(WHITE_TEXT); textSize(20); text("Click or Tap to Play Again", width / 2, height * 2 / 3);
}

// --- Graphics Helper Functions ---
function getOperationColor(opString) { /* MODIFIED: Check first char AFTER parsing */
    let operator = opString[0];
    // Check if it's a number (meaning it was potentially modified to 0 or positive)
    if (!isNaN(parseInt(operator))) { // If the first char is a digit or +/- sign of a number > 0
        let value = parseInt(opString);
        if (value >= 0) return BLUE_CHOICE; // Treat +0 and positive numbers as blue
         else return RED_CHOICE; // Should still be red if negative
    }
    // Original logic for initial operator characters
    if (operator === '+' || operator === '*') return BLUE_CHOICE;
    if (operator === '-' || operator === '/') return RED_CHOICE;
    return color(128); // Default grey
}

function drawSoldier(x, y, size, col) { /* Unchanged */ push(); translate(x, y); fill(col); noStroke(); rectMode(CENTER); rect(0, 0, size * 0.6, size); fill(245, 222, 179); ellipse(0, -size * 0.4, size * 0.4, size * 0.4); fill(100); triangle(-size*0.3, -size*0.5, size*0.3, -size*0.5, 0, -size*0.8); stroke(100); strokeWeight(2); line(size * 0.3, -size*0.2, size * 0.5, -size*0.8); fill(150); noStroke(); triangle(size * 0.5, -size*0.8, size*0.45, -size*0.9, size*0.55, -size*0.9); rectMode(CORNER); pop(); }
function drawSmurf(x, y, size) { /* Unchanged */ push(); translate(x, y); noStroke(); fill(BLUE_SMURF); ellipse(0, size*0.1, size * 0.7, size*0.9); fill(WHITE_TEXT); beginShape(); vertex(0, -size * 0.8); bezierVertex(-size * 0.6, -size * 0.7, -size*0.4, -size*0.1, 0, -size*0.2); bezierVertex(size * 0.4, -size*0.3, size*0.3, -size*0.6, 0, -size * 0.8); endShape(CLOSE); pop(); }
function drawDragon(x, y, size, hp) { /* Unchanged */ push(); translate(x, y); noStroke(); fill(DRAGON_GREEN); ellipse(0, 0, size * 1.2, size * 0.8); ellipse(-size * 0.7, -size * 0.3, size * 0.5, size * 0.4); rectMode(CENTER); rect(-size*0.4, -size*0.1, size*0.5, size*0.2); rectMode(CORNER); triangle(size * 0.6, 0, size * 1.1, size * 0.3, size * 1.1, -size * 0.3); fill(100, 150, 100); triangle(-size*0.1, -size*0.3, size*0.4, -size*0.8, size*0.5, -size*0.1); triangle(-size*0.3, -size*0.4, -size*0.8, -size*0.9, -size*0.6, -size*0.2); fill(RED_ENEMY); textSize(14); textAlign(CENTER, CENTER); text(`${hp} HP`, 0, size * 0.6); pop(); }
