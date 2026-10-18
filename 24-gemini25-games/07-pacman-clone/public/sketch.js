// ==========================================
// Single-File p5.js Pac-Man Clone (v5 - Mobile Fixes!)
// Paste this entire code into the p5.js editor:
// https://editor.p5js.org/
// Fixes: Mobile layout scaling (CSS recommendation), Mobile touch controls
// ==========================================

/*
 * RECOMMENDED CSS CHANGES FOR MOBILE LAYOUT (Apply in index.html or editor's CSS):
 *
 * body {
 * margin: 0;
 * overflow: hidden;
 * background-color: black;
 * display: flex;             // Keep flexbox for centering
 * justify-content: center;
 * align-items: center;
 * min-height: 100vh;         // Ensure body takes full height
 * min-width: 100vw;          // Ensure body takes full width
 * }
 *
 * canvas {
 * display: block;            // Good practice, removes extra space
 * max-width: 100vw;          // Limit canvas width to viewport width
 * max-height: 100vh;         // Limit canvas height to viewport height
 * width: auto;               // Let height determine width (if height limited first)
 * height: auto;              // Let width determine height (if width limited first)
 * object-fit: contain;       // Scale while maintaining aspect ratio & fitting within bounds
 *
 * // Keep pixels sharp when scaling up:
 * image-rendering: pixelated;
 * image-rendering: -moz-crisp-edges; // Firefox
 * image-rendering: crisp-edges;      // Other browsers
 *
 * border: 1px solid #333;    // Optional: Keep the border if you like it
 * }
 *
 * // You might need vendor prefixes for image-rendering depending on target browsers,
 * // but pixelated/crisp-edges cover most modern ones.
 */


// === lib/colors.js ===
const COLORS = { BLACK: [0, 0, 0], YELLOW: [255, 255, 0], WHITE: [255, 255, 255], BLUE: [0, 0, 255], RED: [255, 0, 0], PINK: [255, 182, 193], CYAN: [0, 255, 255], ORANGE: [255, 165, 0], PELLET: [255, 184, 174], GHOST_VULNERABLE: [50, 50, 200], GHOST_VULNERABLE_BLINK: [200, 200, 200], };
function applyTextColor(p, colorName = 'WHITE') { p.fill(...COLORS[colorName]); }
function applyStrokeColor(p, colorName = 'WHITE') { p.stroke(...COLORS[colorName]); }
function applyFillColor(p, colorName = 'WHITE') { p.fill(...COLORS[colorName]); }
function applyNoFill(p) { p.noFill(); }
function applyNoStroke(p) { p.noStroke(); }

// === lib/constants.js ===
const TILE_SIZE = 20; const PACMAN_SPEED = 2; const GHOST_SPEED = 1.5; const DOT_SIZE = 4; const POWER_PELLET_SIZE = 8;
const MAZE_WIDTH = 21; const MAZE_HEIGHT = 21;
const STATE_START = 'START'; const STATE_PLAYING = 'PLAYING'; const STATE_GAME_OVER = 'GAME_OVER'; const STATE_WIN = 'WIN';
const DIR_STOP = { x: 0, y: 0, name: 'STOP' }; const DIR_LEFT = { x: -1, y: 0, name: 'LEFT' }; const DIR_RIGHT = { x: 1, y: 0, name: 'RIGHT' }; const DIR_UP = { x: 0, y: -1, name: 'UP' }; const DIR_DOWN = { x: 0, y: 1, name: 'DOWN' };
const DIRECTIONS = [DIR_LEFT, DIR_RIGHT, DIR_UP, DIR_DOWN];
const TILE_WALL = 1; const TILE_EMPTY = 0; const TILE_DOT = 2; const TILE_POWER_PELLET = 3; const TILE_GHOST_DOOR = 4;
const GHOST_VULNERABLE_DURATION = 300;
const GHOST_PEN_Y = Math.floor(MAZE_HEIGHT / 2); const GHOST_PEN_X_MIN = Math.floor(MAZE_WIDTH / 2) - 2; const GHOST_PEN_X_MAX = Math.floor(MAZE_WIDTH / 2) + 2; const GHOST_PEN_EXIT_X = Math.floor(MAZE_WIDTH / 2); const GHOST_PEN_EXIT_Y = GHOST_PEN_Y - 1;

