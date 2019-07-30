import { Scene, Cameras, GameObjects, Physics, } from "phaser";
import { Arcturus, Rigel } from "../../data/StarSystems";
import Projectile from "./display/Projectile";
import ShipSprite from "./display/ShipSprite";
import * as Ships from '../../data/Ships'
import WebsocketClient from "../../WebsocketClient";

export default class StarSystem extends Scene {

    minimap: Cameras.Scene2D.BaseCamera
    player: Player
    activeShip: Ship
    ships: Map<string,Ship>
    planets: Array<GameObjects.Sprite>
    asteroids: Map<string, Physics.Arcade.Sprite>
    resources: GameObjects.Group
    explosions: GameObjects.Group
    projectiles: GameObjects.Group
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    currentSystem: SystemState
    selectedSystem: SystemState
    name: string
    jumpVector: JumpVector
    state:SystemState
    server: WebsocketClient

    constructor(config, jumpVector?:JumpVector){
        super(config)
        this.jumpVector = jumpVector
        this.state = config.state
        this.name = config.key
        this.server = config.server
        this.server.setListeners(this.onServerUpdate, this.onConnected, this.onConnectionError)
        console.log('star system '+config.key+' was booted.')
    }

    onReduxUpdate = () => {
        //TODO: rebuild ship sprites if needed (you bought a new ship or upgrade, etc)
        // this.player = store.getState().currentUser
        // store.subscribe(this.onReduxUpdate)
    }

    onConnected = () => {
        console.log('star system '+this.name+' connected!')
    }

    onConnectionError = () => {
        console.log('star system '+this.name+' FAILED to connect.')
    }

    onServerUpdate = (state:ServerSystemUpdate) => {
        //apply latest system state from server. TODO: connect this to wss instance somehow
        let initRoids = this.asteroids.size === 0
        state.asteroids.forEach(update=> {
            let asteroid = this.asteroids.get(update.id)
            if(asteroid){
                asteroid.setPosition(update.x, update.y)
                asteroid.data.values.hp = update.hp
                if(update.hp <= 0) {
                    this.destroyAsteroid(asteroid)
                }
            }
            else {
                this.spawnAsteroid(update)
            }
        })
        if(initRoids){
            let roids = []
            this.asteroids.forEach(aster=>roids.push(aster))
            this.physics.add.collider(this.projectiles, roids, this.playerShotAsteroid);
        }
        
        state.ships.forEach(update=> {
            let ship = this.ships.get(update.id)
            if(ship){
                ship.sprite.applyUpdate(update)
            }
            else {
                this.spawnShip(update.shipData)
            }
        })
    }
    
    preload = () =>
    {
        this.state.assetList.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
    }
    
