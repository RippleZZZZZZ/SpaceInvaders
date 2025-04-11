const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let tileSize = 20;
let playerColor = "green";
let shootTime = 30;
let updateTick = 0;
let isPlayerBullet = false;
let randomEnemy = 0;
let enemyCooldown = 0;

let alive = true;
let score = 0;
let level = 0;
let lives = 3;
let highScore = 0;

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

    movement(){
        this.y += -15;
    }
    
    draw(){
        
        ctx.fillStyle = "white"
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    render(){
        this.draw();
        this.movement();
    }

}

class Shield{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = (tileSize * 3) + 10;
        this.height = tileSize;
        this.health = 100;
    }

    draw(){
        ctx.fillStyle = "green"
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Alien{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.vel = {
            x: -20,
            y: 20
        }
        this.width = 40;
        this.height = 40;
    }

    draw(){
        ctx.drawImage(alienSprite, this.x, this.y, this.width, this.height);
    }
}

class Projectile{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 1;
        this.height = 10;
        this.color = "lightgreen";
    }

    movement(){
        this.y += 5;
    }

    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    render(){
        this.movement();
        this.draw();
    }
}

//game
let player = new Player();
let bullets = [];
let enemies = [];
let shields = [];
let projectiles = [];

function setLevel(){
    level++;
    player.pos.x = (canvas.height - 50) / 2;
    let startX = 60;
    let startY = 60;

    for(let j = 0; j < 3; j++){
        let shield = new Shield((j * startX) * 3 + 35, 400)
        shields.push(shield)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY);
        enemies.push(enemy)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY + 60);
        enemies.push(enemy)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY + 120);
        enemies.push(enemy)
    }

    console.log(enemies)
}

function collision(obj1, obj2){
    return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
}

function main(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "20px Tiny5";
    ctx.fillText('Level ' + level, 10, 40)

    ctx.font = "20px Tiny5"
    ctx.fillText('Score: ' + score, 10, 20);

    player.render();
    bullets.forEach((bullet, i) => {
        bullet.render();
        if(bullet.y <= 0 - 10){
            bullets.splice(i,1)
            i--;
        }
    })

    if(score > highScore) highScore = score;

    if(enemyCooldown == 3){
        randomEnemy = Math.floor(Math.random() * (enemies.length - 1));
        let projectile = new Projectile(enemies[randomEnemy].x + (enemies[randomEnemy].width / 2), enemies[randomEnemy].y)
        projectiles.push(projectile);

        enemyCooldown = 0;
    }

    projectiles.forEach((projectile , i) => {
        projectile.render();

        if(collision(projectile, player)){
            console.log("hit");
        }
    })

    if(updateTick == 60){
        enemyCooldown++;
        let reverse = false;
        if (enemies.length > 0){
            if(enemies[0].x <= 20 || enemies[enemies.length - 1].x + enemies[0].width >= 480){
                reverse = true;
            }
        }

        enemies.forEach(enemy => {
            if(reverse){
                enemy.vel.x = -enemy.vel.x;
                enemy.y += enemy.vel.y;
            }
    
            enemy.x += enemy.vel.x;
        })

        console.log(randomEnemy);
        console.log(enemyCooldown);
    }

    shields.forEach(shield => shield.draw());
    enemies.forEach(enemy => enemy.draw());

    if(updateTick == 60){
        updateTick = 0;
    }

    bullets.forEach((bullet, i) => {
        enemies.forEach((enemy, j) => {
            if(collision(bullet, enemy)) {
                bullets.splice(i,1);
                i--;

                enemies.splice(j,1);
                j--;

                score += 20;

                console.log(highScore)
            }
        })
    })

    if(enemies.length == 0){
        setLevel();
    }

    bullets.forEach((bullet, i) => {
        shields.forEach((shield, j) => {
            if(collision(bullet, shield)) {
                bullets.splice(i, 1);
                i--;

                shield.health -= 10;
            }
        })
    })

    projectiles.forEach((projectile, i) => {
        shields.forEach((shield, j) => {
            if(collision(projectile, shield)){
                projectiles.splice(i, 1);
            i--;

            shield.health -= 10;
            console.log(shield.health);
            }
        })
    })

    shields.forEach((shield, i) => {
        if(shield.health == 0){
            shields.splice(i, 1);
            i--;
        }
    })

    if(key[' '] && shootTime >= 30){
        let bullet = new Bullet(player.pos.x + (50/2) - (2 / 2), player.pos.y - 10);
        bullets.push(bullet);
        shootTime = 0;
        shootAlert.play();
    }

    shootTime++
}

function gameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "darkgreen";
    ctx.font = "40px Tiny5";
    ctx.fillText('Game Over', (canvas.width / 2) - 80, canvas.height / 2)
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
    if(alive){
        main();
        updateTick++;
    }
    else{
        gameOver();
    }
}, 1000/fps)

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);