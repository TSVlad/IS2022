const {getDistanceBetweenObjects} = require("./field");

const CENTRE_GOAL_FLAG = 'gr'
const FPC = 'fprc'
const FPT = 'fprt'
const FPB = 'fprb'
const ENEMY_GOAL = 'gl'

const GKDecisionTree = {

    state: {
        lastDistanceToBall: null,
        lastAction: null
    },

    root: {
        exec: (mgr, state) => {
            state.command = null
            if (state.currentDitanceToBall) {
                state.lastDistanceToBall = state.currentDitanceToBall
            }
        },
        next: 'isBallVisible'
    },

    // 1
    isBallVisible: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            if (ball) {
                state.currentDitanceToBall = ball.distance
            }
            return ball
        },
        trueCond: 'isBallFar',
        falseCond: 'isFlagGoalVisible'
    },

    // 2
    isBallFar: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            return !!ball && ball.distance > 20
        },
        trueCond: 'isFlagGoalVisible',
        falseCond: 'isDistanceToCatch'
    },

    // 3
    shouldKick: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            const fpc = mgr.getVisibleObject(FPC)
            const fpt = mgr.getVisibleObject(FPT)
            const fpb = mgr.getVisibleObject(FPB)
            const pFlagVisible = fpc || fpt || fpb
            const playersCloseToBall = mgr.controller.visibleObjects.players.filter(player => getDistanceBetweenObjects(player, ball) < ball.distance)
            const result = playersCloseToBall.length === 0 && ball.distance >= state.lastDistanceToBall && pFlagVisible

            console.log('SHOULD_KICK')
            console.log(result, ball)
            console.log(' players to ball', playersCloseToBall)
            console.log(' distance', ball.distance, state.lastDistanceToBall)
            console.log('   flags', pFlagVisible)
            return result
        },
        trueCond: 'isBallClose',
        falseCond: 'isNeedToCatch'
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
            console.log("IS_BALL_CLOSE", ball)
            return ball.distance <= 0.5
        },
        trueCond: 'isKickDirectionVisible',
        falseCond: 'isAngleToObjectBig'
    },

    // 6
    isAngleToObjectBig: {
        condition: (mgr, state) =>{
            console.log("IS_ANGLE_TO_OBJECT", mgr.getVisibleObject('b'))
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
        condition: (mgr, state) =>
            !!mgr.getVisibleObject(ENEMY_GOAL)
            || !!mgr.getVisibleObject('fct')
            || !!mgr.getVisibleObject('fc')
            || !!mgr.getVisibleObject('fcb'),

        trueCond:"strongKick",
        falseCond:"rotateWithBall",
    },

    // 10
    strongKick: {
        exec: (mgr, state) => {
            var direction = mgr.getVisibleObject(ENEMY_GOAL)
            direction = !!direction ? direction : mgr.getVisibleObject('fct')
            direction = !!direction ? direction : mgr.getVisibleObject('fc')
            direction = !!direction ? direction : mgr.getVisibleObject('fcb')

            state.command = {
                n: 'kick',
                v: 300,
                a: direction.angle
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

    // 23
    isAngleToBallBig: {
        condition: (mgr, state) => Math.abs(mgr.getVisibleBall().angle) > 1,
        trueCond: 'turnToBall',
        falseCond: 'shouldKick'
    },

    // 24
    isNeedToCatch: {
        condition: (mgr, state) => {
            const ball = mgr.getVisibleBall()
            console.log('IS_NEED_TO_CATCH', ball)
            return ball.distance <= 3
        },
        trueCond: 'catchBall',
        falseCond: 'doGoToBall'
    },

    // 25
    doNothing: {
        exec: (mgr, state) => {
            console.log('DO NOTHING')
        },
        next: 'sendCommand'
    },

    //26
    doGoToBall: {
        condition: (mgr, state) => mgr.getVisibleBall().distance < 15,
        trueCond: 'goToBall',
        falseCond: 'doNothing'
    },

    // 27
    stepToCatch: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 200,
                a: (90 - state.angleToTurnFromCenter)
            }

            if (mgr.getVisibleBall().angle < 0) {
                state.command.a = (180 - state.command.a) * -1
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