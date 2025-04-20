// ==========================================
// Single-File p5.js Pac-Man Clone (v3 - Teleport Fix!)
// Paste this entire code into the p5.js editor:
// https://editor.p5js.org/
// Fixes: Ghost cage, Teleport tunnels, Movement bug, Teleport logic
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
const TILE_GHOST_DOOR = 4; // Special tile type for the ghost door

const GHOST_VULNERABLE_DURATION = 300; // Frames ghost stays blue

// Ghost Pen Coordinates (based on MAZE_WIDTH/HEIGHT)
const GHOST_PEN_Y = Math.floor(MAZE_HEIGHT / 2);
const GHOST_PEN_X_MIN = Math.floor(MAZE_WIDTH / 2) - 2;
const GHOST_PEN_X_MAX = Math.floor(MAZE_WIDTH / 2) + 2;
const GHOST_PEN_EXIT_X = Math.floor(MAZE_WIDTH / 2);
const GHOST_PEN_EXIT_Y = GHOST_PEN_Y - 1;


// === lib/utils.js ===
// Handy helpers for our game logic 🛠️

// Convert pixel coordinates to grid coordinates
function getGridCoord(pixelCoord) {
  return Math.floor(pixelCoord / TILE_SIZE);
}

// Check if pixel coordinates are roughly centered in a tile
function isCentered(pixelX, pixelY) {
    const allowance = Math.min(PACMAN_SPEED, GHOST_SPEED) / 2 + 0.1; // Allow slight offset based on slowest speed
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

    // --- Inner Walls & Ghost Pen ---
    const midX = Math.floor(w/2);
    const midY = Math.floor(h/2);

    // Ghost Pen Structure
    newGrid[midY-1][midX-2] = TILE_WALL; newGrid[midY-1][midX-1] = TILE_WALL; newGrid[midY-1][midX] = TILE_WALL; newGrid[midY-1][midX+1] = TILE_WALL; newGrid[midY-1][midX+2] = TILE_WALL;
    newGrid[midY][midX-2] = TILE_WALL;   /* Pen Inside */ newGrid[midY][midX+2] = TILE_WALL;
    newGrid[midY+1][midX-2] = TILE_WALL; newGrid[midY+1][midX-1] = TILE_WALL; newGrid[midY+1][midX] = TILE_WALL; newGrid[midY+1][midX+1] = TILE_WALL; newGrid[midY+1][midX+2] = TILE_WALL;

    // Ghost Cage Door
    newGrid[midY-1][midX] = TILE_GHOST_DOOR;

    // Clear inside the pen
    newGrid[midY][midX-1] = TILE_EMPTY; newGrid[midY][midX] = TILE_EMPTY; newGrid[midY][midX+1] = TILE_EMPTY;

    // --- Other Obstacles (Example) ---
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

    // --- Teleport Tunnels ---
    const tunnelY = midY + 2; // Place tunnel below center
    if (tunnelY > 0 && tunnelY < h - 1) {
         newGrid[tunnelY][0] = TILE_EMPTY; // Left Tunnel Opening
         newGrid[tunnelY][w - 1] = TILE_EMPTY; // Right Tunnel Opening
         console.log(`Tunnel created at Y=${tunnelY}`); // Debug confirmation
     } else {
          console.warn(`Could not create tunnel at Y=${tunnelY}`);
     }


    // --- Fill with Dots ---
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (newGrid[y][x] === TILE_EMPTY) {
            if (!(y === midY && x >= midX-1 && x <= midX+1) && !(y === midY-1 && x === midX)) {
                 newGrid[y][x] = TILE_DOT;
            }
        }
      }
    }

    // --- Place Power Pellets ---
     newGrid[3][3] = TILE_POWER_PELLET;
     newGrid[3][w-4] = TILE_POWER_PELLET;
     newGrid[h-4][3] = TILE_POWER_PELLET;
     newGrid[h-4][w-4] = TILE_POWER_PELLET;

    // --- Clear Pac-Man Start ---
    newGrid[midY + 3][midX] = TILE_EMPTY; // Start below tunnel

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
    // Important: Allow checking outside bounds for teleport logic, return specific value maybe?
     if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
       // If checking specifically for teleport destination, this needs care.
       // For general collision, treat as wall.
       return TILE_WALL;
     }
    return this.grid[y][x];
  }

  isWallForPacman(x, y) {
      const tile = this.getTile(x, y);
      // Pacman cannot enter walls or ghost doors
      return tile === TILE_WALL || tile === TILE_GHOST_DOOR;
  }

   isWallForGhost(x, y, ghostState) {
       const tile = this.getTile(x, y);
        // Ghosts can pass door if eaten or trying to exit/enter pen
       if (tile === TILE_GHOST_DOOR &&
          (ghostState === GHOST_STATE_EATEN || ghostState === GHOST_STATE_EXITING_PEN)) {
            return false;
       }
       // Normal/Vulnerable ghosts treat door as wall. All ghosts treat regular walls as walls.
       return tile === TILE_WALL || tile === TILE_GHOST_DOOR;
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
        } else if (tileType === TILE_GHOST_DOOR) {
           applyFillColor(this.p, 'BLACK');
           this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE);
           applyStrokeColor(this.p, 'PINK');
           this.p.strokeWeight(4);
           this.p.line(drawX, drawY + TILE_SIZE / 2, drawX + TILE_SIZE, drawY + TILE_SIZE / 2);
           applyNoStroke(this.p);
        } else if (tileType === TILE_EMPTY) {
            // Draw empty tiles black explicitly to cover potential gaps near tunnels
             applyFillColor(this.p, 'BLACK');
             this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE);
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

  // Check if Pac-Man can move into the *center* of the next tile
  _canMove(dir) {
    if (dir === DIR_STOP) return true; // Can always stop
    const currentGridX = getGridCoord(this.x);
    const currentGridY = getGridCoord(this.y);
    const nextGridX = currentGridX + dir.x;
    const nextGridY = currentGridY + dir.y;
    // Check the tile Pacman intends to move into
    return !this.maze.isWallForPacman(nextGridX, nextGridY);
  }


  // Movement Logic (v2)
  update() {
    const currentGridX = getGridCoord(this.x);
    const currentGridY = getGridCoord(this.y);
    const centered = isCentered(this.x, this.y);

    // 1. Try to change direction if requested and centered
    if (centered && this.nextDirection !== DIR_STOP) {
        if (this._canMove(this.nextDirection)) {
            this.direction = this.nextDirection;
            this.nextDirection = DIR_STOP;
        }
        else if (!this._canMove(this.direction)){
             this.direction = DIR_STOP;
        }
    }

    // 2. Check if the current path is blocked ahead *if centered*
    if (centered && !this._canMove(this.direction)) {
        this.direction = DIR_STOP;
    }

    // 3. Move Pac-Man if direction is not STOP
    if (this.direction !== DIR_STOP) {
        const nextPixelX = this.x + this.direction.x * PACMAN_SPEED;
        const nextPixelY = this.y + this.direction.y * PACMAN_SPEED;

        // Check for collision *before* actually moving pixel position
        // This prevents entering a wall tile even slightly
        const targetGridX = currentGridX + this.direction.x;
        const targetGridY = currentGridY + this.direction.y;

        // If moving towards a wall AND Pacman is about to cross the grid boundary
        let collisionImminent = false;
        if (this.direction.x > 0 && nextPixelX >= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true;
        else if (this.direction.x < 0 && nextPixelX <= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true;
        else if (this.direction.y > 0 && nextPixelY >= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true;
        else if (this.direction.y < 0 && nextPixelY <= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true;

        if (collisionImminent && !centered) {
             // Snap to current center and stop movement
             this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2;
             this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2;
             this.direction = DIR_STOP;
        } else {
            // No collision, proceed with movement
            this.x = nextPixelX;
            this.y = nextPixelY;
        }
    }


    // *** FIX 4: Corrected Teleport Logic ***
    const teleGridX = getGridCoord(this.x);
    const teleGridY = getGridCoord(this.y);
    const teleCentered = isCentered(this.x, this.y);

    // Check if Pacman is *centered* in the leftmost column tile and moving left
    if (teleGridX === 0 && this.direction === DIR_LEFT && teleCentered) {
        // Check if the destination tunnel tile on the right exists and is empty
        if (this.maze.getTile(this.maze.width - 1, teleGridY) === TILE_EMPTY) {
            // console.log(`Teleporting L->R from (0, ${teleGridY})`); // Debug
            this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2; // Emerge centered on the rightmost tile
            this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; // Ensure Y is centered too
        }
    }
    // Check if Pacman is *centered* in the rightmost column tile and moving right
    else if (teleGridX === this.maze.width - 1 && this.direction === DIR_RIGHT && teleCentered) {
         // Check if the destination tunnel tile on the left exists and is empty
        if (this.maze.getTile(0, teleGridY) === TILE_EMPTY) {
             // console.log(`Teleporting R->L from (${this.maze.width - 1}, ${teleGridY})`); // Debug
             this.x = 0 * TILE_SIZE + TILE_SIZE / 2; // Emerge centered on the leftmost tile
             this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; // Ensure Y is centered too
        }
    }


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
      if (isCentered(this.x, this.y)){
        const gridX = getGridCoord(this.x);
        const gridY = getGridCoord(this.y);
        const eatenPelletType = this.maze.eatDot(gridX, gridY);

        if (eatenPelletType === TILE_DOT) {
            this.score += 10;
        } else if (eatenPelletType === TILE_POWER_PELLET) {
            this.score += 50;
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
        this.x = this.startX * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.startY * TILE_SIZE + TILE_SIZE / 2;
        this.direction = DIR_STOP;
        this.nextDirection = DIR_STOP;
   }

  getGridPos() {
      return { x: getGridCoord(this.x) , y: getGridCoord(this.y) };
  }

  draw() {
    this.p.push();
    applyFillColor(this.p, 'YELLOW');
    applyNoStroke(this.p);
    this.p.translate(this.x, this.y);
    let angle = 0;
    let facingDir = this.direction;
    if (facingDir === DIR_STOP && this.nextDirection !== DIR_STOP) {
        facingDir = this.nextDirection;
    }
    if (facingDir === DIR_RIGHT) angle = 0;
    else if (facingDir === DIR_LEFT) angle = this.p.PI;
    else if (facingDir === DIR_UP) angle = -this.p.PI / 2;
    else if (facingDir === DIR_DOWN) angle = this.p.PI / 2;
    this.p.rotate(angle);
    this.p.arc(0, 0, this.size, this.size, this.mouthAngle, -this.mouthAngle, this.p.PIE);
    this.p.pop();
  }
}


// === lib/ghost.js ===
// The spooky adversaries! 👻
const GHOST_STATE_NORMAL = 'NORMAL';
const GHOST_STATE_VULNERABLE = 'VULNERABLE';
const GHOST_STATE_EATEN = 'EATEN';
const GHOST_STATE_EXITING_PEN = 'EXITING_PEN';

class Ghost {
  constructor(p, startX, startY, maze, colorName = 'RED') {
    this.p = p;
    this.maze = maze;
    this.startX = startX;
    this.startY = startY;
    this.x = startX * TILE_SIZE + TILE_SIZE / 2;
    this.y = startY * TILE_SIZE + TILE_SIZE / 2;
    this.size = TILE_SIZE * 0.8;
    this.direction = DIR_UP;
    this.colorName = colorName;
    this.state = GHOST_STATE_EXITING_PEN;
    this.vulnerableTimer = 0;
    this.speed = GHOST_SPEED;
  }

  _canMove(dir) {
      if (dir === DIR_STOP) return false;
      const currentGridX = getGridCoord(this.x);
      const currentGridY = getGridCoord(this.y);
      const nextGridX = currentGridX + dir.x;
      const nextGridY = currentGridY + dir.y;
      return !this.maze.isWallForGhost(nextGridX, nextGridY, this.state);
  }

  makeVulnerable() {
      if (this.state !== GHOST_STATE_EATEN && this.state !== GHOST_STATE_EXITING_PEN) {
         const prevState = this.state;
         this.state = GHOST_STATE_VULNERABLE;
         this.vulnerableTimer = GHOST_VULNERABLE_DURATION;
         this.speed = GHOST_SPEED * 0.6;
         if (prevState === GHOST_STATE_NORMAL) {
              const opposite = this._getOppositeDirection(this.direction);
              if (this._canMove(opposite)) {
                  this.direction = opposite;
              }
         }
      }
  }

  _getOppositeDirection(dir) {
      if (dir === DIR_LEFT) return DIR_RIGHT;
      if (dir === DIR_RIGHT) return DIR_LEFT;
      if (dir === DIR_UP) return DIR_DOWN;
      if (dir === DIR_DOWN) return DIR_UP;
      return DIR_STOP;
  }


  update(pacman) {

    // --- State Transitions ---
    if (this.state === GHOST_STATE_VULNERABLE) {
        this.vulnerableTimer--;
        if (this.vulnerableTimer <= 0) {
            this.state = GHOST_STATE_NORMAL;
            this.speed = GHOST_SPEED;
        }
    }
     const currentGridX = getGridCoord(this.x);
     const currentGridY = getGridCoord(this.y);
     const centered = isCentered(this.x, this.y);

     if (this.state === GHOST_STATE_EXITING_PEN && currentGridY <= GHOST_PEN_EXIT_Y && centered) {
         if(currentGridX === GHOST_PEN_EXIT_X && currentGridY === GHOST_PEN_EXIT_Y) {
              this.state = GHOST_STATE_NORMAL;
              // console.log(`${this.colorName} ghost exited pen!`); // Debug
         }
     }
     if (this.state === GHOST_STATE_EATEN) {
          const targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE / 2;
          const targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE / 2;
          // Use distance check for respawn trigger
          if (distSq(this.x, this.y, targetX, targetY) < (this.speed * this.speed) ) {
               // console.log(`${this.colorName} ghost reached pen entrance, re-entering.`); // Debug
               this.x = targetX; // Snap to exact position before changing state
               this.y = targetY + TILE_SIZE; // Move down into pen
               this.state = GHOST_STATE_EXITING_PEN;
               this.speed = GHOST_SPEED;
               this.direction = DIR_DOWN; // Ensure it moves down initially
          }
      }

    // --- Movement Logic ---
    if (centered) { // Decide direction only when centered
      const newDir = this._chooseNewDirection(pacman);
       if (newDir !== DIR_STOP) {
           this.direction = newDir;
       } else if (!this._canMove(this.direction)) {
            // Failsafe if stuck
            const oppositeDir = this._getOppositeDirection(this.direction);
            const possibleDirs = DIRECTIONS.filter(dir => this._canMove(dir) && dir !== oppositeDir);
             if (possibleDirs.length > 0) this.direction = this.p.random(possibleDirs);
             else if (this._canMove(oppositeDir)) this.direction = oppositeDir;
             else this.direction = DIR_STOP;
       }
    }

    // --- Move Ghost ---
    if (this.direction !== DIR_STOP) {
         // Check for walls like Pacman to prevent slight overlaps - important for tunnels
         const nextPixelX = this.x + this.direction.x * this.speed;
         const nextPixelY = this.y + this.direction.y * this.speed;
         const targetGridX = currentGridX + this.direction.x;
         const targetGridY = currentGridY + this.direction.y;

         let collisionImminent = false;
         if (this.direction.x > 0 && nextPixelX >= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true;
         else if (this.direction.x < 0 && nextPixelX <= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true;
         else if (this.direction.y > 0 && nextPixelY >= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true;
         else if (this.direction.y < 0 && nextPixelY <= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true;

         if (collisionImminent && !centered) {
             // Snap to current center and stop (or recalculate next frame)
             this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2;
             this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2;
             // Don't set direction to stop, let the centered logic handle it next frame
         } else {
            // No collision, proceed
            this.x = nextPixelX;
            this.y = nextPixelY;
         }
    }


    // *** FIX 4b: Corrected Teleport Logic for Ghosts ***
    const teleGridX = getGridCoord(this.x);
    const teleGridY = getGridCoord(this.y);
    const teleCentered = isCentered(this.x, this.y);

    // Check if Ghost is *centered* in the leftmost column tile and moving left
    if (teleGridX === 0 && this.direction === DIR_LEFT && teleCentered) {
        if (this.maze.getTile(this.maze.width - 1, teleGridY) === TILE_EMPTY) {
            // console.log(`${this.colorName} Teleporting L->R`); // Debug
            this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2;
            this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2;
        }
    }
    // Check if Ghost is *centered* in the rightmost column tile and moving right
    else if (teleGridX === this.maze.width - 1 && this.direction === DIR_RIGHT && teleCentered) {
        if (this.maze.getTile(0, teleGridY) === TILE_EMPTY) {
             // console.log(`${this.colorName} Teleporting R->L`); // Debug
             this.x = 0 * TILE_SIZE + TILE_SIZE / 2;
             this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2;
        }
    }

  }

  // AI Logic
  _chooseNewDirection(pacman) {
    const possibleDirs = [];
    const oppositeDir = this._getOppositeDirection(this.direction);
    DIRECTIONS.forEach(dir => { if (this._canMove(dir)) possibleDirs.push(dir); });
    let forwardDirs = possibleDirs.filter(dir => dir !== oppositeDir);
    if (forwardDirs.length === 0 && possibleDirs.includes(oppositeDir)) forwardDirs = [oppositeDir];
    else if (forwardDirs.length === 0) return DIR_STOP;

    let targetX, targetY;
    let chosenDir = this.p.random(forwardDirs);
    const currentGridX = getGridCoord(this.x);
    const currentGridY = getGridCoord(this.y);

    if (this.state === GHOST_STATE_EXITING_PEN) {
        targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE / 2;
        targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE / 2;
        this.speed = GHOST_SPEED * 0.8;
    } else if (this.state === GHOST_STATE_EATEN) {
        targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE/2;
        targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE/2;
        this.speed = GHOST_SPEED * 2.5;
    } else if (this.state === GHOST_STATE_VULNERABLE) {
        let maxDistSq = -1;
        if (pacman) {
             forwardDirs.forEach(dir => {
                 const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y;
                 const dSq = distSq(nextGridX * TILE_SIZE, nextGridY * TILE_SIZE, pacman.x, pacman.y);
                 if (dSq > maxDistSq) { maxDistSq = dSq; chosenDir = dir; }
             });
        }
        return chosenDir;
    } else { // NORMAL Chase
        if (pacman) { targetX = pacman.x; targetY = pacman.y; }
        else { return chosenDir; } // Random if no pacman
        this.speed = GHOST_SPEED;
    }

    if(targetX !== undefined && targetY !== undefined) {
        let minDistSq = Infinity;
        forwardDirs.forEach(dir => {
            const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y;
            const nextCenterX = nextGridX * TILE_SIZE + TILE_SIZE / 2;
            const nextCenterY = nextGridY * TILE_SIZE + TILE_SIZE / 2;
            const dSq = distSq(nextCenterX, nextCenterY, targetX, targetY);
            if (dSq < minDistSq) { minDistSq = dSq; chosenDir = dir; }
            else if (dSq === minDistSq) { // Tie-breaking
                 const priority = [DIR_UP, DIR_LEFT, DIR_DOWN, DIR_RIGHT];
                 if (priority.indexOf(dir) < priority.indexOf(chosenDir)) chosenDir = dir;
             }
        });
    } else { chosenDir = this.p.random(forwardDirs); }
    return chosenDir;
  }


  getGridPos() {
      return { x: getGridCoord(this.x) , y: getGridCoord(this.y) };
  }


  gotEaten() {
     if (this.state === GHOST_STATE_VULNERABLE) {
         this.state = GHOST_STATE_EATEN;
         // console.log(`${this.colorName} ghost eaten! Heading home...`); // Debug
         return true;
     }
     return false;
  }

  reset() {
      this.x = this.startX * TILE_SIZE + TILE_SIZE / 2;
      this.y = this.startY * TILE_SIZE + TILE_SIZE / 2;
      this.state = GHOST_STATE_EXITING_PEN;
      this.direction = DIR_UP;
      this.vulnerableTimer = 0;
      this.speed = GHOST_SPEED;
  }

  draw() {
    this.p.push();
    applyNoStroke(this.p);
    let bodyColor;
    let eyeColor = COLORS.WHITE;
    let pupilColor = COLORS.BLACK;

    if (this.state === GHOST_STATE_VULNERABLE) {
        bodyColor = (this.vulnerableTimer < 100 && this.p.frameCount % 20 < 10)
                     ? COLORS.GHOST_VULNERABLE_BLINK : COLORS.GHOST_VULNERABLE;
    } else if (this.state === GHOST_STATE_EATEN) { bodyColor = null; }
    else { bodyColor = COLORS[this.colorName]; }

    if (bodyColor) {
        this.p.fill(bodyColor);
        const bodyHeight = this.size * 0.7; const feetY = this.y + bodyHeight / 2 - this.size * 0.1;
        this.p.ellipse(this.x, this.y - bodyHeight / 4, this.size, this.size * 0.8);
        this.p.rect(this.x - this.size / 2, this.y - bodyHeight / 4, this.size, bodyHeight * 0.8);
         const waveW = this.size / 3; const waveH = this.size * 0.2;
         this.p.ellipse(this.x - waveW, feetY, waveW, waveH);
         this.p.ellipse(this.x, feetY, waveW, waveH);
         this.p.ellipse(this.x + waveW, feetY, waveW, waveH);
    }

    this.p.fill(eyeColor);
    const eyeSize = this.size * 0.25;
    const eyeOffsetY = (this.state === GHOST_STATE_EATEN) ? 0 : -this.size * 0.1;
    const eyeOffsetX = this.size * 0.2;
    const leftEyeX = this.x - eyeOffsetX; const rightEyeX = this.x + eyeOffsetX; const eyeY = this.y + eyeOffsetY;
    this.p.ellipse(leftEyeX, eyeY, eyeSize, eyeSize); this.p.ellipse(rightEyeX, eyeY, eyeSize, eyeSize);

    this.p.fill(pupilColor);
    const pupilSize = eyeSize * 0.5;
    let pupilOffsetX = 0; let pupilOffsetY = 0;
    if (this.direction !== DIR_STOP) { pupilOffsetX = this.direction.x * eyeSize * 0.2; pupilOffsetY = this.direction.y * eyeSize * 0.2; }
    this.p.ellipse(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);
    this.p.ellipse(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);

    this.p.pop();
  }
}


// === lib/game.js ===
// Manages the overall game flow 🚦
class Game {
  constructor(p) {
    this.p = p;
    this.reset(true); // Start fresh
  }

  reset(isNewGame = true) {
      this.maze = new Maze(this.p, MAZE_WIDTH, MAZE_HEIGHT);

      const pacmanStartX = Math.floor(MAZE_WIDTH / 2);
      const pacmanStartY = Math.floor(MAZE_HEIGHT / 2) + 3; // Below tunnel

      if (isNewGame || !this.pacman) {
         this.pacman = new Pacman(this.p, pacmanStartX, pacmanStartY, this.maze);
      } else { // Reset existing Pacman after losing life
          this.pacman.x = pacmanStartX * TILE_SIZE + TILE_SIZE / 2;
          this.pacman.y = pacmanStartY * TILE_SIZE + TILE_SIZE / 2;
          this.pacman.direction = DIR_STOP;
          this.pacman.nextDirection = DIR_STOP;
          this.pacman.maze = this.maze;
      }

      const ghostStartY = GHOST_PEN_Y;
      const ghostStartXCenter = GHOST_PEN_EXIT_X;
      if (isNewGame || !this.ghosts) {
           this.ghosts = [ // Create new ghosts
               new Ghost(this.p, ghostStartXCenter, ghostStartY, this.maze, 'RED'),
               new Ghost(this.p, ghostStartXCenter - 1, ghostStartY, this.maze, 'PINK'),
               new Ghost(this.p, ghostStartXCenter + 1, ghostStartY, this.maze, 'CYAN'),
           ];
      } else { // Reset existing ghosts
          this.ghosts.forEach(ghost => {
              ghost.maze = this.maze;
              ghost.reset();
          });
      }

      if (isNewGame) {
         this.gameState = STATE_START;
         this.pacman.score = 0;
         this.pacman.lives = 3;
      } else {
         // If just lost life, keep playing state (or add READY state)
         this.gameState = STATE_PLAYING;
      }

      this.ghostEatenPoints = 200;
      window.game = this;
      console.log(`Game Reset (New Game: ${isNewGame})`);
  }


  handleInput(keyCode) {
    if (this.gameState === STATE_PLAYING) {
      if (keyCode === this.p.UP_ARROW || keyCode === 87 /* W */) this.pacman.setDirection(DIR_UP);
      else if (keyCode === this.p.DOWN_ARROW || keyCode === 83 /* S */) this.pacman.setDirection(DIR_DOWN);
      else if (keyCode === this.p.LEFT_ARROW || keyCode === 65 /* A */) this.pacman.setDirection(DIR_LEFT);
      else if (keyCode === this.p.RIGHT_ARROW || keyCode === 68 /* D */) this.pacman.setDirection(DIR_RIGHT);
    } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
        if (keyCode) this.startGame();
    }
  }

  handleTouch() {
     if (this.gameState === STATE_PLAYING) {
        const touchX = this.p.mouseX; const touchY = this.p.mouseY;
        const deltaX = touchX - this.pacman.x; const deltaY = touchY - this.pacman.y;
        if (Math.abs(deltaX) > Math.abs(deltaY)) this.pacman.setDirection(deltaX > 0 ? DIR_RIGHT : DIR_LEFT);
        else this.pacman.setDirection(deltaY > 0 ? DIR_DOWN : DIR_UP);
     } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
         this.startGame();
     }
  }

  startGame() {
      if (this.gameState !== STATE_PLAYING) {
          console.log("Starting game...");
          if (this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
             this.reset(true); // Full reset
          }
          this.gameState = STATE_PLAYING;
      }
  }


  update() {
    if (this.gameState !== STATE_PLAYING) return;
    this.pacman.update();
    this.ghosts.forEach(ghost => ghost.update(this.pacman));
    this.checkCollisions();
    if (this.maze.dotsRemaining <= 0) {
        console.log("All dots eaten! Player wins!");
        this.pacman.score += 1000; this.gameState = STATE_WIN;
    }
  }

  activatePowerPellet() {
      if (this.gameState !== STATE_PLAYING) return;
      console.log("Power Pellet Activated! 🔵👻");
      this.ghosts.forEach(ghost => ghost.makeVulnerable());
      this.ghostEatenPoints = 200;
  }

  checkCollisions() {
      const collisionDistSq = (TILE_SIZE * 0.7) * (TILE_SIZE * 0.7);
      this.ghosts.forEach(ghost => {
          if (ghost.state === GHOST_STATE_NORMAL || ghost.state === GHOST_STATE_VULNERABLE) {
              if (distSq(this.pacman.x, this.pacman.y, ghost.x, ghost.y) < collisionDistSq) {
                     if (ghost.state === GHOST_STATE_VULNERABLE) {
                         if (ghost.gotEaten()) {
                             this.pacman.score += this.ghostEatenPoints;
                             // console.log(`Ate ghost for ${this.ghostEatenPoints} points!`); // Debug
                             this.ghostEatenPoints *= 2;
                         }
                     } else if (ghost.state === GHOST_STATE_NORMAL) {
                         this.pacman.loseLife();
                         // console.log("Pacman caught! Lives remaining: " + this.pacman.lives); // Debug
                         if (this.pacman.lives <= 0) { this.gameState = STATE_GAME_OVER; console.log("GAME OVER!"); }
                         else { this.resetPositionsAfterDeath(); }
                     }
                }
          }
      });
  }

  resetPositionsAfterDeath() {
      this.pacman.x = this.pacman.startX * TILE_SIZE + TILE_SIZE / 2;
      this.pacman.y = this.pacman.startY * TILE_SIZE + TILE_SIZE / 2;
      this.pacman.direction = DIR_STOP; this.pacman.nextDirection = DIR_STOP;
      this.ghosts.forEach(ghost => ghost.reset());
      // Maybe add brief pause/ready state?
  }

  drawUI() {
    this.p.push();
    const uiY = this.maze.height * TILE_SIZE + TILE_SIZE;
    this.p.textFont('monospace', 16);
    applyTextColor(this.p, 'WHITE');
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.text(`Score: ${this.pacman.score}`, 10, uiY);
    applyFillColor(this.p, 'YELLOW'); applyNoStroke(this.p);
    const lifeSize = TILE_SIZE * 0.7;
    for(let i = 0; i < this.pacman.lives; i++) { this.p.ellipse(this.p.width - (i * lifeSize * 1.5) - lifeSize, uiY, lifeSize, lifeSize); }
    if (this.gameState !== STATE_PLAYING) {
        let title = ""; let subtitle = "Tap or Press Key to START";
        if (this.gameState === STATE_START) title = "p5.js PAC-MAN";
        else if (this.gameState === STATE_GAME_OVER) { title = "GAME OVER"; subtitle = "Tap or Press Key to RESTART"; }
        else if (this.gameState === STATE_WIN) { title = "YOU WIN!"; subtitle = "Tap or Press Key to RESTART"; }
        this.drawOverlay(title, subtitle);
    }
    this.p.pop();
  }

  drawOverlay(title, subtitle) {
       this.p.push();
       this.p.fill(0, 0, 0, 190); this.p.rect(0, this.p.height / 4, this.p.width, this.p.height / 2);
       this.p.textAlign(this.p.CENTER, this.p.CENTER);
       applyTextColor(this.p, 'YELLOW'); this.p.textSize(32); this.p.text(title, this.p.width / 2, this.p.height / 2 - 20);
       applyTextColor(this.p, 'WHITE'); this.p.textSize(16); this.p.text(subtitle, this.p.width / 2, this.p.height / 2 + 30);
       this.p.pop();
  }

  draw() {
    this.p.background(...COLORS.BLACK);
    this.maze.draw();
    this.pacman.draw();
    this.ghosts.forEach(ghost => ghost.draw());
    this.drawUI();
  }
}

// === sketch.js (Main p5.js functions) ===
let game;
function setup() {
  const canvasWidth = MAZE_WIDTH * TILE_SIZE;
  const canvasHeight = MAZE_HEIGHT * TILE_SIZE + TILE_SIZE * 2;
  createCanvas(canvasWidth, canvasHeight);
  frameRate(30);
  console.log("🚀 p5.js Pac-Man v3 Initialized! (Teleport Fixed!) 🚀");
  game = new Game(this);
}
function draw() { if (game) { game.update(); game.draw(); } }
function keyPressed() { if (game) game.handleInput(keyCode); return false; }
function touchStarted() { if (game) game.handleTouch(); return false; }
function mousePressed() { if (mouseButton === RIGHT) return false; } // Prevent context menu
document.addEventListener('contextmenu', event => event.preventDefault());

// ==========================================
// End of Single-File p5.js Pac-Man Clone v3
// ==========================================
