const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

const light = new THREE.AmbientLight( 0xffffff )
scene.add( light )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )

camera.position.z = 5
renderer.setClearColor( 0xB7C3F3, 1 )

const loader = new THREE.GLTFLoader()
let doll

const start_position = 6
const end_position = -start_position

const text = document.querySelector('.text')

let DEAD_PLAYERS = 0
let SAFE_PLAYERS = 0

const startBtn = document.querySelector('.start-btn')

//musics
const bgMusic = new Audio('./music/bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('./music/win.mp3')
const loseMusic = new Audio('./music/lose.mp3')

loader.load( './model/scene.gltf', function ( gltf ){
    scene.add( gltf.scene )
    doll = gltf.scene
    gltf.scene.position.set(0,-1, 0)
    gltf.scene.scale.set(0.4, 0.4, 0.4)
    startBtn.innerText = "start"
})

function lookBackward(){
    gsap.to(doll.rotation, {duration: .45, y: -3.15})
    setTimeout(() => dallFacingBack = false, 450)
}
function lookForward(){
    gsap.to(doll.rotation, {duration: .45, y: 0})
    setTimeout(() => dallFacingBack = true, 150)
}

function createCube(size, posX, rotY = 0, color = 0xfbc851){
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d )
    const material = new THREE.MeshBasicMaterial( { color } )
    const cube = new THREE.Mesh( geometry, material )
    cube.position.set(posX, 0, 0)
    cube.rotation.y = rotY
    scene.add( cube )
    return cube
}

//Creating runway
createCube({w: start_position * 2 + .21, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1
createCube({w: .2, h: 1.5, d: 1}, start_position, -.4)
createCube({w: .2, h: 1.5, d: 1}, end_position, .4)


class Player {
    constructor(name = "Player", radius = .25, posY = 0, color = 0xffffff){
        const geometry = new THREE.SphereGeometry( radius, 100, 100 )
        const material = new THREE.MeshBasicMaterial( { color } )
        const player = new THREE.Mesh( geometry, material )
        scene.add( player )
        player.position.x = start_position - .4
        player.position.z = 1
        player.position.y = posY
        this.player = player
        this.playerInfo = {
            positionX: start_position - .4,
            velocity: 0,
            name,
            isDead: false
        }
    }

    run(){
        if(this.playerInfo.isDead) return
        this.playerInfo.velocity = .03
    }

    stop(){
        gsap.to(this.playerInfo, { duration: .1, velocity: 0 })
    }

    check(){
        if(this.playerInfo.isDead) return
        if(!dallFacingBack && this.playerInfo.velocity > 0){
            text.innerText = this.playerInfo.name + " lost!!!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            loseMusic.play()
            if(DEAD_PLAYERS == players.length){
                text.innerText = "Everyone lost!!!"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
        if(this.playerInfo.positionX < end_position + .7){
            text.innerText = this.playerInfo.name + " is safe!!!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            winMusic.play()
            if(SAFE_PLAYERS == players.length){
                text.innerText = "Everyone is safe!!!"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
    }

    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

async function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}



const TIME_LIMIT = 25
async function init(){
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    lookBackward()
    await delay(500)
    text.innerText = "Gooo!!!"
    bgMusic.play()
    start()
}

let gameStat = "loading"
var players 
function start(){
    players = definePlayers()
    gameStat = "started"
    const progressBar = createCube({w: 8, h: .1, d: 1}, 0, 0, 0xebaa12)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"})
    setTimeout(() => {
        if(gameStat != "ended"){
            text.innerText = "Time Out!!!"
            loseMusic.play()
            gameStat = "ended"
        }
    }, TIME_LIMIT * 1000)
    startDall()
}

let dallFacingBack = true
async function startDall(){
   lookBackward()
   await delay((Math.random() * 1500) + 1500)
   lookForward()
   await delay((Math.random() * 750) + 750)
   startDall()
}


startBtn.addEventListener('click', () => {
    if(startBtn.innerText == "START"){
        init()
        document.querySelector('.modal').style.display = "none"
    }
})

function definePlayers(){
        var p1name = document.getElementById("player1").value
        var p2name = document.getElementById("player2").value
        if (p1name ==""){
            p1name = "Player 1"
        }
        if (p2name ==""){
            p2name = "Player 2"
        }
        const player1 = new Player(p1name, .25, .3, 0xD1FFC6)
        const player2 = new Player(p2name, .25, -.3, 0xFFCFD2)
        
        var players = [
            {
                player: player1,
                key: "ArrowUp",
                name: p1name
            },
            {
                player: player2,
                key: "w",
                name: p2name
            }
        ]
        return players
}

function animate(){
    renderer.render( scene, camera )
    //players = definePlayers()
    players.map(player => player.player.update())
    if(gameStat == "ended") return
    requestAnimationFrame( animate )
}
var players = definePlayers()
animate()

window.addEventListener( "keydown", function(e){
    if(gameStat != "started") return
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})
window.addEventListener( "keyup", function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})

window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}