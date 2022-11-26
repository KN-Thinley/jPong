//getting the main game container and hiding it {using jQuery}
var gameContainer = $(document).find(".container > .game-container")
$(gameContainer).hide()

// getting the instruction container
var instructions = $(document).find('.instructions')

//getting the start game button class
var button = $(document).find('.btn')


// Importing the sounds 
let pongBounce = new Audio('/Sounds/pong bounce.mp3')
let pongBatHit1 = new Audio('/Sounds/pong bat hit1.mp3')
let pongBatHit2 = new Audio('/Sounds/pong bat hit2.mp3')
let pongBatHit3 = new Audio('/Sounds/pong bat hit3.mp3')
let pongBatDrop = new Audio('/Sounds/pong bat drop.mp3')

//audio for the scores
let player1Scores = new Audio('/Sounds/player1.mp3')
let player2Scores = new Audio('/Sounds/player2.mp3')

//audio for the winner of the game
let winnerAudio = new Audio('/Sounds/winner.mp3')

//array for the pong bat hit sounds 
let pongBatHitArr = [pongBatHit1, pongBatHit2, pongBatHit3]

// function to generate random sound when the pong hits the bat
function pongBatHit(){
    const pongBatHit = pongBatHitArr[Math.floor(Math.random()*pongBatHitArr.length)]
    if (pongBatHit === pongBatHit1){
        return pongBatHit1.play()
    }
    else if(pongBatHit === pongBatHit2){
        return pongBatHit2.play()
    }
    else{                    
        return pongBatHit3.play()
    }
}


//Assigning Initial speed and the speed increase of the pong
const INITIAL_SPEED = 0.085
const SPEED_INCREASE = 0.000009   

// class for the pong 
class Pong{
    constructor(pongElement){
        this.pongElement = pongElement;
        this.reset()
    }
    //getter and setter to get the position of the pong in both x and y 
    get x(){
        return parseFloat( getComputedStyle(this.pongElement).getPropertyValue("--x"))
    }
    set x(value){
        this.pongElement.style.setProperty("--x",value)
    }
    get y(){
        return parseFloat(getComputedStyle(this.pongElement).getPropertyValue("--y"))
    }
    set y(value){
        this.pongElement.style.setProperty("--y",value)
    }


    rect(){
        return this.pongElement.getBoundingClientRect()
    }
    //reset method to reset the position of the pong
    reset(){
        this.x = 50
        this.y = 50
        this.direction = {x:0}
        while(Math.abs(this.direction.x) <= 0.2 || Math.abs(this.direction.x) >= 0.9){
            const heading = randNumber(0,2 * Math.PI)
            this.direction =  {x:Math.cos(heading), y: Math.sin(heading)}
        }
        this.pongSpeed = INITIAL_SPEED;
        
    }

    //update method to let the ball move in the 2-dimensional plane as the time passes
    update(delta, batRects){
        this.x += this.direction.x*this.pongSpeed*delta;
        this.y += this.direction.y*this.pongSpeed*delta;
        this.pongSpeed += SPEED_INCREASE * delta;
        const rect = this.rect()

        //if the pong goes over the wall, we want them to return/ bounce back from those walls
        if(rect.bottom >= window.innerHeight || rect.top <= 0){
            this.direction.y *= -1;
            pongBounce.play()
        }

        if(batRects.some(r => isCollision(r, rect))){
            this.direction.x *= -1;
            pongBatHit()
        }
      
    } 
}

//class for the bats
SPEED = 0.02
class Bat{
    constructor(batElement){
        this.batElement = batElement;
        this.reset()
    }

    //getter and setter to get the position of the bats in the y direction
    get position(){
        return parseFloat(getComputedStyle(this.batElement).getPropertyValue('--position'))
    }
    set position(value){
        this.batElement.style.setProperty('--position', value)
    }
    rect(){
        return this.batElement.getBoundingClientRect()
    }

    // method to reset the position of the bat
    reset(){
        this.position = 50
    }

    //update method for the position of the computer paddle to follow the ball
    update(delta, pongHeight){
        this.position += SPEED*delta* (pongHeight - this.position)
    }
}

// function to generate a random number of min max number
function randNumber(min, max){
    return Math.random()*(max-min)+min
} 

//collision function for the ball to bounce back when they hit the bats
function isCollision(rect1, rect2){
    //return true if any of the sides is collided with the pong
    return rect1.left <= rect2.right && rect1.right >= rect2.left && rect1.top <= rect2.bottom && rect1.bottom >= rect2.top
}


//creating a new pong ball
const pong = new Pong(document.getElementById('pong'))

//creating bats for the player and the opponent
const playerBat = new Bat(document.getElementById('playerBat'));
const opponentBat = new Bat(document.getElementById('opponentBat'))

//variable to target the player and opponent score
const playerScore = document.getElementById('playerScore')
const opponentScore = document.getElementById('opponentScore')

//function to show when we lose 
function lose() {
    const rect = pong.rect()
    return rect.right >= window.innerWidth || rect.left <= 0
}

// function to handel the situation when we lose
//score incrementation 
function handleLose(){
    const rect = pong.rect()
    if(rect.right >= window.innerWidth){

        //adds the text content in the opponent and increment the score by one
        opponentScore.textContent = parseInt(opponentScore.textContent)+1
        player1Scores.play()
    }
    else {
        //adds the text content in the player whereby the score is increased by one
        playerScore.textContent = parseInt(playerScore.textContent)+1
        player2Scores.play()
    }
    //resets the position of the ball
    pong.reset()
    //resets the position of the computer bat
    opponentBat.reset()
}

//function to display the winner
function winner(){
    //displayer the opponent as the winner
    if(opponentScore.textContent === '11'){
        winnerAudio.play()
        alert('The Opponent has Won')   
    }
    //display the player as the winner
    else if(playerScore.textContent ==='11'){
        winnerAudio.play()
        alert('The Player has Won')
    }else return
    //restarts the current directory which is the current game all the way to the beginning
    window.location.reload('/')
}

//adding mousemove function to control the player
document.addEventListener('mousemove', e => {
    //converting the pixels in to percentage because we used vh in css
    playerBat.position = (e.y/window.innerHeight) * 100
})

//function for the main game working
//initiated using jQuery

$(document).ready(function startgame(){
    //runs the current as we click the button
    $(this).find(button).on("click", function(){

        // hides the button 
        $(button).hide()

        // hides the instruction container
        $(instructions).hide()

        // changes the background
        var background = $("body").css({"border": "4px solid white",
           "background": "rgb(15, 0, 44)",
           "overflow": "hidden"})
       $(background).show()

       //shows the whole game container
       $(gameContainer).show() 
       
       //the game running time
       //determines the refresh rate of the game
           let lastTime;
       function update(time){
           if (lastTime !=null){
               const delta = time - lastTime;
               pong.update(delta,[playerBat.rect(), opponentBat.rect()])
               opponentBat.update(delta, pong.y)
               //playerBat.update(delta,pong.y)
           }
           //displays the precreated functions
           if(lose()){
            handleLose()
            winner()
           }
            lastTime = time
           window.requestAnimationFrame(update)
       }
       window.requestAnimationFrame(update)
       })
}
)
