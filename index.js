// Canvas setup
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 300;
canvas.height = 600;
document.body.appendChild(canvas);

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
];

// Add particle system
const particles = [];
const MAX_PARTICLES = 100;

const b = document.body;
b.style.backgroundColor = "#000000";

// Tetromino shapes
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
];

// Game state
let board = Array(BOARD_HEIGHT)
  .fill()
  .map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameOver = false;

// Create new piece
function createPiece() {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  const color = COLORS[shapeIndex];
  const shape = SHAPES[shapeIndex];

  currentPiece = { shape, color };
  currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2);
  currentY = 0;

  if (!isValidMove(0, 0)) {
    gameOver = true;
  }
}

// Check if move is valid
function isValidMove(offsetX, offsetY) {
  return currentPiece.shape.every((row, y) => {
    return row.every((value, x) => {
      if (!value) return true;
      const newX = currentX + x + offsetX;
      const newY = currentY + y + offsetY;
      return (
        newX >= 0 &&
        newX < BOARD_WIDTH &&
        newY < BOARD_HEIGHT &&
        (newY < 0 || board[newY][newX] === 0)
      );
    });
  });
}

// Merge piece with board
function mergePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = currentY + y;
        if (boardY >= 0) {
          board[boardY][currentX + x] = currentPiece.color;
        }
      }
    });
  });
}

// Clear completed lines
function clearLines() {
  let linesCleared = 0;

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== 0)) {
      // Create particles for the cleared line
      for (let x = 0; x < BOARD_WIDTH; x++) {
        createParticles(
          x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y * BLOCK_SIZE + BLOCK_SIZE / 2,
          board[y][x]
        );
      }

      // Screen shake effect
      b.style.transform = `translate(${Math.random() * 10 - 5}px, ${
        Math.random() * 10 - 5
      }px)`;
      setTimeout(() => {
        b.style.transform = "translate(0, 0)";
      }, 200);

      board.splice(y, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
      linesCleared++;
      y++;
    }
  }

  if (linesCleared > 0) {
    score += linesCleared * 100;
    // Flash background on line clear
    document.body.style.backgroundColor = "#333";
    setTimeout(() => {
      document.body.style.backgroundColor = "#000";
    }, 100);
  }
}

// Create particles
function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      vx: Math.random() * 10 - 5,
      vy: Math.random() * -10 - 5,
      size: Math.random() * 5 + 2,
      color: color,
      alpha: 1,
      life: Math.random() * 20 + 10,
    });
  }

  // Limit particles
  if (particles.length > MAX_PARTICLES) {
    particles.splice(0, particles.length - MAX_PARTICLES);
  }
}

// Update and draw particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
    p.alpha -= 0.05;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Rotate piece
function rotatePiece() {
  const newShape = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map((row) => row[row.length - 1 - i])
  );

  const oldShape = currentPiece.shape;
  currentPiece.shape = newShape;

  if (!isValidMove(0, 0)) {
    currentPiece.shape = oldShape;
  }
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw board
  board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );

        // Add glow effect to blocks
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
        ctx.shadowBlur = 0;
      }
    });
  });

  // Draw current piece with glow effect
  if (currentPiece) {
    ctx.fillStyle = currentPiece.color;
    ctx.shadowColor = currentPiece.color;
    ctx.shadowBlur = 15;

    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillRect(
            (currentX + x) * BLOCK_SIZE,
            (currentY + y) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
        }
      });
    });
    ctx.shadowBlur = 0;
  }

  // Draw particles
  drawParticles();

  // Draw score
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 25);

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText(
      `Final Score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 40
    );
    ctx.textAlign = "left";
  }
}

// Game loop
function gameLoop() {
  if (!gameOver) {
    if (!currentPiece) {
      createPiece();
    }

    if (isValidMove(0, 1)) {
      currentY++;
    } else {
      mergePiece();
      clearLines();
      currentPiece = null;
    }

    updateParticles();
    draw();
  } else {
    // Continue drawing particles even when game is over
    updateParticles();
    draw();
  }
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  if (!gameOver && currentPiece) {
    switch (e.key) {
      case "ArrowLeft":
        if (isValidMove(-1, 0)) currentX--;
        break;
      case "ArrowRight":
        if (isValidMove(1, 0)) currentX++;
        break;
      case "ArrowDown":
        if (isValidMove(0, 1)) currentY++;
        break;
      case "ArrowUp":
        rotatePiece();
        break;
    }
    draw();
  }
});

// Start game
setInterval(gameLoop, 1000);
