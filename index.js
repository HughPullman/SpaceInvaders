const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreEl')
const highScore = document.getElementById('highScoreEl');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(){
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation = 0
        this.opacity = 1

        const image = new Image()
        image.src = './img/spaceship.png'
        image.onload = () =>{
            const scale = 0.15;    
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: (canvas.width / 2) - (this.width / 2),
                y: canvas.height - this.height - 30
            }
        }
    }

    draw(){

        c.save()
        c.globalAlpha = this.opacity
        c.translate(player.position.x + player.width/2, player.position.y + player.height/2)
        c.rotate(this.rotation)
        c.translate(-player.position.x - player.width/2, -player.position.y - player.height/2)
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )

        c.restore()
    }

    update(){
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
        
    }
}

class Projectile{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.radius = 4
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle{
    constructor({position, velocity, radius, colour, fades}){
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.colour = colour
        this.opacity = 1
        this.fades = fades
    }

    draw(){
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.colour
        c.fill()
        c.closePath()
        c.restore()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.fades){
            this.opacity -=0.01
        }
        
    }
}

class InvaderProjectile{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.width = 3
        this.height = 12
    }

    draw(){
        c.fillStyle = '#00FF00'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader{
    constructor({position}){
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/invader.png'
        image.onload = () =>{
            const scale = 0.04;    
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw(){

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )

    }

    update({velocity}){
        if(this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
        
    }

    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width /2,
                y: this.position.y + this.height
            },
            velocity:{
                x: 0,
                y: 5
            }
        }))
    }
}

class Grid {
    constructor(){
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 4,
            y: 0
        }
        
        this.invaders = []

        const columns = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 4 + 2)

        this.width = columns * 44

        for(let i = 0; i < columns; i++){
            for(let j = 0; j < rows; j++){
                this.invaders.push(new Invader({position: {
                    x: i * 45,
                    y: j * 40
                }}))
            }
        }
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0

        if(this.position.x + this.width >= canvas.width || this.position.x <=0){
            this.velocity.x = -this.velocity.x
            this.velocity.y = 40
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];



const keys = {
    a: {
        pressed: false
    },
    d:{
        pressed: false
    },
    space:{
        pressed: false
    }

}

let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);
let game = {
    over: false,
    active: false
}
let score = 0;

function startGame (){
    game.active = true;
    animate();
    document.getElementById('startBtn').style.visibility = 'hidden';
    document.getElementById('logo').style.visibility = 'hidden';
    document.getElementById('controls').style.visibility = 'hidden';
}

function restartGame (){
    game.active = true;
    game.over = false;
    player.opacity = 1;
    projectiles.splice(0, projectiles.length);
    grids.splice(0, grids.length);
    invaderProjectiles.splice(0, invaderProjectiles.length);
    frames = 0;
    score = 0;
    scoreEl.innerHTML = '0';
    animate();
    document.getElementById('gameOver').style.visibility = 'hidden';
}

for(let i = 0; i < 150; i++){
    particles.push(new Particle({
    position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    },
    velocity:{
        x: 0,
        y: 0.5
    },
    radius: Math.random()*2,
    colour: '#ffebd1',
    fades: false
}))} 

function createParticles({object, colour, fades}){
    for(let i = 0; i < 15; i++){
        particles.push(new Particle({
        position: {
            x: object.position.x + object.width/2,
            y: object.position.y + object.height/2
        },
        velocity:{
            x: (Math.random() -0.5) * 2,
            y: (Math.random() -0.5) * 2
        },
        radius: Math.random()*3,
        colour: colour || '#8400FF',
        fades: fades
    }))} 
}
function animate(){
    if(!game.active) return
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    particles.forEach((particle, i) =>{

        if(particle.position.y - particle.radius >= canvas.height){
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }
        if(particle.opacity <=0){
            setTimeout(() =>{
                particles.splice(i, 1)
            },0)
        } else{
            particle.update()
        }
       
    })

    invaderProjectiles.forEach((invaderProjectile, index) =>{
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            },0)
        } else{
            invaderProjectile.update()
        }
        //projectile hits player
        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width){

                setTimeout(() => {
                    invaderProjectiles.splice(index, 1)
                    player.opacity = 0
                   
                },0)

                setTimeout(() => {
                    game.active = false
                    document.getElementById('gameOver').style.visibility = 'visible';
                    document.getElementById('controls').style.visibility = 'visible';
                    game.over = true                 
                    if(score > highScore.innerHTML){
                        highScore.innerHTML = score;
                    }
                },1000)
                
            createParticles({
                object: player,
                colour: 'white',
                fades: true
            })
        }
    })
    projectiles.forEach((projectile, index) =>{
        if(projectile.position.y + projectile.radius <= 0){
            setTimeout(() =>{
                projectiles.splice(index, 1)
            }, 0)
        } else{
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) =>{
        grid.update()
        //spawn projectiles
        if(frames % 100 === 0 && grid.invaders.length > 0){
            grid.invaders[Math.floor(Math.random()* grid.invaders.length)].shoot(invaderProjectiles)
        }
        setTimeout(() => {
            if(grid.invaders[0].position.y >= player.position.y - 169){
                setTimeout(() => {
                    player.opacity = 0                  
                    
                },0)
    
                setTimeout(() => {
                    document.getElementById('gameOver').style.visibility = 'visible';
                    document.getElementById('controls').style.visibility = 'visible';
                    if(score > highScore.innerHTML){
                        highScore.innerHTML = score;
                    }
                    game.over = true
                    game.active = false
                },1000)
            }
        }, 10)
            

        grid.invaders.forEach((invader, i) =>{
            invader.update({velocity: grid.velocity})

            //projectile hits enemy
            projectiles.forEach((projectile, j) =>{
                if(
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height
                    && projectile.position.x + projectile.radius >= invader.position.x
                    && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                    && projectile.position.y + projectile.radius >= invader.position.y
                    ){                     
                    
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(invader2 =>invader2 === invader)
                        const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)

                        if(invaderFound && projectileFound){
                            score +=100;
                            scoreEl.innerHTML = score
                            createParticles({
                                object: invader,
                                fades: true
                            })
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)
                }
            })
            
        })
    })

    if(keys.a.pressed && player.position.x >= 0){
        player.velocity.x = -8;
        player.rotation = -0.15;
    }else if(keys.d.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 8;
        player.rotation = 0.15;
    } else{
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if(frames % randomInterval === 0){
        grids.push(new Grid)
        randomInterval = Math.floor((Math.random() * 500) + 500);
        frames = 0
    }


    frames++
}

addEventListener('keydown' , ({key}) => {
    if(game.over) return

    switch(key){
        case 'a':
            keys.a.pressed = true
            break
        case 'ArrowLeft':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case 'ArrowRight':
            keys.d.pressed = true
            break
        case ' ':
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width/2,
                        y: player.position.y
                    },
                    velocity:{
                        x: 0,
                        y: -12
                    }
                })
            )
            break
    }
})

addEventListener('keyup' , ({key}) => {
    switch(key){
        case 'a':
            keys.a.pressed = false
            break
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 'ArrowRight':
            keys.d.pressed = false
            break
        case ' ':
            break
    }
})