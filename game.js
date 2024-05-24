const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const startButton = document.getElementById('startButton');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let score = 0;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let player = { x: canvas.width / 2, y: canvas.height / 2, radius: 20 }; // Tamaño de la nave aumentado
let enemies = [];
let enemySpeed = 1;
let maxEnemies = 11;
let difficulty = 1;
let gameRunning = false;

// Cargar imágenes
const backgroundImage = new Image();
backgroundImage.src = 'imegenes/espacio.jpg';

const playerImage = new Image();
playerImage.src = 'imegenes/nave.jpg';

const enemyImage = new Image();
enemyImage.src = 'imegenes/meteoro.jpg';

document.getElementById('difficultySelect').addEventListener('change', function() {
    difficulty = parseInt(this.value);
    enemySpeed = difficulty;
    resetGame();
});

startButton.addEventListener('click', function() {
    startGame();
});

function updateHighScores() {
    const highScoresDiv = document.getElementById('highscores');
    highScoresDiv.innerHTML = "Mejores Puntuaciones:<br>" + highScores.join('<br>');
}

function saveHighScores() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateHighScores();
}

function resetGame() {
    score = 0;
    enemySpeed = difficulty;
    enemies = [];
    for (let i = 0; i < maxEnemies; i++) {
        spawnEnemy();
    }
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}

function spawnEnemy() {
    const size = 40; // Tamaño de los enemigos aumentado
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -size;
            break;
        case 1: // Right
            x = canvas.width + size;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + size;
            break;
        case 3: // Left
            x = -size;
            y = Math.random() * canvas.height;
            break;
    }
    enemies.push({ x, y, size, speed: enemySpeed });
}

function gameOver() {
    saveHighScores();
    gameRunning = false;
    startButton.style.display = 'block';
    document.body.classList.remove('hidden-cursor');
}

function startGame() {
    resetGame();
    gameRunning = true;
    startButton.style.display = 'none';
    document.body.classList.add('hidden-cursor');
    update();
}

function update() {
    if (!gameRunning) return;

    enemies.forEach(enemy => {
        let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        if (enemy.x < -enemy.size || enemy.x > canvas.width + enemy.size ||
            enemy.y < -enemy.size || enemy.y > canvas.height + enemy.size) {
            enemy.x = Math.random() * canvas.width;
            enemy.y = Math.random() * canvas.height;
        }
    });

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + enemy.size / 2) { // Ajustar la detección de colisiones
            gameOver();
            return;
        }

        for (let j = i + 1; j < enemies.length; j++) {
            let otherEnemy = enemies[j];
            let ex = enemy.x - otherEnemy.x;
            let ey = enemy.y - otherEnemy.y;
            let edistance = Math.sqrt(ex * ex + ey * ey);

            if (edistance < enemy.size) {
                enemies.splice(j, 1);
                enemies.splice(i, 1);
                spawnEnemy();
                spawnEnemy();
                break;
            }
        }
    }

    if (score % 500 === 0 && score > 0) {
        enemySpeed += 0.5;
        let additionalEnemies = difficulty === 1 ? 2 : difficulty === 2 ? 4 : difficulty === 3 ? 8 : 0;
        for (let i = 0; i < additionalEnemies; i++) {
            spawnEnemy();
        }
    }

    score++;
    document.getElementById('score').textContent = `Puntuación: ${score}`;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    ctx.drawImage(playerImage, player.x - player.radius, player.y - player.radius, player.radius * 2, player.radius * 2);

    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    });
}

canvas.addEventListener('mousemove', function(event) {
    if (gameRunning) {
        player.x = event.clientX - (window.innerWidth - canvas.width) / 2;
        player.y = event.clientY - (window.innerHeight - canvas.height) / 2;
    }
});

updateHighScores();
