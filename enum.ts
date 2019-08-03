export const ApiUrl= 'ws://localhost:8082'
export const ReducerActions= {
    PLAYER_AVAILABLE: 'ma',
    MATCH_UPDATE: 'mu',
    MATCH_TICK: 'mt',
    PLAYER_READY: 'pr',
    PLAYER_ENTERED: 'pe',
    PLAYER_JOIN: 'pj',
    PLAYER_MAP_REPLACE: 'pmp',
    PLAYER_LEFT: 'pl',
    MATCH_START: 'ms',
    MATCH_WIN: 'mw',
    MATCH_LOST: 'ml',
    MATCH_CLEANUP: 'mc',
    TIMER_TICK:'tt',
    INIT_SERVER: 'is',
    CONNECTION_ERROR: 'ce',
    CONNECTED: 'c',
    SET_USER: 'su',
    PLAYER_REPLACE: 'prp',
    OPEN_PLANET: 'op',
    OPEN_MAP: 'om',
    PLAYER_EVENT: 'pev',
    BUY_COMMODITY: 'bcc',
    SELL_COMMODITY: 'scc',
    PHASER_SCENE_CHANGE:'phsr'
}

export enum PlayerEvents { 
    ROTATE_L= 'rl',
    ROTATE_R= 'rr',
    THRUST_OFF= 'to',
    THRUST= 't',
    FIRE_PRIMARY= 'fp',
    SERVER_STATE= 'ss',
    PLAYER_SPAWNED= 'ps',
    START_LANDING='sl',
    STOP_LANDING='stl',
    START_JUMP='sj',
    TAKE_OFF='take_off',
    SELECT_SYSTEM='sys',
    SELL_COMMODITY='scc',
    BUY_COMMODITY='bcc'
}

export enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_EVENT_ACK= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su'
}
