const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6;

const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#09d3ac"
};

const ai = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#ff5252"
};

const ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    width: BALL_SIZE,
    height: BALL_SIZE,
    color: "#fff",
    velocityX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    velocityY: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
};

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp to canvas bounds
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});

// Draw everything
function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawBall(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Game logic
function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.velocityX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function collision(paddle, ball) {
    return paddle.x < ball.x + ball.width &&
           paddle.x + paddle.width > ball.x &&
           paddle.y < ball.y + ball.height &&
           paddle.y + paddle.height > ball.y;
}

function aiMove() {
    // Move AI paddle towards the ball with basic prediction
    let target = ball.y + ball.height / 2 - ai.height / 2;
    if (ai.y < target) {
        ai.y += PADDLE_SPEED;
    } else if (ai.y > target) {
        ai.y -= PADDLE_SPEED;
    }
    // Clamp to canvas bounds
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

function update() {
    // Ball movement
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Collision with top/bottom walls
    if (ball.y <= 0 || ball.y + ball.height >= canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Collision with paddles
    if (collision(player, ball)) {
        ball.x = player.x + player.width; // Avoid sticking
        ball.velocityX = Math.abs(ball.velocityX);
        // Add some "spin" depending on where the paddle was hit
        let impact = (ball.y + ball.height / 2) - (player.y + player.height / 2);
        ball.velocityY = BALL_SPEED * (impact / (player.height / 2));
    } else if (collision(ai, ball)) {
        ball.x = ai.x - ball.width; // Avoid sticking
        ball.velocityX = -Math.abs(ball.velocityX);
        let impact = (ball.y + ball.height / 2) - (ai.y + ai.height / 2);
        ball.velocityY = BALL_SPEED * (impact / (ai.height / 2));
    }

    // Score (ball out of bounds)
    if (ball.x < 0 || ball.x + ball.width > canvas.width) {
        resetBall();
    }

    // Move AI paddle
    aiMove();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player);
    drawRect(ai);
    drawBall(ball);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();