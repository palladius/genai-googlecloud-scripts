<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dino Run: Pixel Horizon</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #222;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        canvas {
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
<script>
    let dino;
    let obstacles = [];
    let clouds = [];
    let mountains = [];
    let particles = [];
    
    let gravity = 0.6;
    let gameSpeed = 6;
    let score = 0;
    let highScore = 0;
    
    let gameState = 'START'; // START, PLAYING, GAMEOVER
    let groundHeight = 100;
    
    // Aesthetic variables
    let skyColor;
    let groundColor;
    let pixelSize = 4; // Scale for pixel art
    let time = 0;
    
    function setup() {
        createCanvas(windowWidth, windowHeight);
        
        resetGame();
        
        // Initialize background elements
        for (let i = 0; i < 5; i++) {
            clouds.push(new Cloud(random(width), random(50, 200)));
        }
        
        // Generate mountain range
        let x = 0;
        while(x < width * 2) {
            let w = random(100, 300);
            mountains.push(new Mountain(x, height - groundHeight, w));
            x += w - random(50); // Overlap
        }
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        // Re-adjust ground dependent objects if needed
        groundHeight = 100;
    }

    function resetGame() {
        dino = new Dino();
        obstacles = [];
        score = 0;
        gameSpeed = 6;
        time = 0;
    }

    function draw() {
        // --- Day/Night Cycle Logic ---
        time += 0.05;
        // Interpolate sky color based on sine wave of time
        let r = map(sin(time * 0.01), -1, 1, 10, 135);
        let g = map(sin(time * 0.01), -1, 1, 10, 206);
        let b = map(sin(time * 0.01), -1, 1, 40, 235);
        skyColor = color(r, g, b);
        
        background(skyColor);

        // --- Draw Background Layers ---
        drawSunMoon();
        
        // Update and draw mountains (Parallax)
        push();
        translate(0, 50); // Push mountains down a bit
        for (let m of mountains) {
            m.update();
            m.show();
        }
        pop();

        // Update and draw clouds
        for (let c of clouds) {
            c.update();
            c.show();
        }

        // --- Draw Ground ---
        noStroke();
        fill(50); // Dark ground
        rect(0, height - groundHeight, width, groundHeight);
        
        // Ground detail (scrolling line)
        stroke(100);
        strokeWeight(2);
        line(0, height - groundHeight + 5, width, height - groundHeight + 5);

        // --- Game Logic ---
        if (gameState === 'START') {
            drawStartScreen();
        } else if (gameState === 'PLAYING') {
            playGame();
        } else if (gameState === 'GAMEOVER') {
            playGame(); // Keep drawing the game frozen or moving slightly
            drawGameOverScreen();
        }
    }
    
    function drawSunMoon() {
        let cx = width - 100;
        let cy = 100;
        
        // Sun
        let sunY = map(sin(time * 0.01), -1, 1, height + 100, 100);
        let moonY = map(sin(time * 0.01), -1, 1, 100, height + 100);
        
        noStroke();
        
        // Sun glow
        fill(255, 200, 0, 50);
        circle(cx, sunY, 60);
        fill(255, 255, 0);
        circle(cx, sunY, 40);

        // Moon
        fill(200, 200, 255);
        circle(cx - 200, moonY, 30);
        fill(skyColor); // Crater cutout effect
        circle(cx - 190, moonY - 5, 25);
    }

    function playGame() {
        // Spawning Obstacles
        if (frameCount % 60 === 0 && random(1) < 0.6) {
             // Don't spawn if too close to another
             let safe = true;
             for(let obs of obstacles) {
                 if(width - obs.pos.x < 300) safe = false;
             }
             if(safe) {
                obstacles.push(new Obstacle());
             }
        }

        // Update Dino
        dino.update();
        dino.show();

        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].show();

            if (obstacles[i].hits(dino)) {
                gameOver();
            }

            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
                score++;
                if (score % 5 === 0) gameSpeed += 0.2; // Increase difficulty
            }
        }
        
        // Particles (dust)
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].show();
            if (particles[i].finished()) {
                particles.splice(i, 1);
            }
        }

        drawUI();
    }

    function drawUI() {
        textAlign(LEFT);
        textSize(20);
        fill(255);
        noStroke();
        text("SCORE: " + score, 20, 30);
        text("HI: " + highScore, 20, 60);
        
        textAlign(RIGHT);
        text("SPEED: " + gameSpeed.toFixed(1), width - 20, 30);
    }

    function drawStartScreen() {
        dino.show(); // Show dino idle
        fill(0, 150);
        rect(0, 0, width, height);
        
        textAlign(CENTER);
        fill(255);
        textSize(40);
        text("PIXEL DINO RUN", width / 2, height / 2 - 20);
        textSize(20);
        text("Press SPACE or TAP to Start", width / 2, height / 2 + 30);
        
        textSize(14);
        fill(200);
        text("Jump over cacti. Don't hit the birds.", width / 2, height - 30);
    }

    function drawGameOverScreen() {
        fill(0, 150);
        rect(0, 0, width, height);
        
        textAlign(CENTER);
        fill(255, 100, 100);
        textSize(50);
        text("GAME OVER", width / 2, height / 2 - 20);
        
        fill(255);
        textSize(24);
        text("Score: " + score, width / 2, height / 2 + 40);
        text("Press SPACE to Restart", width / 2, height / 2 + 80);
    }

    function gameOver() {
        gameState = 'GAMEOVER';
        if (score > highScore) {
            highScore = score;
        }
        // Stop game speed visuals
        // but we leave objects in place to see what killed us
    }

    function keyPressed() {
        if (key === ' ' || keyCode === UP_ARROW) {
            handleInput();
        }
    }

    function mousePressed() {
        handleInput();
    }
    
    function touchStarted() {
        handleInput();
        return false; // Prevent scrolling
    }

    function handleInput() {
        if (gameState === 'START') {
            gameState = 'PLAYING';
            resetGame();
        } else if (gameState === 'PLAYING') {
            dino.jump();
        } else if (gameState === 'GAMEOVER') {
            gameState = 'PLAYING';
            resetGame();
        }
    }

    // --- Classes ---

    class Dino {
        constructor() {
            this.r = 50; // Size box
            this.pos = createVector(50, height - groundHeight - this.r);
            this.vel = createVector(0, 0);
            this.acc = createVector(0, 0);
            this.onGround = true;
            
            // Pixel Art Matrix (1 = colored pixel, 0 = transparent)
            // Simplified T-Rex
            this.pixels = [
                [0,0,0,0,1,1,1,1],
                [0,0,0,0,1,1,1,1],
                [0,0,0,0,1,1,0,0],
                [1,0,0,1,1,1,0,0],
                [1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,0,0,1,0,0], // Legs frame 1
                [0,0,1,1,0,0,0,0]  // Legs frame 2 logic handled below
            ];
            
            this.runFrame = 0;
            this.animTimer = 0;
        }

        update() {
            // Physics
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0); // Clear acc

            // Gravity
            if (!this.onGround) {
                this.vel.y += gravity;
            }

            // Floor collision
            if (this.pos.y > height - groundHeight - this.r) {
                this.pos.y = height - groundHeight - this.r;
                this.vel.y = 0;
                this.onGround = true;
                
                // Spawn dust particles when running
                if (frameCount % 10 === 0 && gameState === 'PLAYING') {
                     particles.push(new Particle(this.pos.x + 10, this.pos.y + this.r));
                }
            }
            
            // Animation timing
            if (this.onGround && gameState === 'PLAYING') {
                this.animTimer++;
                if (this.animTimer > 5) { // Switch frames every 5 ticks
                    this.runFrame = (this.runFrame + 1) % 2;
                    this.animTimer = 0;
                }
            } else {
                this.runFrame = 0; // Jump pose
            }
        }

        jump() {
            if (this.onGround) {
                this.vel.y = -13; // Jump force
                this.onGround = false;
                
                // Jump particles
                for(let i=0; i<5; i++) {
                    particles.push(new Particle(this.pos.x + 20, this.pos.y + this.r));
                }
            }
        }

        show() {
            fill(100, 255, 100); // Dino Green
            noStroke();
            
            let scale = 6; // Size of each "pixel"
            
            push();
            translate(this.pos.x, this.pos.y);
            
            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 8; x++) {
                    if (this.pixels[y][x] === 1) {
                         rect(x * scale, y * scale, scale, scale);
                    }
                }
            }
            
            // Draw Legs based on animation
            fill(100, 255, 100);
            if (this.runFrame === 0) {
                rect(2*scale, 7*scale, scale, scale);
                rect(5*scale, 7*scale, scale, scale);
            } else {
                rect(3*scale, 7*scale, scale, scale);
                rect(4*scale, 6*scale, scale, scale); // Back leg up
            }
            
            // Eye
            fill(0);
            rect(6*scale, 1*scale, scale/2, scale/2);
            
            pop();
        }
    }

    class Obstacle {
        constructor() {
            this.h = random(30, 60);
            this.w = 30;
            this.pos = createVector(width, height - groundHeight - this.h);
            this.type = random() > 0.8 ? 1 : 0; // 0 = Cactus, 1 = Flying Rock/Bird
            
            if (this.type === 1) {
                this.pos.y -= random(30, 80); // Fly in air
                this.h = 30;
            }
        }

        update() {
            if (gameState === 'PLAYING') {
                this.pos.x -= gameSpeed;
            }
        }

        show() {
            noStroke();
            if (this.type === 0) {
                // Cactus
                fill(34, 139, 34);
                // Main stem
                rect(this.pos.x + 10, this.pos.y, 10, this.h);
                // Arms
                rect(this.pos.x, this.pos.y + 10, 10, 10);
                rect(this.pos.x + 20, this.pos.y + 5, 10, 10);
            } else {
                // Flying enemy
                fill(200, 50, 50);
                rect(this.pos.x, this.pos.y, 30, 20);
                // Wing flap logic could go here
                fill(150, 0, 0);
                rect(this.pos.x - 5, this.pos.y + 5, 10, 10); // Wing
            }
        }

        offscreen() {
            return this.pos.x < -this.w;
        }

        hits(dino) {
            // Simple AABB Collision
            // Reduce hitbox slightly for fairness
            let dinoX = dino.pos.x + 10;
            let dinoY = dino.pos.y + 5;
            let dinoW = 30;
            let dinoH = 40;

            return (dinoX < this.pos.x + this.w &&
                    dinoX + dinoW > this.pos.x &&
                    dinoY < this.pos.y + this.h &&
                    dinoH + dinoY > this.pos.y);
        }
    }

    class Cloud {
        constructor(x, y) {
            this.pos = createVector(x, y);
            this.w = random(50, 100);
            this.h = random(20, 40);
            this.speed = random(0.5, 2);
            this.alpha = random(100, 200);
        }

        update() {
            if (gameState === 'PLAYING') {
                this.pos.x -= this.speed;
                if (this.pos.x < -this.w) {
                    this.pos.x = width;
                    this.pos.y = random(50, 200);
                }
            }
        }

        show() {
            noStroke();
            fill(255, this.alpha);
            ellipse(this.pos.x, this.pos.y, this.w, this.h);
            ellipse(this.pos.x + 20, this.pos.y - 10, this.w * 0.7, this.h * 0.8);
        }
    }
    
    class Mountain {
        constructor(x, y, w) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = random(100, 300);
            this.c = random(30, 60); // Dark color
            this.peaks = [];
            // Generate peak points
            let steps = 5;
            for(let i=0; i<=steps; i++) {
                this.peaks.push({
                    x: (w/steps) * i,
                    y: -noise(x + i*100) * this.h
                });
            }
        }
        
        update() {
             if (gameState === 'PLAYING') {
                // Parallax effect: moves slower than gameSpeed
                this.x -= gameSpeed * 0.2; 
                
                // Wrap around
                if (this.x < -this.w) {
                    this.x += width * 2; // Move to far right
                }
            }
        }
        
        show() {
            fill(this.c);
            noStroke();
            beginShape();
            vertex(this.x, this.y); // Bottom Left
            
            for(let p of this.peaks) {
                vertex(this.x + p.x, this.y + p.y);
            }
            
            vertex(this.x + this.w, this.y); // Bottom Right
            endShape(CLOSE);
        }
    }
    
    class Particle {
        constructor(x, y) {
            this.pos = createVector(x, y);
            this.vel = createVector(random(-1, 1), random(-1, -0.5));
            this.life = 255;
        }
        
        update() {
            this.pos.add(this.vel);
            this.life -= 10;
        }
        
        finished() {
            return this.life < 0;
        }
        
        show() {
            noStroke();
            fill(200, this.life);
            rect(this.pos.x, this.pos.y, 4, 4);
        }
    }
</script>
</body>
</html>