// === lib/utils.js ===
function getGridCoord(pixelCoord) { return Math.floor(pixelCoord / TILE_SIZE); }
function isCentered(pixelX, pixelY) { const allowance = Math.min(PACMAN_SPEED, GHOST_SPEED) / 2 + 0.1; const centerX = (getGridCoord(pixelX) * TILE_SIZE) + TILE_SIZE / 2; const centerY = (getGridCoord(pixelY) * TILE_SIZE) + TILE_SIZE / 2; return Math.abs(pixelX - centerX) < allowance && Math.abs(pixelY - centerY) < allowance; }
function distSq(x1, y1, x2, y2) { return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2); }

// === lib/maze.js ===
class Maze {
  constructor(p, width, height) { this.p = p; this.width = width; this.height = height; this.grid = this.createSimpleMaze(width, height); this.dotsRemaining = 0; this.countInitialDots(); }
  createSimpleMaze(w, h) { let newGrid = Array(h).fill(0).map(() => Array(w).fill(TILE_EMPTY)); for (let y = 0; y < h; y++) { newGrid[y][0] = TILE_WALL; newGrid[y][w - 1] = TILE_WALL; } for (let x = 0; x < w; x++) { newGrid[0][x] = TILE_WALL; newGrid[h - 1][x] = TILE_WALL; } const midX = Math.floor(w/2); const midY = Math.floor(h/2); newGrid[midY-1][midX-2] = TILE_WALL; newGrid[midY-1][midX-1] = TILE_WALL; newGrid[midY-1][midX] = TILE_WALL; newGrid[midY-1][midX+1] = TILE_WALL; newGrid[midY-1][midX+2] = TILE_WALL; newGrid[midY][midX-2] = TILE_WALL; newGrid[midY][midX+2] = TILE_WALL; newGrid[midY+1][midX-2] = TILE_WALL; newGrid[midY+1][midX-1] = TILE_WALL; newGrid[midY+1][midX] = TILE_WALL; newGrid[midY+1][midX+1] = TILE_WALL; newGrid[midY+1][midX+2] = TILE_WALL; newGrid[midY-1][midX] = TILE_GHOST_DOOR; newGrid[midY][midX-1] = TILE_EMPTY; newGrid[midY][midX] = TILE_EMPTY; newGrid[midY][midX+1] = TILE_EMPTY; newGrid[2][2] = TILE_WALL; newGrid[2][3] = TILE_WALL; newGrid[2][4] = TILE_WALL; newGrid[3][2] = TILE_WALL; newGrid[4][2] = TILE_WALL; newGrid[4][4] = TILE_WALL; newGrid[4][5] = TILE_WALL; newGrid[4][6] = TILE_WALL; newGrid[3][6] = TILE_WALL; newGrid[2][6] = TILE_WALL; newGrid[2][w-3] = TILE_WALL; newGrid[2][w-4] = TILE_WALL; newGrid[2][w-5] = TILE_WALL; newGrid[3][w-3] = TILE_WALL; newGrid[4][w-3] = TILE_WALL; newGrid[4][w-5] = TILE_WALL; newGrid[4][w-6] = TILE_WALL; newGrid[4][w-7] = TILE_WALL; newGrid[3][w-7] = TILE_WALL; newGrid[2][w-7] = TILE_WALL; newGrid[h-3][2] = TILE_WALL; newGrid[h-3][3] = TILE_WALL; newGrid[h-3][4] = TILE_WALL; newGrid[h-4][4] = TILE_WALL; newGrid[h-5][4] = TILE_WALL; newGrid[h-3][w-3] = TILE_WALL; newGrid[h-3][w-4] = TILE_WALL; newGrid[h-3][w-5] = TILE_WALL; newGrid[h-4][w-5] = TILE_WALL; newGrid[h-5][w-5] = TILE_WALL; const hTunnelY = midY + 2; if (hTunnelY > 0 && hTunnelY < h - 1) { newGrid[hTunnelY][0] = TILE_EMPTY; newGrid[hTunnelY][w - 1] = TILE_EMPTY; } const vTunnelX = Math.floor(w / 3); if (vTunnelX > 0 && vTunnelX < w - 1) { newGrid[0][vTunnelX] = TILE_EMPTY; newGrid[h - 1][vTunnelX] = TILE_EMPTY; } for (let y = 1; y < h - 1; y++) { for (let x = 1; x < w - 1; x++) { if (newGrid[y][x] === TILE_EMPTY) { if (!(y === midY && x >= midX-1 && x <= midX+1) && !(y === midY-1 && x === midX)) { newGrid[y][x] = TILE_DOT; } } } } newGrid[3][3] = TILE_POWER_PELLET; newGrid[3][w-4] = TILE_POWER_PELLET; newGrid[h-4][3] = TILE_POWER_PELLET; newGrid[h-4][w-4] = TILE_POWER_PELLET; newGrid[midY + 3][midX] = TILE_EMPTY; return newGrid; }
  countInitialDots() { this.dotsRemaining = 0; for (let y = 0; y < this.height; y++) { for (let x = 0; x < this.width; x++) { if (this.grid[y][x] === TILE_DOT || this.grid[y][x] === TILE_POWER_PELLET) { this.dotsRemaining++; } } } console.log("Initial dots: " + this.dotsRemaining); }
  getTile(x, y) { if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return TILE_WALL; } return this.grid[y][x]; }
  isWallForPacman(x, y) { const tile = this.getTile(x, y); return tile === TILE_WALL || tile === TILE_GHOST_DOOR; }
  isWallForGhost(x, y, ghostState) { const tile = this.getTile(x, y); if (tile === TILE_GHOST_DOOR && (ghostState === GHOST_STATE_EATEN || ghostState === GHOST_STATE_EXITING_PEN)) { return false; } return tile === TILE_WALL || tile === TILE_GHOST_DOOR; }
  eatDot(x, y) { const tile = this.getTile(x, y); if (tile === TILE_DOT || tile === TILE_POWER_PELLET) { this.grid[y][x] = TILE_EMPTY; this.dotsRemaining--; return tile; } return TILE_EMPTY; }
  draw() { this.p.push(); applyNoStroke(this.p); for (let y = 0; y < this.height; y++) { for (let x = 0; x < this.width; x++) { const tileType = this.grid[y][x]; const drawX = x * TILE_SIZE; const drawY = y * TILE_SIZE; if (tileType === TILE_WALL) { applyFillColor(this.p, 'BLUE'); this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE); } else if (tileType === TILE_DOT) { applyFillColor(this.p, 'PELLET'); this.p.ellipse(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, DOT_SIZE, DOT_SIZE); } else if (tileType === TILE_POWER_PELLET) { applyFillColor(this.p, 'WHITE'); if (this.p.frameCount % 20 < 10) { this.p.ellipse(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, POWER_PELLET_SIZE, POWER_PELLET_SIZE); } } else if (tileType === TILE_GHOST_DOOR) { applyFillColor(this.p, 'BLACK'); this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE); applyStrokeColor(this.p, 'PINK'); this.p.strokeWeight(4); this.p.line(drawX, drawY + TILE_SIZE / 2, drawX + TILE_SIZE, drawY + TILE_SIZE / 2); applyNoStroke(this.p); } else if (tileType === TILE_EMPTY) { applyFillColor(this.p, 'BLACK'); this.p.rect(drawX, drawY, TILE_SIZE, TILE_SIZE); } } } this.p.pop(); }
}

