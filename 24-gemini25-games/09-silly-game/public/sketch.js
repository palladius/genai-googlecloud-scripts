// --- Game Configuration ---
let canvasWidth = 600;
let canvasHeight = 400;

// --- Game State ---
let gameState = 'START'; // START, PLAYING, GAME_OVER
let score = 0;
let gameSpeed;
let initialGameSpeed = 3;
let maxGameSpeed = 7;
let speedIncreaseFactor = 0.001;

// --- Player (Penguin) ---
let penguin;
const PENGUIN_WIDTH = 30;
const PENGUIN_HEIGHT = 40;
const PENGUIN_GROUND_Y = canvasHeight - 50 - PENGUIN_HEIGHT / 2;
const JUMP_FORCE = -10;
const GRAVITY = 0.5;

// --- Obstacles ---
let obstacles = [];
let obstacleWidth = 40;
let minObstacleHeight = 30;
let maxObstacleHeight = 80;
let obstacleSpawnIntervalMin = 80; // frames
let obstacleSpawnIntervalMax = 150; // frames
let nextObstacleSpawnFrame;

// --- Background ---
let bgElements = [];
const NUM_BG_LAYERS = 3;
const BG_COLORS = [
    [255, 250, 205], // Pale Yellow
    [255, 245, 180], // Lighter Yellow
    [255, 235, 155]  // Light Yellow
];

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    noSmooth(); // For a more pixelated look
    textFont('monospace', 18); // Simple, clear font
    textAlign(CENTER, CENTER);
    resetGame();
}

function resetGame() {
    score = 0;
    gameSpeed = initialGameSpeed;
    
    penguin = {
        x: canvasWidth / 4,
        y: PENGUIN_GROUND_Y,
        vy: 0, // velocity y
        width: PENGUIN_WIDTH,
        height: PENGUIN_HEIGHT,
        onGround: true
    };

    obstacles = [];
    scheduleNextObstacle();

    // Initialize background elements
    bgElements = [];
    for (let i = 0; i < NUM_BG_LAYERS; i++) {
        let layerSpeedFactor = 0.2 + i * 0.2; // Slower layers are further back
        let elementHeight = 50 + i * 30;
        let yPos = canvasHeight - 50 - elementHeight / 2 + (i * 10); // Stagger slightly
        
        // Pre-populate with some elements
        for (let j = 0; j < 5; j++) {
            bgElements.push({
                x: j * (canvasWidth / 3 + random(-50, 50)),
                y: yPos,
                width: random(100, 250),
                height: elementHeight,
                color: BG_COLORS[i],
                speedFactor: layerSpeedFactor
            });
        }
    }
    
    // Wait a bit before first obstacle if starting fresh
    if (gameState === 'GAME_OVER' || gameState === 'START') {
       // nextObstacleSpawnFrame += 60; // Delay first obstacle a bit on restart
    }
    if (gameState !== 'PLAYING') { // To avoid resetting if called mid-game
         gameState = 'START';
    }
}

function scheduleNextObstacle() {
    nextObstacleSpawnFrame = frameCount + floor(random(obstacleSpawnIntervalMin, obstacleSpawnIntervalMax) / (gameSpeed / initialGameSpeed));
}

function keyPressed() {
    if (gameState === 'START') {
        if (key === ' ' || keyCode === 32) {
            gameState = 'PLAYING';
            resetGame(); // Reset player position and obstacles for a fresh start
            scheduleNextObstacle(); // Schedule first obstacle
        }
    } else if (gameState === 'PLAYING') {
        if ((key === ' ' || keyCode === 32 || keyCode === UP_ARROW) && penguin.onGround) {
            penguin.vy = JUMP_FORCE;
            penguin.onGround = false;
        }
    } else if (gameState === 'GAME_OVER') {
        if (key === 'r' || key === 'R') {
            resetGame();
            gameState = 'START'; // Go back to start screen
        }
    }
}

function drawBackground() {
    background(255, 220, 100); // Main interesting yellow

    // Draw parallax background elements
    for (let el of bgElements) {
        fill(el.color[0], el.color[1], el.color[2]);
        noStroke();
        // Simple rounded hill shapes
        rect(el.x, el.y - el.height / 2, el.width, el.height, 10);
        
        if (gameState === 'PLAYING') {
            el.x -= gameSpeed * el.speedFactor;
        }
    }

    // Re-spawn background elements that go off-screen
    if (gameState === 'PLAYING') {
        for (let i = bgElements.length - 1; i >= 0; i--) {
            if (bgElements[i].x + bgElements[i].width < 0) {
                bgElements[i].x = canvasWidth + random(50, 150);
                // Optionally, slightly change width/height for variety
                bgElements[i].width = random(100, 250);
            }
        }
    }


    // Ground line
    stroke(100, 80, 30); // Darker brown
    strokeWeight(10);
    line(0, canvasHeight - 45, canvasWidth, canvasHeight - 45);
    noStroke();
}

