const MAX_TACT = 5

const PassDT = {

    state: {
        next: 0,
        sequence: [],
        command: null,
        action: null,
        tact: 0
    },

    initActions: (state) => {
        state.sequence = [{act: 'go_to_object', objName: 'fplc'}, {act: 'go_to_object', objName: 'b'}, {act: 'pass'}, {act: 'say'}]
        state.next = 0
    },

    root: {
        exec: (mgr, state) => {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: 'isGoToObject'
    },

    // 1
    isGoToObject: {
        condition: (mgr, state) => state.action && state.action.act === 'go_to_object',
        trueCond: 'isObjectVisible',
        falseCond: 'isActionPass'
    },

    // 2
    isObjectVisible: {
        condition: (mgr, state) => !!mgr.getVisibleObject(state.action.objName),
        trueCond:'isAngleToObject0',
        falseCond:'turn45'

    },


    //3
    isAngleToObject0: {
        condition: (mgr, state) => Math.abs(mgr.getVisibleObject(state.action.objName).angle) < 1,
        trueCond: 'isDistanceToKick',
        falseCond: 'turnToObject'
    },

    // 4
    isDistanceToKick: {
        condition: (mgr, state) => mgr.getVisibleObject(state.action.objName).distance < 0.5,

            trueCond:'finishAction',
            falseCond:'stepForward'
    },

    // 5
    finishAction: {
        exec: (mgr, state) => {
            state.next++
        },
    },

    // 6
    stepForward: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 200
            }
        },
        next: 'sendCommand'
    },

    // 7
    turnToObject: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleObject(state.action.objName).angle
            }
        },
        next: 'sendCommand'
    },

    // 8
    turn45: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: 45
            }
        },
        next: 'sendCommand'
    },

    // 9
    isActionPass: {
        condition: (mgr, state) => state.action && state.action.act === 'pass',

        trueCond:'isBallVisible',
        falseCond:'isActionSay'
    },

    // 10
    isAngleToBall0: {
        condition: (mgr, state) => Math.abs(mgr.getVisibleBall().angle) < 1,

        trueCond:'isBallFar',
        falseCond:'turnToBall'
    },

    // 11
    isTeammateVisible: {
        condition: (mgr, state) => mgr.controller.visibleObjects.players
            .filter(player => player.team === mgr.controller.agent.team).length > 0,

        trueCond:'passWithDirectionDependsPower',
        falseCond:'isNTactsPassed'
    },

    // 12
    passWithDirectionDependsPower: {
        exec: (mgr, state) => {
            const ftr10 = mgr.getVisibleObject('ftr10')
            const ftr20 = mgr.getVisibleObject('ftr20')
            const ftr30 = mgr.getVisibleObject('ftr30')
            const ftr40 = mgr.getVisibleObject('ftr40')
            const ftr50 = mgr.getVisibleObject('ftr50')
            const frt = mgr.getVisibleObject('frt')

            const leftFlagsSeen = ftr10 || ftr20 || ftr30 || ftr40 || ftr50 || frt

            const player = mgr.controller.visibleObjects.players
                .filter(player => player.team === mgr.controller.agent.team)[0]
            const angle = leftFlagsSeen ? 30 : -30
            console.log('KICK POWER: ', player.distance)
            state.next++
            state.command = {
                n: 'kick',
                v: player.distance * 2,
                a: player.angle + angle
            }
        },
        next: 'sendCommand'
    },

    // 13
    isNTactsPassed: {
        condition: (mgr, state) => state.tact > MAX_TACT,

        trueCond:'kickWeaklyAndResetTacts',
        falseCond:'incrementTacts'
    },

    // 14
    kickWeaklyAndResetTacts: {
        exec: (mgr, state) => {
            state.tact = 0
            state.command = {
                n: 'kick',
                v: 3,
                a: 45
            }
        },
        next: 'sendCommand'
    },

    // 15
    incrementTacts: {
        exec: (mgr, state) => {
            state.tact++
        },
        next: 'sendCommand'
    },

    // 16
    turnToBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleBall().angle
            }
        },
        next: 'sendCommand'
    },

    // 17
    isActionSay: {
        condition: (mgr, state) =>  state.action && state.action.act === 'say',

        trueCond:'say',
        falseCond:'doNothing'
    },

    // 18
    say: {
        exec: (mgr, state) => {
            state.next++
            state.command = {
                n: 'say',
                v: 'go'
            }
        },
        next: 'sendCommand'
    },

    // 19
    doNothing: {
        exec: (mgr, state) => {
        },
        next: 'sendCommand'
    },

    //20
    isBallFar: {
        condition: (mgr, state) => mgr.getVisibleBall().distance > 0.5,
        trueCond: 'stepForward',
        falseCond: 'isTeammateVisible'
    },

    //21
    isBallVisible: {
        condition: (mgr, state) => !!mgr.getVisibleBall(),
        trueCond: 'isAngleToBall0',
        falseCond: 'turn45'
    },

    sendCommand: {
        exec: (mgr, state) => {
            mgr.sendCommand(state.command)
        }
    }
}

module.exports = PassDT