    create = () =>
    {
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBoundsCollision();
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        this.minimap = this.cameras.add(0, 0, 100, 100).setZoom(0.1).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 400;
        
        this.selectedSystem = Arcturus
        this.currentSystem = Rigel

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 23, first: 23 }),
            frameRate: 20
        });

        this.explosions = this.add.group()

        this.projectiles = this.physics.add.group({ classType: Projectile  })
        this.projectiles.runChildUpdate = true

        //  Add player ship
        this.activeShip = this.player.ships.find(ship=>ship.id===this.player.activeShipId)
        this.activeShip.sprite = new ShipSprite(this.scene.scene, 1600, 400, this.activeShip.asset, this.projectiles, true, this.activeShip, this.server);
        this.ships.set(this.activeShip.id, this.activeShip)
    
        this.createStarfield()
        this.addPlanets()
        
        this.input.keyboard.on('keydown-L', (event) => {
            //TODO cycle available sites
            this.activeShip.sprite.startLandingSequence(this.planets[0])
        });
        this.input.keyboard.on('keydown-J', (event) => {
            this.activeShip.sprite.startJumpSequence(this.selectedSystem)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.activeShip.sprite.firePrimary()
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    update = () =>
    {
        if(!this.activeShip.sprite.landingSequence){
            if (this.cursors.left.isDown)
            {
                this.activeShip.sprite.rotateLeft()
            }
            else if (this.cursors.right.isDown)
            {
                this.activeShip.sprite.rotateRight()
            }
            if (this.cursors.up.isDown)
            {
                this.activeShip.sprite.thrust()
            }
            else if((this.activeShip.sprite.body as any).acceleration.x !== 0 || (this.activeShip.sprite.body as any).acceleration.y !== 0) {
                this.activeShip.sprite.thrustOff()
            }
        }
        
        //  Position the center of the camera on the player
        //  we want the center of the camera on the player, not the left-hand side of it
        this.cameras.main.scrollX = this.activeShip.sprite.x - 200;
        this.cameras.main.scrollY = this.activeShip.sprite.y - 200;
        this.minimap.scrollX = Phaser.Math.Clamp(this.activeShip.sprite.x, 0, 3000);
        this.minimap.scrollY = Phaser.Math.Clamp(this.activeShip.sprite.y, 0, 3000);
    }
    
    spawnShip = (config:ShipDataOnly) => {
        let ship = {...Ships[config.name], ...config}
        ship.sprite = new ShipSprite(this.scene.scene, 1600, 400, ship.asset, this.projectiles, false, ship, this.server)
        if(config.jumpVector){
            //TODO: set starting edge coords based on previous system coords, right now defaults to top left corner
            //ship.sprite.setPosition(config.jumpVector.startX, config.jumpVector.startY)
            ship.sprite.setVelocity(config.jumpVector.x*500, config.jumpVector.y*-500)
            ship.sprite.rotation = config.jumpVector.rotation
        }
        this.ships.set(ship.id, ship)
    }

    addPlanets = () => {
        let planets = []
        this.state.stellarObjects.forEach(obj=>{
            planets.push(this.add.sprite(obj.x, obj.y, obj.asset))
        })
        this.planets = planets
    }

    createStarfield ()
    {
        //  Starfield background
    
        //  Note the scrollFactor values which give them their 'parallax' effect
    
        var group = this.add.group();
    
        group.createMultiple([
            { key: 'bigStar', frameQuantity: 64, setScale: {x: 0.02, y:0.02} }, 
            { key: 'star', frameQuantity: 256, setScale: {x: 0.02, y:0.02} }
        ]);
    
        var rect = new Phaser.Geom.Rectangle(0, 0, 3200, 3200);
    
        Phaser.Actions.RandomRectangle(group.getChildren(), rect);
    
        group.children.iterate((child, index) => {
    
            var sf = Math.max(0.3, Math.random());
            this.minimap.ignore(child);
            
            
        }, this);
    }

    spawnAsteroid = (update:AsteroidUpdate) => {
        this.physics.add.sprite(update.x,update.y, update.type)
            .setData('hp', 3)
            .setData('id', update.id)
            .setScale(Phaser.Math.FloatBetween(0.8,0.1))
            .setRotation(Phaser.Math.FloatBetween(3,0.1))
    }

    playerGotResource = (player:Physics.Arcade.Sprite, resource:GameObjects.Sprite) =>
    {
        resource.destroy();
        //TODO
        //onAddCargo(resource.data.values.type, resource.data.values.weight)
    }

    playerShotAsteroid = (asteroid:Physics.Arcade.Sprite, projectile:Projectile) =>
    {
        projectile.destroy();
        asteroid.data.values.hp-=1

        if(asteroid.data.values.hp <= 0){
            this.destroyAsteroid(asteroid)
        }
    }

    destroyAsteroid = (asteroid:Physics.Arcade.Sprite) => {
        this.explosions.get(asteroid.x, asteroid.y, 'boom').play('explode')
        asteroid.destroy()
        //TODO: spawn resources
        //this.resources.get(asteroid.x, asteroid.y, asteroid.data.values.assetKey)
    }

    playerTouchedResource = (resource:Physics.Arcade.Sprite, player:Physics.Arcade.Sprite) =>
    {
        resource.destroy()
        player.data.values.resources++
    }
}