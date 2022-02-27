
const CENTRE_GOAL_FLAG = 'gr'
const FPC = 'fprc'
const FPT = 'fprt'
const FPB = 'fprb'
const ENEMY_GOAL = 'gl'

const GKDecisionTree = {

    state: {

    },

    root: {
        exec: (mgr, state) => {
            state.command = null
        },
        next: 'isBallVisible'
    },

    // 1
    isBallVisible: {
        condition: (mgr, state) => !!mgr.getVisibleBall(),
        trueCond: 'isBallFar',
        falseCond: 'isFlagGoalVisible'
    },

    // 2
    isBallFar: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            return !!ball && ball.distance > 30
        },
        trueCond: 'isFlagGoalVisible',
        falseCond: 'isBallOnViewerDistance'
    },

    // 3
    canCatchBall: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            const playersCloseToBall = mgr.controller.visibleObjects.players.filter(player => Math.abs(player.distance - ball.distance) < 5 )
            return playersCloseToBall.length > 0
        },
        trueCond: 'catchBall',
        falseCond: 'isBallClose'
    },

    // 4
    catchBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'catch',
                v: mgr.getVisibleBall().angle
            }
        },
        next: 'sendCommand'
    },

    // 5
    isBallClose: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            return ball.distance <= 0.5
        },
        trueCond: 'isKickDirectionVisible',
        falseCond: 'isAngleToObjectBig'
    },

    // 6
    isAngleToObjectBig: {
        condition: (mgr, state) =>{
            return Math.abs(mgr.getVisibleObject('b').angle) > 1
        } ,
        trueCond:"rotateToObject",
        falseCond:"goToObject",
    },

    // 7
    goToObject: {
        exec: (mgr, state) => {
            const objDistance = mgr.getVisibleObject('b').distance
            state.command = {
                n: 'dash',
                v: 100
            }
        },
        next: "sendCommand"
    },

    // 8
    rotateToObject: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleObject('b').angle
            }
        },
        next: "sendCommand"
    },

    // 9
    isKickDirectionVisible: {
        condition: (mgr, state) => !!mgr.getVisibleObject(ENEMY_GOAL),
        trueCond:"strongKick",
        falseCond:"rotateWithBall",
    },

    // 10
    strongKick: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 300,
                a: mgr.getVisibleObject(ENEMY_GOAL).angle
            }
        },
        next: "sendCommand"
    },


    // 11
    rotateWithBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 3,
                a: 60
            }
        },
        next: "sendCommand"
    },


    // 12
    isFlagGoalVisible: {
        // todo
        condition: (mgr, state) => !!mgr.getVisibleObject(CENTRE_GOAL_FLAG),
        trueCond: 'isFlagGoalFar',
        falseCond: 'isFlagsPRVisible'
    },


    // 13
    isFlagGoalFar: {
        // todo
        condition: (mgr, state) => mgr.getVisibleObject(CENTRE_GOAL_FLAG).distance > 1,
        trueCond: 'isAngleToFlagGoalSmall',
        falseCond: 'turn45'
    },


    // 14
    isAngleToFlagGoalSmall: {
        condition: (mgr, state) => Math.abs(mgr.getVisibleObject(CENTRE_GOAL_FLAG).angle) <= 1,
        trueCond: 'goToFlagGoal',
        falseCond: 'turnToFlagGoal'
    },


    // 15
    goToFlagGoal: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 100
            }
        },
        next: 'sendCommand'
    },


    // 16
    turnToFlagGoal: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleObject(CENTRE_GOAL_FLAG).angle
            }
        },
        next: 'sendCommand'
    },


    // 17
    isFlagsPRVisible : {
        condition: (mgr, state) => {
            const fpc = mgr.getVisibleObject(FPC)
            const centre = mgr.getVisibleObject('fc')
            // const fpt = mgr.getVisibleObject(FPT)
            // const fpb = mgr.getVisibleObject(FPB)
            // return !!fpc && (!!fpt || !!fpb)

            return !!fpc && !!centre
        },
        trueCond: 'isFPRDistanceCorrect',
        falseCond: 'turn45'
    },


    // 18
    turn45: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: 20
            }
        },
        next: 'sendCommand'
    },


    // 19
    isFPRDistanceCorrect: {
        condition: (mgr, state) => {
            const fpc = mgr.getVisibleObject(FPC)
            const isFprCorrect = 15 <= fpc.distance && fpc.distance <= 20

            const fc = mgr.getVisibleObject('fc')
            console.log('IS_FLAGS_CORRECT', fpc, isFprCorrect, fc)
            return Math.abs(fpc.angle - fc.angle) < 2
                && isFprCorrect;

        },
        trueCond: 'turnToCentre',
        falseCond: 'turn45'
    },

    // 20
    turnToCentre: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleObject('fc').angle
            }
        },
        next: 'sendCommand'
    },

    // 21
    isBallOnViewerDistance: {
        condition: (mgr, state) => {
            return mgr.getVisibleBall().distance > 20
        },
        trueCond: 'turnToBall',
        falseCond: 'canCatchBall'
    },

    // 22
    turnToBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleBall().angle
            }
        },
        next: 'sendCommand'
    },

    sendCommand: {
        exec: (mgr, state) => {
            mgr.sendCommand(state.command)
        }
    }

}

module.exports = GKDecisionTree