// ==========================================
// Single-File p5.js Pac-Man Clone
// Paste this entire code into the p5.js editor:
// https://editor.p5js.org/
// ==========================================

// === lib/colors.js ===
// Because life is better in color! 🌈
const COLORS = {
    BLACK: [0, 0, 0],
    YELLOW: [255, 255, 0],
    WHITE: [255, 255, 255],
    BLUE: [0, 0, 255],
    RED: [255, 0, 0],
    PINK: [255, 182, 193],
    CYAN: [0, 255, 255],
    ORANGE: [255, 165, 0],
    PELLET: [255, 184, 174], // A nice light pink/peach
    GHOST_VULNERABLE: [50, 50, 200],
    GHOST_VULNERABLE_BLINK: [200, 200, 200],
  };

  // Simple text styling helpers (p5 handles bold/underline directly)
  function applyTextColor(p, colorName = 'WHITE') {
    p.fill(...COLORS[colorName]);
  }

  function applyStrokeColor(p, colorName = 'WHITE') {
    p.stroke(...COLORS[colorName]);
  }

  function applyFillColor(p, colorName = 'WHITE') {
    p.fill(...COLORS[colorName]);
  }

  function applyNoFill(p) {
    p.noFill();
  }

  function applyNoStroke(p) {
    p.noStroke();
  }

  // === lib/constants.js ===
  // Magic numbers turned into named constants! ✨
  const TILE_SIZE = 20; // Size of each grid cell in pixels
  const PACMAN_SPEED = 2; // How many pixels Pac-Man moves per frame
  const GHOST_SPEED = 1.5; // Ghosts are slightly slower (usually!)
  const DOT_SIZE = 4; // Size of the regular pellets
  const POWER_PELLET_SIZE = 8; // Size of the power pellets

  const MAZE_WIDTH = 21; // Must be odd numbers usually work best
  const MAZE_HEIGHT = 21;

  // Game states
  const STATE_START = 'START';
  const STATE_PLAYING = 'PLAYING';
  const STATE_GAME_OVER = 'GAME_OVER';
  const STATE_WIN = 'WIN';

  // Directions (using objects for clarity)
  const DIR_STOP = { x: 0, y: 0, name: 'STOP' };
  const DIR_LEFT = { x: -1, y: 0, name: 'LEFT' };
  const DIR_RIGHT = { x: 1, y: 0, name: 'RIGHT' };
  const DIR_UP = { x: 0, y: -1, name: 'UP' };
  const DIR_DOWN = { x: 0, y: 1, name: 'DOWN' };
  const DIRECTIONS = [DIR_LEFT, DIR_RIGHT, DIR_UP, DIR_DOWN];

  // Maze tile types
  const TILE_WALL = 1;
  const TILE_EMPTY = 0;
  const TILE_DOT = 2;
  const TILE_POWER_PELLET = 3;

  const GHOST_VULNERABLE_DURATION = 300; // Frames ghost stays blue

  // === lib/utils.js ===
  // Handy helpers for our game logic 🛠️

  // Convert pixel coordinates to grid coordinates
  function getGridCoord(pixelCoord) {
    return Math.floor(pixelCoord / TILE_SIZE);
  }

  // Check if pixel coordinates are roughly centered in a tile
  function isCentered(pixelX, pixelY) {
      // Use the p5 instance 'this' if needed within classes, or pass 'p'
      const allowance = PACMAN_SPEED / 2; // Allow slight offset
      const centerX = (getGridCoord(pixelX) * TILE_SIZE) + TILE_SIZE / 2;
      const centerY = (getGridCoord(pixelY) * TILE_SIZE) + TILE_SIZE / 2;
      return Math.abs(pixelX - centerX) < allowance && Math.abs(pixelY - centerY) < allowance;
  }

  // Basic distance calculation (squared is faster if comparing)
  function distSq(x1, y1, x2, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  }

  // === lib/maze.js ===
  // Defines the playground 🗺️
  class Maze {
    constructor(p, width, height) {
      this.p = p; // Store the p5 instance
      this.width = width;
      this.height = height;
      this.grid = this.createSimpleMaze(width, height);
      this.dotsRemaining = 0;
      this.countInitialDots();
    }

    // Creates a very basic maze with borders and some obstacles
    createSimpleMaze(w, h) {
      let newGrid = Array(h).fill(0).map(() => Array(w).fill(TILE_EMPTY));

      // Borders
      for (let y = 0; y < h; y++) {
        newGrid[y][0] = TILE_WALL;
        newGrid[y][w - 1] = TILE_WALL;
      }
      for (let x = 0; x < w; x++) {
        newGrid[0][x] = TILE_WALL;
        newGrid[h - 1][x] = TILE_WALL;
      }

      // Some inner walls (example) - Make it slightly more complex
      newGrid[2][2] = TILE_WALL; newGrid[2][3] = TILE_WALL; newGrid[2][4] = TILE_WALL;
      newGrid[3][2] = TILE_WALL; newGrid[4][2] = TILE_WALL; newGrid[4][4] = TILE_WALL;
      newGrid[4][5] = TILE_WALL; newGrid[4][6] = TILE_WALL; newGrid[3][6] = TILE_WALL; newGrid[2][6] = TILE_WALL;


      newGrid[2][w-3] = TILE_WALL; newGrid[2][w-4] = TILE_WALL; newGrid[2][w-5] = TILE_WALL;
      newGrid[3][w-3] = TILE_WALL; newGrid[4][w-3] = TILE_WALL; newGrid[4][w-5] = TILE_WALL;
      newGrid[4][w-6] = TILE_WALL; newGrid[4][w-7] = TILE_WALL; newGrid[3][w-7] = TILE_WALL; newGrid[2][w-7] = TILE_WALL;

      // Bottom obstacles
      newGrid[h-3][2] = TILE_WALL; newGrid[h-3][3] = TILE_WALL; newGrid[h-3][4] = TILE_WALL;
      newGrid[h-4][4] = TILE_WALL; newGrid[h-5][4] = TILE_WALL;

      newGrid[h-3][w-3] = TILE_WALL; newGrid[h-3][w-4] = TILE_WALL; newGrid[h-3][w-5] = TILE_WALL;
      newGrid[h-4][w-5] = TILE_WALL; newGrid[h-5][w-5] = TILE_WALL;

      // Center obstacle (example)
       newGrid[Math.floor(h/2)-1][Math.floor(w/2)-2] = TILE_WALL;
       newGrid[Math.floor(h/2)-1][Math.floor(w/2)-1] = TILE_WALL;
       newGrid[Math.floor(h/2)-1][Math.floor(w/2)] = TILE_WALL;
       newGrid[Math.floor(h/2)-1][Math.floor(w/2)+1] = TILE_WALL;
       newGrid[Math.floor(h/2)-1][Math.floor(w/2)+2] = TILE_WALL;
       newGrid[Math.floor(h/2)][Math.floor(w/2)-2] = TILE_WALL;
       newGrid[Math.floor(h/2)][Math.floor(w/2)+2] = TILE_WALL;
       newGrid[Math.floor(h/2)+1][Math.floor(w/2)-2] = TILE_WALL;
       newGrid[Math.floor(h/2)+1][Math.floor(w/2)-1] = TILE_WALL;
       newGrid[Math.floor(h/2)+1][Math.floor(w/2)] = TILE_WALL;
       newGrid[Math.floor(h/2)+1][Math.floor(w/2)+1] = TILE_WALL;
       newGrid[Math.floor(h/2)+1][Math.floor(w/2)+2] = TILE_WALL;


      // Add dots and power pellets
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          if (newGrid[y][x] === TILE_EMPTY) {
              newGrid[y][x] = TILE_DOT;
          }
        }
      }

       // Place Power Pellets
       newGrid[3][3] = TILE_POWER_PELLET;
       newGrid[3][w-4] = TILE_POWER_PELLET;
       newGrid[h-4][3] = TILE_POWER_PELLET;
       newGrid[h-4][w-4] = TILE_POWER_PELLET;


      // Clear starting positions (example)
      newGrid[Math.floor(h / 2)+2][Math.floor(w / 2)] = TILE_EMPTY; // Pacman start below center box
      // Ghost start area (inside the center box maybe?)
      newGrid[Math.floor(h/2)][Math.floor(w/2)-1] = TILE_EMPTY;
      newGrid[Math.floor(h/2)][Math.floor(w/2)] = TILE_EMPTY;
      newGrid[Math.floor(h/2)][Math.floor(w/2)+1] = TILE_EMPTY;


      return newGrid;
    }

    countInitialDots() {
      this.dotsRemaining = 0;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.grid[y][x] === TILE_DOT || this.grid[y][x] === TILE_POWER_PELLET) {
            this.dotsRemaining++;
          }
        }
      }
      console.log("Initial dots: " + this.dotsRemaining);
    }

    getTile(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return TILE_WALL; // Treat out of bounds as a wall
      }
      return this.grid[y][x];
    }

    isWall(x, y) {
      return this.getTile(x, y) === TILE_WALL;
    }

    eatDot(x, y) {
        const tile = this.getTile(x, y);
        if (tile === TILE_DOT || tile === TILE_POWER_PELLET) {
            this.grid[y][x] = TILE_EMPTY; // Remove the dot/pellet
            this.dotsRemaining--;
            return tile; // Return type of pellet eaten
        }
        return TILE_EMPTY; // Nothing was eaten
    }

    draw() {
      this.p.push();
      applyNoStroke(this.p);
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tileType = this.grid[y][x];
          const drawX = x * TILE_SIZE;
          const drawY = y * TILE_SIZE;

          if (tileType === TILE_WALL) {
            applyFillColor(this.p, 'BLUE');
            this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          } else if (tileType === TILE_DOT) {
            applyFillColor(this.p, 'PELLET');
            this.p.ellipse(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, DOT_SIZE, DOT_SIZE);
          } else if (tileType === TILE_POWER_PELLET) {
            applyFillColor(this.p, 'WHITE');
            // Simple blinking effect
            if (this.p.frameCount % 20 < 10) {
               this.p.ellipse(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, POWER_PELLET_SIZE, POWER_PELLET_SIZE);
            }
          }
        }
      }
      this.p.pop();
    }
  }

  // === lib/pacman.js ===
  // Our hungry hero! 🟡
  class Pacman {
    constructor(p, startX, startY, maze) {
      this.p = p; // Store p5 instance
      this.maze = maze;
      this.startX = startX; // Store initial position
      this.startY = startY;
      this.x = startX * TILE_SIZE + TILE_SIZE / 2; // Start in center of tile
      this.y = startY * TILE_SIZE + TILE_SIZE / 2;
      this.size = TILE_SIZE * 0.8;
      this.direction = DIR_STOP;
      this.nextDirection = DIR_STOP;
      this.mouthAngle = 0.1; // Controls how open the mouth is
      this.mouthAngleSpeed = 0.05;
      this.score = 0;
      this.lives = 3;
    }

    setDirection(newDirection) {
       this.nextDirection = newDirection;
    }

    // Check if the path is clear in a given direction from current *grid* location
    _canMove(dir) {
      if (dir === DIR_STOP) return false;
      const currentGridX = getGridCoord(this.x);
      const currentGridY = getGridCoord(this.y);
      const nextGridX = currentGridX + dir.x;
      const nextGridY = currentGridY + dir.y;
      return !this.maze.isWall(nextGridX, nextGridY);
    }


    update() {
      // --- Handle Direction Change ---
      if (isCentered(this.x, this.y)) {
          if (this.nextDirection !== DIR_STOP && this._canMove(this.nextDirection)) {
              this.direction = this.nextDirection;
              this.nextDirection = DIR_STOP; // Reset queued direction
          }
          // If the intended direction is blocked, check if current one is too
          else if (!this._canMove(this.direction)) {
               this.direction = DIR_STOP; // Hit a wall
          }
      }

      // --- Move Pacman ---
      if (this.direction !== DIR_STOP) {
          // Check if the next *pixel* position would cross into a wall tile
          const nextPixelX = this.x + this.direction.x * PACMAN_SPEED;
          const nextPixelY = this.y + this.direction.y * PACMAN_SPEED;
          const currentGridX = getGridCoord(this.x);
          const currentGridY = getGridCoord(this.y);

          // Need to look slightly ahead based on direction to detect wall collision *before* entering tile
          const lookAheadFactor = TILE_SIZE / 2 - 1; // Check just before center
          const checkX = this.x + this.direction.x * lookAheadFactor;
          const checkY = this.y + this.direction.y * lookAheadFactor;
          const nextGridX = getGridCoord(checkX) + this.direction.x;
          const nextGridY = getGridCoord(checkY) + this.direction.y;


          if (this.maze.isWall(nextGridX, nextGridY) && !isCentered(this.x, this.y)) {
               // Approaching a wall, snap to center of current tile and stop
               this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2;
               this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2;
               this.direction = DIR_STOP;
          } else if (!this.maze.isWall(currentGridX + this.direction.x, currentGridY + this.direction.y) || !isCentered(this.x,this.y)) {
              // Only move if the next tile isn't a wall OR we aren't centered (already mid-transit)
              this.x += this.direction.x * PACMAN_SPEED;
              this.y += this.direction.y * PACMAN_SPEED;
          } else {
               this.direction = DIR_STOP; // Landed centered, facing a wall
          }
      }


      // --- Wrap Around Tunnels (Example: Left/Right edges) ---
      const currentGridX = getGridCoord(this.x);
      if (this.x < -TILE_SIZE / 2 && this.direction === DIR_LEFT) { // Gone fully off left edge
        this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2; // Appear on right edge
      } else if (this.x > this.maze.width * TILE_SIZE - TILE_SIZE / 2 && this.direction === DIR_RIGHT) { // Gone fully off right edge
        this.x = -TILE_SIZE / 2; // Appear on left edge
      }
      // Add similar logic for Y if you have vertical tunnels

      // --- Animate Mouth ---
      if (this.direction !== DIR_STOP) {
        this.mouthAngle += this.mouthAngleSpeed;
        if (this.mouthAngle > this.p.PI / 4 || this.mouthAngle < 0.05) {
          this.mouthAngleSpeed *= -1;
        }
      } else {
          this.mouthAngle = 0.1; // Keep mouth slightly open when stopped
      }


      // --- Eat Dots ---
      this.eat();
    }

    eat() {
        if (isCentered(this.x, this.y)){ // Only eat when centered
          const gridX = getGridCoord(this.x);
          const gridY = getGridCoord(this.y);
          const eatenPelletType = this.maze.eatDot(gridX, gridY);

          if (eatenPelletType === TILE_DOT) {
              this.score += 10;
          } else if (eatenPelletType === TILE_POWER_PELLET) {
              this.score += 50;
              // Use the globally accessible game instance
              if (window.game) {
                  window.game.activatePowerPellet();
              } else {
                  console.error("Game instance not found for power pellet!");
              }
          }
        }
    }

     loseLife() {
          this.lives--;
          // Reset position to start
          this.x = this.startX * TILE_SIZE + TILE_SIZE / 2;
          this.y = this.startY * TILE_SIZE + TILE_SIZE / 2;
          this.direction = DIR_STOP;
          this.nextDirection = DIR_STOP;
          // Could add a brief pause or invulnerability here
     }

    getGridPos() {
        return { x: getGridCoord(this.x) , y: getGridCoord(this.y) };
    }

    draw() {
      this.p.push();
      applyFillColor(this.p, 'YELLOW');
      applyNoStroke(this.p);

      this.p.translate(this.x, this.y); // Move origin to pacman's center

      // Determine rotation based on current or intended direction
      let angle = 0;
      let facingDir = this.direction;
      if (facingDir === DIR_STOP && this.nextDirection !== DIR_STOP) {
          facingDir = this.nextDirection; // Face intended direction if stopped
      }

      if (facingDir === DIR_RIGHT) {
        angle = 0;
      } else if (facingDir === DIR_LEFT) {
        angle = this.p.PI;
      } else if (facingDir === DIR_UP) {
        angle = -this.p.PI / 2;
      } else if (facingDir === DIR_DOWN) {
        angle = this.p.PI / 2;
      }
       this.p.rotate(angle);


      // Draw Pac-Man shape (arc)
      this.p.arc(0, 0, this.size, this.size, this.mouthAngle, -this.mouthAngle, this.p.PIE);

      this.p.pop(); // Restore previous drawing state
    }
  }


  // === lib/ghost.js ===
  // The spooky adversaries! 👻
  const GHOST_STATE_NORMAL = 'NORMAL';
  const GHOST_STATE_VULNERABLE = 'VULNERABLE'; // Blue!
  const GHOST_STATE_EATEN = 'EATEN'; // Just eyes, returning home

  class Ghost {
    constructor(p, startX, startY, maze, colorName = 'RED') {
      this.p = p; // Store p5 instance
      this.maze = maze;
      this.startX = startX; // For respawning
      this.startY = startY;
      this.x = startX * TILE_SIZE + TILE_SIZE / 2;
      this.y = startY * TILE_SIZE + TILE_SIZE / 2;
      this.size = TILE_SIZE * 0.8;
      this.direction = this._getRandomInitialDirection(); // Start moving
      this.colorName = colorName;
      this.state = GHOST_STATE_NORMAL;
      this.vulnerableTimer = 0;
      this.speed = GHOST_SPEED;
    }

    _getRandomInitialDirection() {
        const possibleDirs = DIRECTIONS.filter(dir => this._canMove(dir));
        if (possibleDirs.length > 0) {
            // Prefer horizontal start? Or just random valid.
            const horizontal = possibleDirs.filter(d => d.x !== 0);
            if(horizontal.length > 0) return this.p.random(horizontal);
            return this.p.random(possibleDirs);
        }
        return DIR_STOP; // Should only happen if spawned in a wall
    }

    _canMove(dir) {
        if (dir === DIR_STOP) return false;
        const currentGridX = getGridCoord(this.x);
        const currentGridY = getGridCoord(this.y);
        const nextGridX = currentGridX + dir.x;
        const nextGridY = currentGridY + dir.y;
        // Check specifically for walls (allow moving into empty/dots etc.)
        return this.maze.getTile(nextGridX, nextGridY) !== TILE_WALL;
    }

    makeVulnerable() {
        if (this.state !== GHOST_STATE_EATEN) {
           this.state = GHOST_STATE_VULNERABLE;
           this.vulnerableTimer = GHOST_VULNERABLE_DURATION;
           this.speed = GHOST_SPEED * 0.6; // Slow down when vulnerable
           // Reverse direction immediately (classic behavior)
           const opposite = this._getOppositeDirection(this.direction);
           if (this._canMove(opposite)) { // Only reverse if possible
                this.direction = opposite;
           } else {
               // If can't reverse, pick another random valid direction
               this.direction = this._chooseNewDirection(window.game?.pacman); // Need pacman ref ideally
           }

        }
    }

    _getOppositeDirection(dir) {
        if (dir === DIR_LEFT) return DIR_RIGHT;
        if (dir === DIR_RIGHT) return DIR_LEFT;
        if (dir === DIR_UP) return DIR_DOWN;
        if (dir === DIR_DOWN) return DIR_UP;
        return DIR_STOP; // Should not happen with valid directions
    }


    update(pacman) { // Ghosts need to know where Pac-Man is!

      // --- Update State Timer ---
      if (this.state === GHOST_STATE_VULNERABLE) {
          this.vulnerableTimer--;
          if (this.vulnerableTimer <= 0) {
              this.state = GHOST_STATE_NORMAL;
              this.speed = GHOST_SPEED;
          }
      }

      // --- Movement Logic ---
      if (isCentered(this.x, this.y)) {
        // At an intersection (or center of a tile) - decide new direction
        const newDir = this._chooseNewDirection(pacman);
         if (newDir !== DIR_STOP) {
             this.direction = newDir;
         } else if (!this._canMove(this.direction)) {
              // If choice is STOP and current dir is blocked, pick random valid
              const possibleDirs = DIRECTIONS.filter(dir => this._canMove(dir) && dir !== this._getOppositeDirection(this.direction));
               this.direction = this.p.random(possibleDirs.length > 0 ? possibleDirs : [this._getOppositeDirection(this.direction)]);
         }
         // else continue in the current direction if the choice was STOP but current is valid
      }

      // --- Move Ghost ---
      if (this.direction !== DIR_STOP) {
          // Check for wall collision before moving
          const nextPixelX = this.x + this.direction.x * this.speed;
          const nextPixelY = this.y + this.direction.y * this.speed;
          const currentGridX = getGridCoord(this.x);
          const currentGridY = getGridCoord(this.y);

          // Look ahead check (similar to pacman but uses ghost speed)
          const lookAheadFactor = TILE_SIZE / 2 - 1;
          const checkX = this.x + this.direction.x * lookAheadFactor;
          const checkY = this.y + this.direction.y * lookAheadFactor;
          const nextGridX = getGridCoord(checkX) + this.direction.x;
          const nextGridY = getGridCoord(checkY) + this.direction.y;


           if (this.maze.isWall(nextGridX, nextGridY) && !isCentered(this.x, this.y)) {
               // Approaching a wall, snap to center and choose new direction next frame
               this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2;
               this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2;
               // Don't set direction to STOP, let the intersection logic handle it
           } else {
              // Move normally
              this.x += this.direction.x * this.speed;
              this.y += this.direction.y * this.speed;
           }
      }


       // --- Wrap Around Tunnels ---
       if (this.x < -TILE_SIZE / 2 && this.direction === DIR_LEFT) {
          this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2;
       } else if (this.x > this.maze.width * TILE_SIZE - TILE_SIZE / 2 && this.direction === DIR_RIGHT) {
          this.x = -TILE_SIZE / 2;
       }

       // --- Respawn logic ---
       if (this.state === GHOST_STATE_EATEN) {
           const gridX = getGridCoord(this.x);
           const gridY = getGridCoord(this.y);
           // Check if *approximately* at the start position
           if (Math.abs(this.x - (this.startX * TILE_SIZE + TILE_SIZE / 2)) < this.speed &&
               Math.abs(this.y - (this.startY * TILE_SIZE + TILE_SIZE / 2)) < this.speed)
           {
                this.state = GHOST_STATE_NORMAL; // Respawn!
                this.speed = GHOST_SPEED;
                this.x = this.startX * TILE_SIZE + TILE_SIZE / 2; // Reset position exactly
                this.y = this.startY * TILE_SIZE + TILE_SIZE / 2;
                this.direction = this._getRandomInitialDirection(); // Get moving again
           }
       }
    }

    // The "AI" part - decides where to go next when at a grid center
    _chooseNewDirection(pacman) {
      const possibleDirs = [];
      const oppositeDir = this._getOppositeDirection(this.direction);

      // Find all valid directions except turning back (unless necessary)
      DIRECTIONS.forEach(dir => {
        if (this._canMove(dir)) {
          possibleDirs.push(dir);
        }
      });

      let forwardDirs = possibleDirs.filter(dir => dir !== oppositeDir);

      if (forwardDirs.length === 0) {
          // Must turn back if no other option (dead end)
          if (possibleDirs.includes(oppositeDir)) return oppositeDir;
          else return DIR_STOP; // Completely stuck!
      }

      // --- AI Strategy based on State ---
      let targetX, targetY;
      let chosenDir = this.p.random(forwardDirs); // Default: random forward direction

      if (!pacman) return chosenDir; // Cannot target if pacman doesn't exist

      if (this.state === GHOST_STATE_EATEN) {
          // Target: Respawn point
          targetX = this.startX * TILE_SIZE + TILE_SIZE/2;
          targetY = this.startY * TILE_SIZE + TILE_SIZE/2;
          this.speed = GHOST_SPEED * 2; // Go fast when returning
      } else if (this.state === GHOST_STATE_VULNERABLE) {
          // Target: Run away! Maximize distance from Pacman (simplistic: random)
          // For slightly better fleeing, choose the direction that leads *further* from pacman
          let maxDistSq = -1;
          const currentGridX = getGridCoord(this.x);
          const currentGridY = getGridCoord(this.y);
          forwardDirs.forEach(dir => {
              const nextGridX = currentGridX + dir.x;
              const nextGridY = currentGridY + dir.y;
              const dSq = distSq(nextGridX * TILE_SIZE, nextGridY * TILE_SIZE, pacman.x, pacman.y);
               if (dSq > maxDistSq) {
                   maxDistSq = dSq;
                   chosenDir = dir;
               }
          });
          return chosenDir;

      } else { // GHOST_STATE_NORMAL - Chase Pac-Man
          targetX = pacman.x;
          targetY = pacman.y;
          this.speed = GHOST_SPEED;
      }

      // Choose direction that minimizes distance to target (simple greedy approach)
      let minDistSq = Infinity;
      const currentGridX = getGridCoord(this.x);
      const currentGridY = getGridCoord(this.y);

      forwardDirs.forEach(dir => {
        const nextGridX = currentGridX + dir.x;
        const nextGridY = currentGridY + dir.y;
        // Calculate distance from the *center* of the next tile to the target
        const nextCenterX = nextGridX * TILE_SIZE + TILE_SIZE / 2;
        const nextCenterY = nextGridY * TILE_SIZE + TILE_SIZE / 2;
        const dSq = distSq(nextCenterX, nextCenterY, targetX, targetY);

        if (dSq < minDistSq) {
          minDistSq = dSq;
          chosenDir = dir;
        }
      });

      return chosenDir;
    }


    getGridPos() {
        // More robust grid position check, especially during turns
         const centerX = this.x - (this.direction.x * this.speed / 2); // Adjust slightly back towards center
         const centerY = this.y - (this.direction.y * this.speed / 2);
        return { x: getGridCoord(centerX) , y: getGridCoord(centerY) };
    }


    gotEaten() {
       if (this.state === GHOST_STATE_VULNERABLE) {
           this.state = GHOST_STATE_EATEN;
           // Score is handled by the Game class
           return true;
       }
       return false;
    }

    draw() {
      this.p.push();
      applyNoStroke(this.p);

      let bodyColor;
      let eyeColor = COLORS.WHITE;
      let pupilColor = COLORS.BLACK;

      if (this.state === GHOST_STATE_VULNERABLE) {
          bodyColor = (this.vulnerableTimer < 100 && this.p.frameCount % 20 < 10)
                       ? COLORS.GHOST_VULNERABLE_BLINK
                       : COLORS.GHOST_VULNERABLE;
      } else if (this.state === GHOST_STATE_EATEN) {
           bodyColor = null; // No body, just eyes
           // Maybe make eyes look scared or different?
      } else {
          bodyColor = COLORS[this.colorName];
      }

      // Draw Body (if not eaten)
      if (bodyColor) {
          this.p.fill(bodyColor);
          // Combined shape: rectangle base + ellipse top
          const bodyHeight = this.size * 0.7;
          const feetY = this.y + bodyHeight / 2 - this.size * 0.1; // Position for feet start
          this.p.ellipse(this.x, this.y - bodyHeight / 4, this.size, this.size * 0.8); // Top dome
          this.p.rect(this.x - this.size / 2, this.y - bodyHeight / 4, this.size, bodyHeight * 0.8); // Main body rect

          // Simple wavy bottom
           const waveW = this.size / 3;
           const waveH = this.size * 0.2;
           this.p.ellipse(this.x - waveW, feetY, waveW, waveH);
           this.p.ellipse(this.x, feetY, waveW, waveH);
           this.p.ellipse(this.x + waveW, feetY, waveW, waveH);
      }

      // Draw Eyes
      this.p.fill(eyeColor);
      const eyeSize = this.size * 0.25;
      const eyeOffsetY = this.state === GHOST_STATE_EATEN ? 0 : -this.size * 0.1;
      const eyeOffsetX = this.size * 0.2;

      const leftEyeX = this.x - eyeOffsetX;
      const rightEyeX = this.x + eyeOffsetX;
      const eyeY = this.y + eyeOffsetY;

      this.p.ellipse(leftEyeX, eyeY, eyeSize, eyeSize);
      this.p.ellipse(rightEyeX, eyeY, eyeSize, eyeSize);

      // Draw Pupils (indicate direction)
      this.p.fill(pupilColor);
      const pupilSize = eyeSize * 0.5;
      let pupilOffsetX = 0;
      let pupilOffsetY = 0;

      // Make pupils follow direction (even if eaten, they look where they're going)
       if (this.direction !== DIR_STOP) {
           pupilOffsetX = this.direction.x * eyeSize * 0.2;
           pupilOffsetY = this.direction.y * eyeSize * 0.2;
       }

      // Adjust pupil position slightly more based on eyes offset
      this.p.ellipse(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);
      this.p.ellipse(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);

      this.p.pop();
    }
  }


  // === lib/game.js ===
  // Manages the overall game flow 🚦
  class Game {
    constructor(p) {
      this.p = p; // Store p5 instance
      this.reset(); // Initialize or reset game state
    }

    reset() {
        this.maze = new Maze(this.p, MAZE_WIDTH, MAZE_HEIGHT);

        const pacmanStartX = Math.floor(MAZE_WIDTH / 2);
        const pacmanStartY = Math.floor(MAZE_HEIGHT / 2) + 2; // Start below center box
        this.pacman = new Pacman(this.p, pacmanStartX, pacmanStartY, this.maze);

        // Place ghosts in their starting pen (adjust coords as needed)
        const ghostStartY = Math.floor(MAZE_HEIGHT / 2);
        const ghostStartXCenter = Math.floor(MAZE_WIDTH / 2);
        this.ghosts = [
            new Ghost(this.p, ghostStartXCenter, ghostStartY, this.maze, 'RED'), // Blinky starts outside? Or inside?
            // Add more ghosts inside the pen
            new Ghost(this.p, ghostStartXCenter - 1, ghostStartY, this.maze, 'PINK'),
            new Ghost(this.p, ghostStartXCenter + 1, ghostStartY, this.maze, 'CYAN'),
            // new Ghost(this.p, ghostStartXCenter, ghostStartY -1 , this.maze, 'ORANGE') // Needs maze adjustment for pen
        ];
        this.gameState = STATE_START;
        this.ghostEatenPoints = 200; // Points for eating the first ghost in a chain
         // Make game instance globally accessible (careful with this pattern)
        window.game = this;
        console.log("Game Reset/Initialized");
    }


    handleInput(keyCode) {
      if (this.gameState === STATE_PLAYING) {
        if (keyCode === this.p.UP_ARROW || keyCode === 87 /* W */) {
          this.pacman.setDirection(DIR_UP);
        } else if (keyCode === this.p.DOWN_ARROW || keyCode === 83 /* S */) {
          this.pacman.setDirection(DIR_DOWN);
        } else if (keyCode === this.p.LEFT_ARROW || keyCode === 65 /* A */) {
          this.pacman.setDirection(DIR_LEFT);
        } else if (keyCode === this.p.RIGHT_ARROW || keyCode === 68 /* D */) {
          this.pacman.setDirection(DIR_RIGHT);
        }
      } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
          // Press any valid key to start/restart
          if (keyCode) { // Check if it was actually a key press
             this.startGame();
          }
      }
    }

    handleTouch() {
       if (this.gameState === STATE_PLAYING) {
          const touchX = this.p.mouseX;
          const touchY = this.p.mouseY;
          const screenWidth = this.p.width;
          const screenHeight = this.p.height; // Use canvas height

          // Determine relative position to Pac-Man for clearer direction intent
          const deltaX = touchX - this.pacman.x;
          const deltaY = touchY - this.pacman.y;

          if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // More horizontal movement
              if (deltaX > 0) {
                  this.pacman.setDirection(DIR_RIGHT);
              } else {
                  this.pacman.setDirection(DIR_LEFT);
              }
          } else {
               // More vertical movement
               if (deltaY > 0) {
                   this.pacman.setDirection(DIR_DOWN);
               } else {
                   this.pacman.setDirection(DIR_UP);
               }
          }

       } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
           this.startGame();
       }
    }

    startGame() {
        if (this.gameState !== STATE_PLAYING) {
            console.log("Starting game...");
            // If coming from Game Over or Win, reset everything
            if (this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
               this.reset(); // Full reset
            }
            this.gameState = STATE_PLAYING;
        }
    }


    update() {
      if (this.gameState !== STATE_PLAYING) {
        return; // Don't update if not playing
      }

      this.pacman.update();
      this.ghosts.forEach(ghost => ghost.update(this.pacman)); // Ghosts need pacman's position

      this.checkCollisions();

      // Check Win Condition
      if (this.maze.dotsRemaining <= 0) {
          console.log("All dots eaten! Player wins!");
          this.pacman.score += 1000; // Bonus for clearing level?
          this.gameState = STATE_WIN;
      }
    }

    activatePowerPellet() {
        console.log("Power Pellet Activated! 🔵👻");
        this.ghosts.forEach(ghost => ghost.makeVulnerable());
        this.ghostEatenPoints = 200; // Reset points multiplier for this power pellet
    }

    checkCollisions() {
        const pacGridPos = this.pacman.getGridPos();
        // Use a smaller collision radius than a full tile for fairness
        const collisionDistSq = (TILE_SIZE * 0.6) * (TILE_SIZE * 0.6); // Based on distance between centers

        this.ghosts.forEach(ghost => {
            // Check distance between centers
            if (distSq(this.pacman.x, this.pacman.y, ghost.x, ghost.y) < collisionDistSq) {
                   if (ghost.state === GHOST_STATE_VULNERABLE) {
                       // Pac-Man eats ghost!
                       if (ghost.gotEaten()) { // gotEaten returns true if successful
                           this.pacman.score += this.ghostEatenPoints;
                           console.log(`Ate ghost for ${this.ghostEatenPoints} points!`);
                           this.ghostEatenPoints *= 2; // Double points for next ghost in chain
                           // Add sound effect here? 🔊
                       }
                   } else if (ghost.state === GHOST_STATE_NORMAL) {
                       // Ghost eats Pac-Man! (Only if PacMan isn't briefly invulnerable after spawn)
                       this.pacman.loseLife();
                       console.log("Pacman caught! Lives remaining: " + this.pacman.lives);
                       if (this.pacman.lives <= 0) {
                              this.gameState = STATE_GAME_OVER;
                              console.log("GAME OVER!");
                       } else {
                            // Pause briefly? Reset everyone's position?
                            // Reset positions for now
                            this.resetPositionsAfterDeath();
                       }
                   }
                   // No collision if ghost is EATEN state
              }
        });
    }

    resetPositionsAfterDeath() {
        // Move Pac-Man back to start
        this.pacman.x = this.pacman.startX * TILE_SIZE + TILE_SIZE / 2;
        this.pacman.y = this.pacman.startY * TILE_SIZE + TILE_SIZE / 2;
        this.pacman.direction = DIR_STOP;
        this.pacman.nextDirection = DIR_STOP;

        // Move Ghosts back to start (or near it)
         this.ghosts.forEach(ghost => {
             ghost.x = ghost.startX * TILE_SIZE + TILE_SIZE / 2;
             ghost.y = ghost.startY * TILE_SIZE + TILE_SIZE / 2;
             ghost.direction = ghost._getRandomInitialDirection();
             ghost.state = GHOST_STATE_NORMAL; // Ensure they are normal state
             ghost.speed = GHOST_SPEED;
         });
    }

    drawUI() {
      this.p.push();
      const uiY = this.maze.height * TILE_SIZE + TILE_SIZE; // Position UI below maze
      this.p.textFont('monospace', 16);
      applyTextColor(this.p, 'WHITE');
      this.p.text(`Score: ${this.pacman.score}`, 10, uiY);

      // Draw Lives (Pac-Man icons)
      applyFillColor(this.p, 'YELLOW');
      applyNoStroke(this.p);
      const lifeSize = TILE_SIZE * 0.7;
      for(let i = 0; i < this.pacman.lives; i++) {
          // Draw simple circle for life icon
          this.p.ellipse(this.p.width - (i * lifeSize * 1.5) - lifeSize, uiY - lifeSize/2, lifeSize, lifeSize);
      }

      // Game State Overlays
      if (this.gameState !== STATE_PLAYING) {
          let title = "";
          let subtitle = "Tap or Press Key to START";
          if (this.gameState === STATE_START) {
               title = "p5.js PAC-MAN";
          } else if (this.gameState === STATE_GAME_OVER) {
               title = "GAME OVER";
               subtitle = "Tap or Press Key to RESTART";
          } else if (this.gameState === STATE_WIN) {
               title = "YOU WIN!";
               subtitle = "Tap or Press Key to RESTART";
          }
        this.drawOverlay(title, subtitle);
      }

      this.p.pop();
    }

    drawOverlay(title, subtitle) {
         this.p.push();
         this.p.fill(0, 0, 0, 190); // More opaque background
         this.p.rect(0, this.p.height / 4, this.p.width, this.p.height / 2); // Centered overlay box

         this.p.textAlign(this.p.CENTER, this.p.CENTER);

         applyTextColor(this.p, 'YELLOW');
         this.p.textSize(32);
         this.p.text(title, this.p.width / 2, this.p.height / 2 - 20);

         applyTextColor(this.p, 'WHITE');
         this.p.textSize(16);
         this.p.text(subtitle, this.p.width / 2, this.p.height / 2 + 30);
         this.p.pop();
    }


    draw() {
      this.p.background(...COLORS.BLACK); // Use color library

      // Maybe center the maze if canvas is larger than maze?
      // const offsetX = (this.p.width - this.maze.width * TILE_SIZE) / 2;
      // const offsetY = 0; // Keep maze at top
      // this.p.translate(offsetX, offsetY);

      this.maze.draw();
      this.pacman.draw();
      this.ghosts.forEach(ghost => ghost.draw());

      // Reset translation if we centered the maze
      // this.p.translate(-offsetX, -offsetY);

      this.drawUI(); // Draw UI last, on top
    }
  }


  // === sketch.js (Main p5.js functions) ===
  // The main conductor of our p5.js orchestra 🎶

  let game; // The global game object instance

  function setup() {
    // Calculate canvas size based on maze and UI space
    const canvasWidth = MAZE_WIDTH * TILE_SIZE;
    const canvasHeight = MAZE_HEIGHT * TILE_SIZE + TILE_SIZE * 2; // Extra space for UI at bottom
    createCanvas(canvasWidth, canvasHeight);
    frameRate(30); // Adjust for desired game speed/smoothness
    console.log("🚀 p5.js Pac-Man Single File Initialized! 🚀");

    // The 'this' passed to Game is the p5 instance, which is automatically
    // handled when these functions (setup, draw, etc.) are called by p5.
    game = new Game(this);
    // The game constructor now sets window.game = this;
  }

  function draw() {
    // Ensure game exists before updating/drawing
    if (game) {
        game.update();
        game.draw();
    }
  }

  function keyPressed() {
    if (game) {
      // p5 provides keyCode directly
      game.handleInput(keyCode);
    }
    // Return false to prevent default browser actions (like scrolling with arrow keys)
    return false;
  }

  function touchStarted() {
     if (game) {
         // Use p5's mouseX, mouseY which work for touches too
         game.handleTouch();
     }
     // Return false to prevent default browser actions (like mobile zoom/scroll)
     return false;
  }

  // Optional: Prevent context menu on right-click/long-press
  // function mousePressed() {
  //   return false;
  // }
  // document.addEventListener('contextmenu', event => event.preventDefault());

  // ==========================================
  // End of Single-File p5.js Pac-Man Clone
  // ==========================================