// === lib/pacman.js ===
class Pacman {
  constructor(p, startX, startY, maze) { this.p = p; this.maze = maze; this.startX = startX; this.startY = startY; this.x = startX * TILE_SIZE + TILE_SIZE / 2; this.y = startY * TILE_SIZE + TILE_SIZE / 2; this.size = TILE_SIZE * 0.8; this.direction = DIR_STOP; this.nextDirection = DIR_STOP; this.mouthAngle = 0.1; this.mouthAngleSpeed = 0.05; this.score = 0; this.lives = 3; }
  setDirection(newDirection) { this.nextDirection = newDirection; }
  _canMove(dir) { if (dir === DIR_STOP) return true; const currentGridX = getGridCoord(this.x); const currentGridY = getGridCoord(this.y); const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y; return !this.maze.isWallForPacman(nextGridX, nextGridY); }
  update() { const currentGridX = getGridCoord(this.x); const currentGridY = getGridCoord(this.y); const centered = isCentered(this.x, this.y); if (centered && this.nextDirection !== DIR_STOP) { if (this._canMove(this.nextDirection)) { this.direction = this.nextDirection; this.nextDirection = DIR_STOP; } else if (!this._canMove(this.direction)){ this.direction = DIR_STOP; } } if (centered && !this._canMove(this.direction)) { this.direction = DIR_STOP; } if (this.direction !== DIR_STOP) { const nextPixelX = this.x + this.direction.x * PACMAN_SPEED; const nextPixelY = this.y + this.direction.y * PACMAN_SPEED; const targetGridX = currentGridX + this.direction.x; const targetGridY = currentGridY + this.direction.y; let collisionImminent = false; if (this.direction.x > 0 && nextPixelX >= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true; else if (this.direction.x < 0 && nextPixelX <= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true; else if (this.direction.y > 0 && nextPixelY >= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true; else if (this.direction.y < 0 && nextPixelY <= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForPacman(targetGridX, targetGridY)) collisionImminent = true; if (collisionImminent && !centered) { this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2; this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2; this.direction = DIR_STOP; } else { this.x = nextPixelX; this.y = nextPixelY; } } const teleGridX = getGridCoord(this.x); const teleGridY = getGridCoord(this.y); const teleCentered = isCentered(this.x, this.y); if (teleGridX === 0 && this.direction === DIR_LEFT && teleCentered) { if (this.maze.getTile(this.maze.width - 1, teleGridY) === TILE_EMPTY) { this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2; this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridX === this.maze.width - 1 && this.direction === DIR_RIGHT && teleCentered) { if (this.maze.getTile(0, teleGridY) === TILE_EMPTY) { this.x = 0 * TILE_SIZE + TILE_SIZE / 2; this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridY === 0 && this.direction === DIR_UP && teleCentered) { if (this.maze.getTile(teleGridX, this.maze.height - 1) === TILE_EMPTY) { this.y = (this.maze.height - 1) * TILE_SIZE + TILE_SIZE / 2; this.x = teleGridX * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridY === this.maze.height - 1 && this.direction === DIR_DOWN && teleCentered) { if (this.maze.getTile(teleGridX, 0) === TILE_EMPTY) { this.y = 0 * TILE_SIZE + TILE_SIZE / 2; this.x = teleGridX * TILE_SIZE + TILE_SIZE / 2; } } if (this.direction !== DIR_STOP) { this.mouthAngle += this.mouthAngleSpeed; if (this.mouthAngle > this.p.PI / 4 || this.mouthAngle < 0.05) { this.mouthAngleSpeed *= -1; } } else { this.mouthAngle = 0.1; } this.eat(); }
  eat() { if (isCentered(this.x, this.y)){ const gridX = getGridCoord(this.x); const gridY = getGridCoord(this.y); const eatenPelletType = this.maze.eatDot(gridX, gridY); if (eatenPelletType === TILE_DOT) this.score += 10; else if (eatenPelletType === TILE_POWER_PELLET) { this.score += 50; if (window.game) window.game.activatePowerPellet(); else console.error("Game instance not found for power pellet!"); } } }
  loseLife() { this.lives--; this.x = this.startX * TILE_SIZE + TILE_SIZE / 2; this.y = this.startY * TILE_SIZE + TILE_SIZE / 2; this.direction = DIR_STOP; this.nextDirection = DIR_STOP; }
  getGridPos() { return { x: getGridCoord(this.x) , y: getGridCoord(this.y) }; }
  draw() { this.p.push(); applyFillColor(this.p, 'YELLOW'); applyNoStroke(this.p); this.p.translate(this.x, this.y); let angle = 0; let facingDir = this.direction; if (facingDir === DIR_STOP && this.nextDirection !== DIR_STOP) facingDir = this.nextDirection; if (facingDir === DIR_RIGHT) angle = 0; else if (facingDir === DIR_LEFT) angle = this.p.PI; else if (facingDir === DIR_UP) angle = -this.p.PI / 2; else if (facingDir === DIR_DOWN) angle = this.p.PI / 2; this.p.rotate(angle); this.p.arc(0, 0, this.size, this.size, this.mouthAngle, -this.mouthAngle, this.p.PIE); this.p.pop(); }
}

// === lib/ghost.js ===
const GHOST_STATE_NORMAL = 'NORMAL'; const GHOST_STATE_VULNERABLE = 'VULNERABLE'; const GHOST_STATE_EATEN = 'EATEN'; const GHOST_STATE_EXITING_PEN = 'EXITING_PEN';
class Ghost {
  constructor(p, startX, startY, maze, colorName = 'RED') { this.p = p; this.maze = maze; this.startX = startX; this.startY = startY; this.x = startX * TILE_SIZE + TILE_SIZE / 2; this.y = startY * TILE_SIZE + TILE_SIZE / 2; this.size = TILE_SIZE * 0.8; this.direction = DIR_UP; this.colorName = colorName; this.state = GHOST_STATE_EXITING_PEN; this.vulnerableTimer = 0; this.speed = GHOST_SPEED; }
  _canMove(dir) { if (dir === DIR_STOP) return false; const currentGridX = getGridCoord(this.x); const currentGridY = getGridCoord(this.y); const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y; return !this.maze.isWallForGhost(nextGridX, nextGridY, this.state); }
  makeVulnerable() { if (this.state !== GHOST_STATE_EATEN && this.state !== GHOST_STATE_EXITING_PEN) { const prevState = this.state; this.state = GHOST_STATE_VULNERABLE; this.vulnerableTimer = GHOST_VULNERABLE_DURATION; this.speed = GHOST_SPEED * 0.6; if (prevState === GHOST_STATE_NORMAL) { const opposite = this._getOppositeDirection(this.direction); if (this._canMove(opposite)) this.direction = opposite; } } }
  _getOppositeDirection(dir) { if (dir === DIR_LEFT) return DIR_RIGHT; if (dir === DIR_RIGHT) return DIR_LEFT; if (dir === DIR_UP) return DIR_DOWN; if (dir === DIR_DOWN) return DIR_UP; return DIR_STOP; }
  update(pacman) { if (this.state === GHOST_STATE_VULNERABLE) { this.vulnerableTimer--; if (this.vulnerableTimer <= 0) { this.state = GHOST_STATE_NORMAL; this.speed = GHOST_SPEED; } } const currentGridX = getGridCoord(this.x); const currentGridY = getGridCoord(this.y); const centered = isCentered(this.x, this.y); if (this.state === GHOST_STATE_EXITING_PEN && currentGridY <= GHOST_PEN_EXIT_Y && centered) { if(currentGridX === GHOST_PEN_EXIT_X && currentGridY === GHOST_PEN_EXIT_Y) { this.state = GHOST_STATE_NORMAL; } } if (this.state === GHOST_STATE_EATEN) { const targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE / 2; const targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE / 2; if (distSq(this.x, this.y, targetX, targetY) < (this.speed * this.speed) ) { this.x = targetX; this.y = targetY + TILE_SIZE; this.state = GHOST_STATE_EXITING_PEN; this.speed = GHOST_SPEED; this.direction = DIR_DOWN; } } if (centered) { const newDir = this._chooseNewDirection(pacman); if (newDir !== DIR_STOP) this.direction = newDir; else if (!this._canMove(this.direction)) { const oppositeDir = this._getOppositeDirection(this.direction); const possibleDirs = DIRECTIONS.filter(dir => this._canMove(dir) && dir !== oppositeDir); if (possibleDirs.length > 0) this.direction = this.p.random(possibleDirs); else if (this._canMove(oppositeDir)) this.direction = oppositeDir; else this.direction = DIR_STOP; } } if (this.direction !== DIR_STOP) { const nextPixelX = this.x + this.direction.x * this.speed; const nextPixelY = this.y + this.direction.y * this.speed; const targetGridX = currentGridX + this.direction.x; const targetGridY = currentGridY + this.direction.y; let collisionImminent = false; if (this.direction.x > 0 && nextPixelX >= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true; else if (this.direction.x < 0 && nextPixelX <= targetGridX * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true; else if (this.direction.y > 0 && nextPixelY >= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true; else if (this.direction.y < 0 && nextPixelY <= targetGridY * TILE_SIZE + TILE_SIZE / 2 && this.maze.isWallForGhost(targetGridX, targetGridY, this.state)) collisionImminent = true; if (collisionImminent && !centered) { this.x = currentGridX * TILE_SIZE + TILE_SIZE / 2; this.y = currentGridY * TILE_SIZE + TILE_SIZE / 2; } else { this.x = nextPixelX; this.y = nextPixelY; } } const teleGridX = getGridCoord(this.x); const teleGridY = getGridCoord(this.y); const teleCentered = isCentered(this.x, this.y); if (teleGridX === 0 && this.direction === DIR_LEFT && teleCentered) { if (this.maze.getTile(this.maze.width - 1, teleGridY) === TILE_EMPTY) { this.x = (this.maze.width - 1) * TILE_SIZE + TILE_SIZE / 2; this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridX === this.maze.width - 1 && this.direction === DIR_RIGHT && teleCentered) { if (this.maze.getTile(0, teleGridY) === TILE_EMPTY) { this.x = 0 * TILE_SIZE + TILE_SIZE / 2; this.y = teleGridY * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridY === 0 && this.direction === DIR_UP && teleCentered) { if (this.maze.getTile(teleGridX, this.maze.height - 1) === TILE_EMPTY) { this.y = (this.maze.height - 1) * TILE_SIZE + TILE_SIZE / 2; this.x = teleGridX * TILE_SIZE + TILE_SIZE / 2; } } else if (teleGridY === this.maze.height - 1 && this.direction === DIR_DOWN && teleCentered) { if (this.maze.getTile(teleGridX, 0) === TILE_EMPTY) { this.y = 0 * TILE_SIZE + TILE_SIZE / 2; this.x = teleGridX * TILE_SIZE + TILE_SIZE / 2; } } }
  _chooseNewDirection(pacman) { const possibleDirs = []; const oppositeDir = this._getOppositeDirection(this.direction); DIRECTIONS.forEach(dir => { if (this._canMove(dir)) possibleDirs.push(dir); }); let forwardDirs = possibleDirs.filter(dir => dir !== oppositeDir); if (forwardDirs.length === 0 && possibleDirs.includes(oppositeDir)) forwardDirs = [oppositeDir]; else if (forwardDirs.length === 0) return DIR_STOP; let targetX, targetY; let chosenDir = this.p.random(forwardDirs); const currentGridX = getGridCoord(this.x); const currentGridY = getGridCoord(this.y); if (this.state === GHOST_STATE_EXITING_PEN) { targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE / 2; targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE / 2; this.speed = GHOST_SPEED * 0.8; } else if (this.state === GHOST_STATE_EATEN) { targetX = GHOST_PEN_EXIT_X * TILE_SIZE + TILE_SIZE/2; targetY = GHOST_PEN_EXIT_Y * TILE_SIZE + TILE_SIZE/2; this.speed = GHOST_SPEED * 2.5; } else if (this.state === GHOST_STATE_VULNERABLE) { let maxDistSq = -1; if (pacman) { forwardDirs.forEach(dir => { const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y; const dSq = distSq(nextGridX * TILE_SIZE, nextGridY * TILE_SIZE, pacman.x, pacman.y); if (dSq > maxDistSq) { maxDistSq = dSq; chosenDir = dir; } }); } return chosenDir; } else { if (pacman) { targetX = pacman.x; targetY = pacman.y; } else { return chosenDir; } this.speed = GHOST_SPEED; } if(targetX !== undefined && targetY !== undefined) { let minDistSq = Infinity; forwardDirs.forEach(dir => { const nextGridX = currentGridX + dir.x; const nextGridY = currentGridY + dir.y; const nextCenterX = nextGridX * TILE_SIZE + TILE_SIZE / 2; const nextCenterY = nextGridY * TILE_SIZE + TILE_SIZE / 2; const dSq = distSq(nextCenterX, nextCenterY, targetX, targetY); if (dSq < minDistSq) { minDistSq = dSq; chosenDir = dir; } else if (dSq === minDistSq) { const priority = [DIR_UP, DIR_LEFT, DIR_DOWN, DIR_RIGHT]; if (priority.indexOf(dir) < priority.indexOf(chosenDir)) chosenDir = dir; } }); } else { chosenDir = this.p.random(forwardDirs); } return chosenDir; }
  getGridPos() { return { x: getGridCoord(this.x) , y: getGridCoord(this.y) }; }
  gotEaten() { if (this.state === GHOST_STATE_VULNERABLE) { this.state = GHOST_STATE_EATEN; return true; } return false; }
  reset() { this.x = this.startX * TILE_SIZE + TILE_SIZE / 2; this.y = this.startY * TILE_SIZE + TILE_SIZE / 2; this.state = GHOST_STATE_EXITING_PEN; this.direction = DIR_UP; this.vulnerableTimer = 0; this.speed = GHOST_SPEED; }
  draw() { this.p.push(); applyNoStroke(this.p); let bodyColor; let eyeColor = COLORS.WHITE; let pupilColor = COLORS.BLACK; if (this.state === GHOST_STATE_VULNERABLE) { bodyColor = (this.vulnerableTimer < 100 && this.p.frameCount % 20 < 10) ? COLORS.GHOST_VULNERABLE_BLINK : COLORS.GHOST_VULNERABLE; } else if (this.state === GHOST_STATE_EATEN) { bodyColor = null; } else { bodyColor = COLORS[this.colorName]; } if (bodyColor) { this.p.fill(bodyColor); const bodyHeight = this.size * 0.7; const feetY = this.y + bodyHeight / 2 - this.size * 0.1; this.p.ellipse(this.x, this.y - bodyHeight / 4, this.size, this.size * 0.8); this.p.rect(this.x - this.size / 2, this.y - bodyHeight / 4, this.size, bodyHeight * 0.8); const waveW = this.size / 3; const waveH = this.size * 0.2; this.p.ellipse(this.x - waveW, feetY, waveW, waveH); this.p.ellipse(this.x, feetY, waveW, waveH); this.p.ellipse(this.x + waveW, feetY, waveW, waveH); } this.p.fill(eyeColor); const eyeSize = this.size * 0.25; const eyeOffsetY = (this.state === GHOST_STATE_EATEN) ? 0 : -this.size * 0.1; const eyeOffsetX = this.size * 0.2; const leftEyeX = this.x - eyeOffsetX; const rightEyeX = this.x + eyeOffsetX; const eyeY = this.y + eyeOffsetY; this.p.ellipse(leftEyeX, eyeY, eyeSize, eyeSize); this.p.ellipse(rightEyeX, eyeY, eyeSize, eyeSize); this.p.fill(pupilColor); const pupilSize = eyeSize * 0.5; let pupilOffsetX = 0; let pupilOffsetY = 0; if (this.direction !== DIR_STOP) { pupilOffsetX = this.direction.x * eyeSize * 0.2; pupilOffsetY = this.direction.y * eyeSize * 0.2; } this.p.ellipse(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize); this.p.ellipse(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize); this.p.pop(); }
}

// === lib/game.js ===
class Game {
  constructor(p) { this.p = p; this.reset(true); }
  reset(isNewGame = true) { this.maze = new Maze(this.p, MAZE_WIDTH, MAZE_HEIGHT); const pacmanStartX = Math.floor(MAZE_WIDTH / 2); const pacmanStartY = Math.floor(MAZE_HEIGHT / 2) + 3; if (isNewGame || !this.pacman) { this.pacman = new Pacman(this.p, pacmanStartX, pacmanStartY, this.maze); } else { this.pacman.x = pacmanStartX * TILE_SIZE + TILE_SIZE / 2; this.pacman.y = pacmanStartY * TILE_SIZE + TILE_SIZE / 2; this.pacman.direction = DIR_STOP; this.pacman.nextDirection = DIR_STOP; this.pacman.maze = this.maze; } const ghostStartY = GHOST_PEN_Y; const ghostStartXCenter = GHOST_PEN_EXIT_X; if (isNewGame || !this.ghosts) { this.ghosts = [ new Ghost(this.p, ghostStartXCenter, ghostStartY, this.maze, 'RED'), new Ghost(this.p, ghostStartXCenter - 1, ghostStartY, this.maze, 'PINK'), new Ghost(this.p, ghostStartXCenter + 1, ghostStartY, this.maze, 'CYAN'), ]; } else { this.ghosts.forEach(ghost => { ghost.maze = this.maze; ghost.reset(); }); } if (isNewGame) { this.gameState = STATE_START; this.pacman.score = 0; this.pacman.lives = 3; } else { this.gameState = STATE_PLAYING; } this.ghostEatenPoints = 200; window.game = this; console.log(`Game Reset (New Game: ${isNewGame})`); }
  handleInput(keyCode) { if (this.gameState === STATE_PLAYING) { if (keyCode === this.p.UP_ARROW || keyCode === 87) this.pacman.setDirection(DIR_UP); else if (keyCode === this.p.DOWN_ARROW || keyCode === 83) this.pacman.setDirection(DIR_DOWN); else if (keyCode === this.p.LEFT_ARROW || keyCode === 65) this.pacman.setDirection(DIR_LEFT); else if (keyCode === this.p.RIGHT_ARROW || keyCode === 68) this.pacman.setDirection(DIR_RIGHT); } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) { if (keyCode) this.startGame(); } }
  // *** FIX 6: Updated Touch Controls for Mobile ***
  handleTouch() {
     if (this.gameState === STATE_PLAYING) {
        const touchX = this.p.mouseX; // p5 uses mouseX/Y for touches
        const touchY = this.p.mouseY;
        const canvasCenterX = this.p.width / 2;
        const canvasCenterY = this.p.height / 2; // Use canvas center

        const deltaX = touchX - canvasCenterX;
        const deltaY = touchY - canvasCenterY;

        // Determine primary axis of tap relative to screen center
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal tap dominates
            if (deltaX > 0) {
                this.pacman.setDirection(DIR_RIGHT);
                // console.log("Touch Input: RIGHT"); // Debug
            } else {
                this.pacman.setDirection(DIR_LEFT);
                // console.log("Touch Input: LEFT"); // Debug
            }
        } else {
             // Vertical tap dominates (or it's near the center)
             if (deltaY > 0) {
                 this.pacman.setDirection(DIR_DOWN);
                 // console.log("Touch Input: DOWN"); // Debug
             } else {
                 this.pacman.setDirection(DIR_UP);
                 // console.log("Touch Input: UP"); // Debug
             }
        }
     } else if (this.gameState === STATE_START || this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) {
         this.startGame(); // Allow tap to start/restart
     }
  }
  startGame() { if (this.gameState !== STATE_PLAYING) { console.log("Starting game..."); if (this.gameState === STATE_GAME_OVER || this.gameState === STATE_WIN) { this.reset(true); } this.gameState = STATE_PLAYING; } }
  update() { if (this.gameState !== STATE_PLAYING) return; this.pacman.update(); this.ghosts.forEach(ghost => ghost.update(this.pacman)); this.checkCollisions(); if (this.maze.dotsRemaining <= 0) { console.log("All dots eaten! Player wins!"); this.pacman.score += 1000; this.gameState = STATE_WIN; } }
  activatePowerPellet() { if (this.gameState !== STATE_PLAYING) return; console.log("Power Pellet Activated! 🔵👻"); this.ghosts.forEach(ghost => ghost.makeVulnerable()); this.ghostEatenPoints = 200; }
  checkCollisions() { const collisionDistSq = (TILE_SIZE * 0.7) * (TILE_SIZE * 0.7); this.ghosts.forEach(ghost => { if (ghost.state === GHOST_STATE_NORMAL || ghost.state === GHOST_STATE_VULNERABLE) { if (distSq(this.pacman.x, this.pacman.y, ghost.x, ghost.y) < collisionDistSq) { if (ghost.state === GHOST_STATE_VULNERABLE) { if (ghost.gotEaten()) { this.pacman.score += this.ghostEatenPoints; this.ghostEatenPoints *= 2; } } else if (ghost.state === GHOST_STATE_NORMAL) { this.pacman.loseLife(); if (this.pacman.lives <= 0) { this.gameState = STATE_GAME_OVER; console.log("GAME OVER!"); } else { this.resetPositionsAfterDeath(); } } } } }); }
  resetPositionsAfterDeath() { this.pacman.x = this.pacman.startX * TILE_SIZE + TILE_SIZE / 2; this.pacman.y = this.pacman.startY * TILE_SIZE + TILE_SIZE / 2; this.pacman.direction = DIR_STOP; this.pacman.nextDirection = DIR_STOP; this.ghosts.forEach(ghost => ghost.reset()); }
  drawUI() { this.p.push(); const uiY = this.maze.height * TILE_SIZE + TILE_SIZE; this.p.textFont('monospace', 16); applyTextColor(this.p, 'WHITE'); this.p.textAlign(this.p.LEFT, this.p.CENTER); this.p.text(`Score: ${this.pacman.score}`, 10, uiY); applyFillColor(this.p, 'YELLOW'); applyNoStroke(this.p); const lifeSize = TILE_SIZE * 0.7; for(let i = 0; i < this.pacman.lives; i++) { this.p.ellipse(this.p.width - (i * lifeSize * 1.5) - lifeSize, uiY, lifeSize, lifeSize); } if (this.gameState !== STATE_PLAYING) { let title = ""; let subtitle = "Tap or Press Key to START"; if (this.gameState === STATE_START) title = "p5.js PAC-MAN v6"; else if (this.gameState === STATE_GAME_OVER) { title = "GAME OVER"; subtitle = "Tap or Press Key to RESTART"; } else if (this.gameState === STATE_WIN) { title = "YOU WIN!"; subtitle = "Tap or Press Key to RESTART"; } this.drawOverlay(title, subtitle); } this.p.pop(); }
  drawOverlay(title, subtitle) { this.p.push(); this.p.fill(0, 0, 0, 190); this.p.rect(0, this.p.height / 4, this.p.width, this.p.height / 2); this.p.textAlign(this.p.CENTER, this.p.CENTER); applyTextColor(this.p, 'YELLOW'); this.p.textSize(32); this.p.text(title, this.p.width / 2, this.p.height / 2 - 20); applyTextColor(this.p, 'WHITE'); this.p.textSize(16); this.p.text(subtitle, this.p.width / 2, this.p.height / 2 + 30); this.p.pop(); }
  draw() { this.p.background(...COLORS.BLACK); this.maze.draw(); this.pacman.draw(); this.ghosts.forEach(ghost => ghost.draw()); this.drawUI(); }
}

// === sketch.js (Main p5.js functions) ===
let game;
function setup() { const canvasWidth = MAZE_WIDTH * TILE_SIZE; const canvasHeight = MAZE_HEIGHT * TILE_SIZE + TILE_SIZE * 2; createCanvas(canvasWidth, canvasHeight); frameRate(30); console.log("🚀 p5.js Pac-Man v6 Initialized! (Mobile Fixes!) 🚀"); game = new Game(this); }
function draw() { if (game) { game.update(); game.draw(); } }
function keyPressed() { if (game) game.handleInput(keyCode); return false; }
function touchStarted() { if (game) game.handleTouch(); return false; } // Use touchStarted for taps
function mousePressed() { if (mouseButton === RIGHT) return false; } // Prevent context menu
document.addEventListener('contextmenu', event => event.preventDefault());

// ==========================================
// End of Single-File p5.js Pac-Man Clone v5
// ==========================================
