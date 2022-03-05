

const KickDT = {

    state: {
        next: 0,
        sequence: [],
        action: null,
    },

    initActions: (state) => {
        state.sequence = [{act: 'go_to_object', objName: 'fplb'}, {act: 'go_to_object', objName: 'fgrb'}, {act: 'goal', goal: 'gr' }]
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
        trueCond: 'isReadyState',
        falseCond: 'isKickToGoalAction'
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
        condition: (mgr, state) => mgr.getVisibleObject(state.action.objName).distance < 3,

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
                v: 40
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
    isReadyState: {
        condition: (mgr, state) => mgr.controller.agent.ready,

        trueCond:'isBallVisible',
        falseCond:'isObjectVisible'
    },

    // 10
    isBallVisible: {
        condition: (mgr, state) => !!mgr.getVisibleBall(),

        trueCond:'finishActionAfterGo',
        falseCond:'isObjectVisible'
    },

    // 11
    isKickToGoalAction: {
        condition: (mgr, state) => state.action && state.action.act === 'goal',

        trueCond:'isBallVisibleForKick',
        falseCond:'doNothing'
    },

    // 12
    finishActionAfterGo: {
        exec: (mgr, state) => {
            while (state.sequence[state.next].act !== 'goal') {
                state.next++
            }
            state.action = state.sequence[state.next]
        },
        next: 'isKickToGoalAction'
    },

    // 13
    doNothing: {
        exec: (mgr, state) => {
        },
        next: 'sendCommand'
    },

    // 14
    isBallVisibleForKick: {
        condition: (mgr, state) => !!mgr.getVisibleBall(),

        trueCond:'isAngleToBall0',
        falseCond:'turn45ToKick'
    },

    // 15
    turn45ToKick: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: 45
            }
        },
        next: 'sendCommand'
    },

    // 16
    isAngleToBall0: {
        condition: (mgr, state) => Math.abs(mgr.getVisibleBall().angle) < 1,

        trueCond:'isBallFar',
        falseCond:'turnToBall'
    },

    // 17
    isAimVisible: {
        condition: (mgr, state) => !!mgr.getVisibleObject(state.action.goal),

        trueCond:'kick',
        falseCond:'kickWeakly'
    },

    // 18
    kick: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 150,
                a: mgr.getVisibleObject(state.action.goal).angle
            }
        },
        next: 'sendCommand'
    },

    // 19
    kickWeakly: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 5,
                a: 65,
            }
        },
        next: 'sendCommand'
    },

    // 20
    turnToBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleBall().angle
            }
        },
        next: 'sendCommand'
    },

    //21
    isBallFar: {
        condition: (mgr, state) => mgr.getVisibleBall().distance > 0.5,
        trueCond: 'stepForward',
        falseCond: 'isAimVisible'
    },

    sendCommand: {
        exec: (mgr, state) => {
            mgr.sendCommand(state.command)
        }
    }
}

module.exports=KickDT