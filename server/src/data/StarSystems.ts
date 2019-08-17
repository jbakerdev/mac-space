
import * as Assets from '../../../client/assets/Assets'
import Commodities from './Commodities';
import { Metals } from '../../../enum';

export const Rigel:SystemState = {
    name: 'Rigel',
    x: 5000,
    y: 5000,
    stellarObjects: [{x: 550, y:550, asset: 'planet', 
        planetName: 'Rigel I',
        description: "It's alright",
        commodities: Commodities.Metals.concat(Commodities.Manufactured)
    }],
    asteroidConfig: [
        {
            type: Metals.SILVER,
            density: 1,
            isBelt: true
        },
        {
            type: Metals.IRON,
            density: 3,
            isBelt: true
        }
    ],
    assetList: Assets.defaults
}
export const Arcturus:SystemState = {
    name: 'Arcturus',
    x: 10000,
    y: 10000,
    stellarObjects: [
        {x: 850, y:750, 
            asset: 'planet', planetName: 'Haven', description: "It's Haveny",
            commodities: Commodities.Agriculture}
    ],
    asteroidConfig: [
        {
            type: Metals.SILVER,
            density: 1,
            isBelt: true
        },
        {
            type: Metals.IRON,
            density: 3,
            isBelt: true
        }
    ],
    assetList: Assets.defaults
}

export const Centauri:SystemState = {
    name: 'Centauri',
    x: 15000,
    y: 1000,
    stellarObjects: [{
        x: 150, 
        y:750, 
        asset: 'planet', 
        planetName: 'Centauri Prime', description: "It's Babylon 5-ey",
        commodities: Commodities.Metals
    }],
    asteroidConfig: [
        {
            type: Metals.SILVER,
            density: 1,
            isBelt: true
        },
        {
            type: Metals.IRON,
            density: 3,
            isBelt: true
        }
    ],
    assetList: Assets.defaults
}

export const StarSystems:Array<SystemState> = [
    Rigel, Arcturus, Centauri
]