function drawPenguin() {
    push();
    translate(penguin.x, penguin.y);

    // Body (Black)
    fill(20, 20, 30); 
    rectMode(CENTER);
    rect(0, 0, penguin.width, penguin.height, 5); // Main body, slightly rounded

    // Belly (White)
    fill(240, 240, 250);
    rect(0, penguin.height * 0.05, penguin.width * 0.7, penguin.height * 0.8, 5);

    // Eyes (White with Black pupils)
    fill(255);
    ellipse(-penguin.width * 0.2, -penguin.height * 0.25, 8, 10);
    ellipse(penguin.width * 0.2, -penguin.height * 0.25, 8, 10);
    fill(0);
    ellipse(-penguin.width * 0.2, -penguin.height * 0.25, 3, 4);
    ellipse(penguin.width * 0.2, -penguin.height * 0.25, 3, 4);

    // Beak (Orange/Yellow)
    fill(255, 165, 0);
    triangle(
        0, -penguin.height * 0.1,
        penguin.width * 0.3, -penguin.height * 0.05,
        0, 0
    );

    // Feet (Orange/Yellow) - simple nubs
    rect(-penguin.width * 0.25, penguin.height * 0.5, 10, 5, 2);
    rect(penguin.width * 0.25, penguin.height * 0.5, 10, 5, 2);
    
    // Simple wing flap based on jump
    let wingAngle = penguin.onGround ? 0 : -PI / 6;
    fill(30,30,40);
    push();
    translate(-penguin.width * 0.45, -penguin.height * 0.1);
    rotate(wingAngle);
    ellipse(0,0, penguin.width*0.3, penguin.height*0.5);
    pop();
    push();
    translate(penguin.width * 0.45, -penguin.height * 0.1);
    rotate(-wingAngle);
    ellipse(0,0, penguin.width*0.3, penguin.height*0.5);
    pop();


    rectMode(CORNER); // Reset rectMode
    pop();
}

function updatePenguin() {
    penguin.vy += GRAVITY;
    penguin.y += penguin.vy;

    if (penguin.y + penguin.height / 2 >= PENGUIN_GROUND_Y + penguin.height / 2) {
        penguin.y = PENGUIN_GROUND_Y;
        penguin.vy = 0;
        penguin.onGround = true;
    }
}

function spawnObstacle() {
    let h = random(minObstacleHeight, maxObstacleHeight);
    obstacles.push({
        x: canvasWidth,
        y: canvasHeight - 50 - h, // Align with ground
        width: obstacleWidth,
        height: h,
        color: color(173, 216, 230, 200) // Light blue, semi-transparent for ice
    });
    scheduleNextObstacle();
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++; // Score for successfully passing an obstacle
        }
    }
    if (frameCount >= nextObstacleSpawnFrame) {
        spawnObstacle();
    }
}

function drawObstacles() {
    for (let obs of obstacles) {
        fill(obs.color);
        stroke(100,150,200); // Darker blue outline for definition
        strokeWeight(2);
        rect(obs.x, obs.y, obs.width, obs.height, 3); // Slightly rounded ice block
    }
    noStroke();
}

function checkCollisions() {
    for (let obs of obstacles) {
        // Simple AABB collision detection
        // Penguin's bounding box (simplified)
        let pLeft = penguin.x - penguin.width / 2;
        let pRight = penguin.x + penguin.width / 2;
        let pTop = penguin.y - penguin.height / 2;
        let pBottom = penguin.y + penguin.height / 2;

        // Obstacle's bounding box
        let oLeft = obs.x;
        let oRight = obs.x + obs.width;
        let oTop = obs.y;
        let oBottom = obs.y + obs.height;
        
        // Add a little tolerance for "pixel perfect" feel
        let collisionTolerance = 5; 

        if (pRight - collisionTolerance > oLeft && 
            pLeft + collisionTolerance < oRight && 
            pBottom - collisionTolerance > oTop && 
            pTop + collisionTolerance < oBottom) {
            gameState = 'GAME_OVER';
        }
    }
}

function increaseDifficulty() {
    if (gameSpeed < maxGameSpeed) {
        gameSpeed += speedIncreaseFactor;
    }
     // Could also decrease obstacleSpawnIntervalMin/Max over time if desired
}

function drawUI() {
    fill(0, 0, 0, 150); // Semi-transparent black for text background
    noStroke();
    
    if (gameState === 'START') {
        rect(canvasWidth/2 - 150, canvasHeight/2 - 50, 300, 100, 10);
        fill(255);
        textSize(24);
        text("Pixel Penguin Dash", canvasWidth / 2, canvasHeight / 2 - 15);
        textSize(16);
        text("Press [SPACE] to Start", canvasWidth / 2, canvasHeight / 2 + 20);
    } else if (gameState === 'PLAYING') {
        fill(255);
        textSize(20);
        textAlign(LEFT, TOP);
        text("Score: " + score, 10, 10);
        textAlign(CENTER, CENTER); // Reset
    } else if (gameState === 'GAME_OVER') {
        rect(canvasWidth/2 - 150, canvasHeight/2 - 70, 300, 140, 10);
        fill(255, 100, 100); // Reddish for game over
        textSize(32);
        text("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 30);
        fill(255);
        textSize(20);
        text("Final Score: " + score, canvasWidth / 2, canvasHeight / 2 + 10);
        textSize(16);
        text("Press [R] to Restart", canvasWidth / 2, canvasHeight / 2 + 40);
    }
}

function draw() {
    drawBackground();

    if (gameState === 'START') {
        // Penguin is static on start screen or could be animated
        drawPenguin(); 
        drawObstacles(); // Draw static obstacles if any were left from previous game over
    } else if (gameState === 'PLAYING') {
        updatePenguin();
        updateObstacles();
        checkCollisions(); // Check collisions after updates
        increaseDifficulty();
        
        drawPenguin();
        drawObstacles();
    } else if (gameState === 'GAME_OVER') {
        // Draw the scene as it was at game over
        drawPenguin();
        drawObstacles();
    }
    
    drawUI(); // Draw UI on top of everything
}