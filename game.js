const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let tileSize = 20;
let playerColor = "green";
let shootTime = 30;
let updateTick = 0;
let isPlayerBullet = false;
let enemyCooldown = 0;
let setTick = 60;
let wallTimer = 0;

let alive = true;
let score = 0;
let level = 0;
let lives = [];
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
    constructor(x, y){
        this.x = x;
        this.y = 450;
        this.vel = {
            x: 0,
            y: 0
        }

        this.width = 50;
        this.height = 30;
    }

    movement(){
        this.x += this.vel.x;
        this.y += this.vel.y;

        if(this.x < 0){
            this.vel.x = 0;
            this.x += 3;
        }

        if(this.x > (canvas.width - 50)){
            this.vel.x = 0;
            this.x -= 3;
        }
    }

    draw(){
        ctx.drawImage(ship, this.x, this.y, this.width, this.height);
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
        this.health = 50;
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
            y: 10
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
        this.width = 2;
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

class liveIcon{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 20;
    }

    draw(){
        ctx.drawImage(ship, this.x, this.y, this.width, this.height);
    }
}

//game
let player = new Player();
let bullets = [];
let rowOne = [];
let rowTwo = [];
let rowThree = [];
let shields = [];
let projectiles = [];

//starting lives
for(let l = 0; l < 3; l++){
    let live = new liveIcon((l * 35) + 5, 500 - 25);
    lives.push(live)
}

//level
function setLevel(){
    setTick = 60;
    wallTimer = 0;

    rowOne = [];
    rowTwo = [];
    rowThree = [];
    shields = [];

    player.x = (canvas.height - 50) / 2;
    let startX = 60;
    let startY = 60;

    for(let j = 0; j < 3; j++){
        let shield = new Shield((j * startX) * 3 + 35, 400)
        shields.push(shield)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY);
        rowOne.push(enemy)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY + 60);
        rowTwo.push(enemy)
    }

    for(let i = 0; i < 6; i++){
        let enemy = new Alien(i * startX + 80, startY + 120);
        rowThree.push(enemy)
    }

    console.log(rowOne);
    console.log(rowTwo);
    console.log(rowThree);
    console.log(lives);
}

//collision formula
function collision(obj1, obj2){
    return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
}

