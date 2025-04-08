const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let tileSize = 20;
let playerColor = "green";
let shootTime = 30;
let updateTick = 0;
let velX = -10;

//images
let ship = new Image();
ship.src = "ship.png";
let alienSprite = new Image();
alienSprite.src = "alien.png";

//audio
let shootAlert = new Audio();
shootAlert.controls = true;
shootAlert.volume = 0.1;
shootAlert.src = "shoot.wav";

const fps = 60;

canvas.width = 500;
canvas.height = 500;

//classes
class Player{
    constructor(){
        this.pos = {
            x: (canvas.height - 50) / 2,
            y: 450
        }
        this.vel = {
            x: 0,
            y: 0
        }

        this.width = tileSize;
        this.height = tileSize;
    }

    movement(){
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if(this.pos.x < 0){
            this.vel.x = 0;
            this.pos.x += 3;
        }

        if(this.pos.x > (canvas.width - 50)){
            this.vel.x = 0;
            this.pos.x -= 3;
        }
    }

    draw(){
        ctx.drawImage(ship, this.pos.x, this.pos.y, 50, 30);
    }

    render(){
        this.movement();
        this.draw();
    }
}

class Bullet{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 2;
        this.height = 10;
    }

    draw(){
        
        ctx.fillStyle = "yellow"
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    movement(){
        this.y += -10;
    }

    render(){
        this.draw();
        this.movement();
    }

}

class Shield{
    constructor(){
        this.x = x;
        this.y = y;
        this.width = tileSize * 2;
        this.height = tileSize;
    }
}

class Alien{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.vel = {
            x: -10,
            y: 0
        }
        this.width = 40;
        this.height = 40;
    }

    draw(){
        ctx.drawImage(alienSprite, this.x, this.y, this.width, this.height);
    }
}

//game
let player = new Player();
let bullets = [];
let enemies = [];

function setLevel(){
    if(enemies.length == 0){
        let startX = 60;
        let startY = 60;
        for(let i = 0; i < 6; i++){
            let enemy = new Alien(i * startX + 80, startY);
            enemies.push(enemy)
        }

        for(let j = 0; j < 6; j++){
            let enemy = new Alien(j * startX + 80, startY + 60);
            enemies.push(enemy)
        }
        console.log(enemies)
    }
}

function renderEnemy(enemy){
    enemy.x += enemy.vel.x;

    if(enemies[0].x == 10) enemy.vel.x = -enemy.vel.x

}

function bulletCollision(obj1, obj2){
    return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
}

function main(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.render();
    bullets.forEach((bullet, i) => {
        bullet.render();

        if(bullet.y <= 0 - 10){
            bullets.splice(i,1)
            i--;
        }
    })

    enemies.forEach((enemy, i) => {
        if(i >= 0){
            enemy.draw();
            if(updateTick == 60){
                renderEnemy(enemy);
            }
        }
    })

    if(key[' '] && shootTime >= 30){
        let bullet = new Bullet(player.pos.x + (50/2) - (2 / 2), player.pos.y - 10);
        bullets.push(bullet);
        shootTime = 0;
        shootAlert.play();
    }

    if(updateTick == 60){
        updateTick = 0;
    }

    bullets.forEach((bullet, i) => {
        enemies.forEach((enemy, j) => {
            if(bulletCollision(bullet, enemy)) {
                bullets.splice(i,1);
                i--;

                enemies.splice(j,1);
                j--;

                console.log(enemies)
            }
        })
    })

    shootTime++
    setLevel();
}

let key = [];
function keyHandler(event){
    //key pressed?
    if(event.type == "keyup") key[event.key] = false;
    if(event.type == "keydown") key[event.key] = true;

    //movement
    if(key['a']) player.vel.x = -3;
    if(key['d']) player.vel.x = 3;

    if(!key['a'] && !key['d']) player.vel.x = 0;
}

setInterval(() => {
    main();
    updateTick++;
}, 1000/fps)

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);