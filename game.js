const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let tileSize = 20;
let playerColor = "green";
let shootTime = 30;

//images
let ship = new Image();
ship.src = "ship.png";

let shootAlert = new Audio();
shootAlert.controls = true;
shootAlert.volume = 0.1;
shootAlert.src = "shoot.wav";

const fps = 60;

canvas.width = 500;
canvas.height = 500;

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
        ctx.drawImage(ship, this.pos.x, this.pos.y, 50, 40);
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
        this.y += -5;
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

class Enemy{

}

let player = new Player();
let bullets = [];

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
    shootTime++
    console.log("tick")
    console.log(bullets.length);
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

    //shooting
    if(key[' '] && shootTime >= 30){
        let bullet = new Bullet(player.pos.x + (50/2) - (2 / 2), player.pos.y);
        bullets.push(bullet);
        shootTime = 0;
        shootAlert.play();
    }
}

setInterval(() => {
    main();
}, 1000/fps)

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);