//main running function
function main(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let rightLife = lives.length - 1;

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

    //draw life icons
    lives.forEach(live => {
        live.draw();
    })

    //is alive?
    if(lives.length == 0){
        alive = false;
    }

    //player, enemy projectile collision

    //enemy shooting
    if(enemyCooldown == 3){
         let randomRow = Math.floor(Math.random() * 3);
         let randomEnemy = 0;

         if(randomRow == 0 && rowOne.length > 0){
             randomEnemy = Math.floor(Math.random() * (rowOne.length - 1));
             let projectile = new Projectile(rowOne[randomEnemy].x + (rowOne[randomEnemy].width / 2), rowOne[randomEnemy].y)
             projectiles.push(projectile);
         }

         if(randomRow == 1 && rowTwo.length > 0){
             randomEnemy = Math.floor(Math.random() * (rowTwo.length - 1));
             let projectile = new Projectile(rowTwo[randomEnemy].x + (rowTwo[randomEnemy].width / 2), rowTwo[randomEnemy].y)
             projectiles.push(projectile);
         }

         if(randomRow == 2 && rowThree.length > 0){
             randomEnemy = Math.floor(Math.random() * (rowThree.length - 1));
             let projectile = new Projectile(rowThree[randomEnemy].x + (rowThree[randomEnemy].width / 2), rowThree[randomEnemy].y)
             projectiles.push(projectile);
         }

        enemyCooldown = 0;
    }

    projectiles.forEach((projectile, i) => {
        projectile.render();

        if(collision(projectile, player)){
            projectiles.splice(i, 1);
            i--
            lives.splice(rightLife, 1)
            setLevel();
        }

        if(projectile.y >= 500 + projectile.height){
            projectiles.splice(i, 1);
            i--;
        }
    })

    //update enemys
    if(updateTick == setTick){
        enemyCooldown++;
        let reverse = false;
        wallTimer++;

        //enemy wall detection
        if (rowOne.length > 0){
            if(rowOne[0].x <= 20 || rowOne[rowOne.length - 1].x + 40 >= 480){
                reverse = true;
            }
        }

        if (rowTwo.length > 0){
            if(rowTwo[0].x <= 20 || rowTwo[rowTwo.length - 1].x + 40 >= 480){
                reverse = true;
            }
        }

        if (rowThree.length > 0){
            if(rowThree[0].x <= 20 || rowThree[rowThree.length - 1].x + 40 >= 480){
                reverse = true;
            }
        }

        //speed up
        if(wallTimer == 10){
            setTick = 30;
        }

        if(wallTimer == 30){
            setTick = 10;
        }

        //enemy movement
        rowOne.forEach(enemy => {
            if(reverse){
                enemy.vel.x = -enemy.vel.x;
                enemy.y += enemy.vel.y;
            }
    
            enemy.x += enemy.vel.x;
        })

        rowTwo.forEach(enemy => {
            if(reverse){
                enemy.vel.x = -enemy.vel.x;
                enemy.y += enemy.vel.y;
            }
    
            enemy.x += enemy.vel.x;
        })

        rowThree.forEach(enemy => {
            if(reverse){
                enemy.vel.x = -enemy.vel.x;
                enemy.y += enemy.vel.y;
            }
    
            enemy.x += enemy.vel.x;
        })

        lives.forEach((live, i) => {
            if(rowOne.length > 0){
                if(rowOne[0].y >= 400){
                    setLevel();
                    lives.splice(rightLife, 1)
                }
            }

            if(rowTwo.length > 0){
                if(rowTwo[0].y >= 400){
                    setLevel();
                    lives.splice(rightLife, 1)
                }
            }

            if(rowThree.length > 0){
                if(rowThree[0].y >= 400){
                    setLevel();
                    lives.splice(rightLife, 1)
                }
            }
        })

        console.log(wallTimer)
    }

    //drawing elements
    shields.forEach(shield => shield.draw());
    rowOne.forEach(enemy => enemy.draw());
    rowTwo.forEach(enemy => enemy.draw());
    rowThree.forEach(enemy => enemy.draw());

    //bullet, enemy collision
    bullets.forEach((bullet, i) => {
        rowOne.forEach((enemy, j) => {
            if(collision(bullet, enemy)) {
                bullets.splice(i,1);
                i--;

                rowOne.splice(j,1);
                j--;

                score += 20;
            }
        })
    })

    bullets.forEach((bullet, i) => {
        rowTwo.forEach((enemy, j) => {
            if(collision(bullet, enemy)) {
                bullets.splice(i,1);
                i--;

                rowTwo.splice(j,1);
                j--;

                score += 20;
            }
        })
    })

    bullets.forEach((bullet, i) => {
        rowThree.forEach((enemy, j) => {
            if(collision(bullet, enemy)) {
                bullets.splice(i,1);
                i--;

                rowThree.splice(j,1);
                j--;

                score += 20;
            }
        })
    })

    //shield, player bullet collision
    bullets.forEach((bullet, i) => {
        shields.forEach((shield, j) => {
            if(collision(bullet, shield)) {
                bullets.splice(i, 1);
                i--;

                shield.health -= 10;
            }
        })
    })

    //shield, enemy projectile collision
    projectiles.forEach((projectile, i) => {
        shields.forEach((shield, j) => {
            if(collision(projectile, shield)){
                projectiles.splice(i, 1);
            i--;

            shield.health -= 10;
            }
        })
    })

    //shield health
    shields.forEach((shield, i) => {
        if(shield.health == 0){
            shields.splice(i, 1);
            i--;
        }
    })

    //shooting
    if(key[' '] && shootTime >= 30){
        let bullet = new Bullet(player.x + (50/2) - (2 / 2), player.y - 10);
        bullets.push(bullet);
        shootTime = 0;
        shootAlert.play();
    }

    //reset update tick
    if(updateTick >= setTick){
        updateTick = 0;
    }

    //level reset
    if(rowOne.length == 0 && rowTwo == 0 && rowThree == 0){
        setLevel();
        level++;
    }

    shootTime++
}

function gameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "darkgreen";
    ctx.font = "40px Tiny5";
    ctx.fillText('Game Over', (canvas.width / 2) - 85, canvas.height / 2)

    ctx.font = "20px Tiny5";
    ctx.fillText('Press R To Reset', (canvas.width / 2) - 70, (canvas.height / 2) + 20)

    if(key['r']) {
        for(let l = 0; l < 3; l++){
            let live = new liveIcon((l * 35) + 5, 500 - 25);
            lives.push(live)
        }
        alive = true;
        setLevel();
        score = 0;
        level = 1;
    }
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