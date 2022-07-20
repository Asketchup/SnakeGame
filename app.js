'use strict';

// Declarations
let canvas, ctx,
lastPress,
dir = 0,
steps,
pause = true,
food,
start = true,
score = 0,
gameover = false,
scale = 20,
buffer,
bufferCtx;

let iHead_00 = new Image(),
iHead_01 = new Image(),
iHead_02 = new Image(),
iHead_03 = new Image(),
iFood = new Image(),
aEat = new Audio(),
aStart = new Audio(),
aGameOver = new Audio();

const body = [];

// Key press
document.addEventListener('keydown', evt => lastPress = evt.key, false);

// Rectangle
class Rectangle {
    
    constructor (x, y, width, height) {

        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.width = (width == null) ? 0 : width;
        this.height = (height == null) ? this.width : height;
    
    }

    intersects(rect) {

        if (rect == null) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }

    }

    fill(ctx) {

        if (ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

    }

}

// Resize
function resize() {

    let w = window.innerWidth / canvas.width;
    let h = window.innerHeight / canvas.height;
    let scale = Math.min(h, w);

    canvas.style.width = (canvas.width * scale - 30) + 'px';
    canvas.style.height = (canvas.height * scale - 30) + 'px';
}

// Random
function random(max) {
    return ~~(Math.random() * max);
}

// Reset
function reset() {
    score = 0;
    dir = 0;
    body.length = 0;
    body.push(new Rectangle(canvas.width / 2, canvas.height / 1.5, scale));
    food.x = canvas.width / 2;
    food.y = canvas.height / 4;
    gameover = false;
    aGameOver.pause();
    aStart.play();
}

function addHighScore(score) {

    if (score >= localStorage.highScore) {
        localStorage.highScore = score;
    }

}

// Paint
function paint(ctx) {
    
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, buffer.width, buffer.height);

    // Draw player
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < body.length; i++) {
        
        if (i == 0) {

            switch (dir) {
                case 0:
                    ctx.drawImage(iHead_00, body[0].x, body[i].y);
                    break;
                case 1:
                    ctx.drawImage(iHead_01, body[0].x, body[i].y);
                    break;
                case 2:
                    ctx.drawImage(iHead_02, body[0].x, body[i].y);
                    break;
                case 3:
                    ctx.drawImage(iHead_03, body[0].x, body[i].y);
                    break;
            }

        } else {
            body[i].fill(ctx);
        }

    }

    // Draw food
    //ctx.fillStyle = '#f00';
    //food.fill(ctx);
    ctx.drawImage(iFood, food.x, food.y);

    // Draw score
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillStyle = '#00d8d8';
    ctx.fillText('Score: ' + score, 10, 25);

    // Draw pause
    if (pause) {
        ctx.textAlign = 'center';
        if (start) {
            ctx.fillText('PRESS ENTER', buffer.width / 2, buffer.height / 2);
        } else if (gameover) {
            ctx.fillText('GAME OVER', buffer.width / 2, buffer.height / 2);
            ctx.fillText('BEST SCORE: ' + localStorage.highScore, buffer.width / 2, (buffer.height / 2) + 30);
        
        } else if (pause && aStart.ended == true){
            ctx.fillText('PAUSE', buffer.width / 2, buffer.height / 2);
        }
        ctx.textAlign = 'left';
    }
    
}

function gameOver_func() {
    gameover = true;
    pause = true;
    aGameOver.load();
    aGameOver.play();
    addHighScore(score);
    console.log(localStorage.highScore);
}

function act(){

    let i, l;
    
    if (!pause) {
        
        // GameOver Reset
        if (gameover) {
            reset();
        }

        // Change Direction
        if (lastPress == 'ArrowUp') dir = 0;
        if (lastPress == 'ArrowRight') dir = 1;
        if (lastPress == 'ArrowDown') dir = 2;
        if (lastPress == 'ArrowLeft') dir = 3;

        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }

        // Move Head
        if (dir == 0) body[0].y -= steps;
        if (dir == 1) body[0].x += steps;
        if (dir == 2) body[0].y += steps;
        if (dir == 3) body[0].x -= steps;

        let limitWidth = canvas.width-body[0].width,
            limitHeight = canvas.height-body[0].height;

        // Out Screen
        if (body[0].x > limitWidth) {
            gameOver_func();
            //body[0].x = 0;
        }
        if (body[0].y > limitHeight) {
            gameOver_func();
            //body[0].y = 0;
        }
        if (body[0].x < 0) {
            gameOver_func();
            //body[0].x = limitWidth;
        }
        if (body[0].y < 0) {
            gameOver_func();
            //body[0].y = limitHeight;
        }

        // Food Intersects
        if (body[0].intersects(food)) {
            body.push(new Rectangle(body.lastIndexOf.x, body.lastIndexOf.y - 25, scale));
            score += 1;
            food.x = random(canvas.width / 20 - 1) * 20;
            food.y = random(canvas.height / 20 - 1) * 20;
            aEat.play();
        }

        for (let i = 2; i < body.length; i++) {
            
            if (body[i].intersects(food)) {
                food.x = random(canvas.width / 20 - 1) * 20;
                food.y = random(canvas.height / 20 - 1) * 20;
            }
            
        }

        // Body Intersects
        for (i = 2, l = body.length; i < l; i += 1) {
            if (body[0].intersects(body[i])) gameOver_func();
        }

    }

    // Pause/Unpause
    if (lastPress == 'Enter') {

        if (start) {
            aStart.play();
        }

        pause = !pause;
        start = false;
        lastPress = null;
    }

}

// Starts functions

function repaint() {
    window.requestAnimationFrame(repaint);
    paint(bufferCtx);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    if (aStart.ended == true) {
        steps = 20;
    } else {
        steps = 0;
    }
}

function run() {
    setTimeout(run, 50);
    act();
}

// Init()

function init() {

    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Load buffer
    buffer = document.createElement('canvas');
    bufferCtx = buffer.getContext('2d');
    buffer.width = 1200;
    buffer.height = 600;

    // Create player and food
    body.push(new Rectangle(canvas.width / 2, canvas.height / 1.5, scale));
    food = new Rectangle(canvas.width / 2, canvas.height / 4, scale)

    // Load assets
    iHead_00.src = './assets/head_00.png';
    iHead_01.src = './assets/head_01.png';
    iHead_02.src = './assets/head_02.png';
    iHead_03.src = './assets/head_03.png';
    iFood.src = './assets/food.png';

    aEat.src = './assets/eat.mp3';
    aStart.src = './assets/start.mp3';
    aGameOver.src = './assets/game_over.mp3'

    // Start game
    run();
    repaint();
    resize();
}

window.addEventListener('load', init, false);
window.addEventListener('resize', resize, false);
