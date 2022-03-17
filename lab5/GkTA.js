const {getDistanceBetweenObjects, getObjectCoordinates, findCrossWithGoal} = require("../field");

const PENALTY_AREA_X = 36
const PENALTY_AREA_Y = 20

const HISTORY_SIZE = 5
const GkTA = {
    state: {
        currentNode: 'start',
        envInfo: {},
        envHistory: [],
        angleToTurnFromCenter: 0,

        addAngle: angle => {
            const newAngle = this.angleToTurnFromCenter + angle
            if (newAngle > 180){
                this.angleToTurnFromCenter = -360  + newAngle
            } else if (newAngle < -180){
                this.angleToTurnFromCenter = 360 + newAngle
            } else {
                this.angleToTurnFromCenter = newAngle
            }
        },
    },

    addInfo: (state, info) => {
        if (state.envInfo) {
            state.envHistory.unshift(state.envInfo)
            if (state.envHistory.length > HISTORY_SIZE) {
                state.envHistory.pop()
            }
        }
        state.envInfo = info
    },

    restart: (state) => {
        state.currentNode = 'start'
        state.envInfo = {}
        state.envHistory = []
    },

    nodes: {
        // 1
        start: {n: "start", e: ['start_ballInvisibleTurn45', 'start_ballVisible']},
        // 2
        ballInvisibleTurn45: {
            n: "ballInvisibleTurn45", e: [],
            getCommand: (state) => {
                state.addAngle(45)
                return {
                    n: 'turn',
                    v: 45
                }
            }
        },
        // 3
        ballVisible: {
            n: "ballVisible",
            e: ['undefinedBallCoordinates', 'ballVisible_turnToBall', 'ballVisible_needStayAtGoal', 'ballVisible_readyToAction']
        },
        // 4
        turnToBall: {
            n: "turnToBall", e: [],
            getCommand: (state) => {
                state.addAngle(state.envInfo.ball.angle)
                return {
                    n: 'turn',
                    v: state.envInfo.ball.angle
                }
            }
        },
        // 5
        needStayAtGoal: {
            n: "needStayAtGoal",
            e: ['needStayAtGoal_coordinatesKnown', 'needStayAtGoal_noCoordinates']
        },
        // 6
        needToStayGoalAndTurn45: {
            n: "needToStayGoalAndTurn45", e: ['needToStayGoalAndTurn45_needStayAtGoal'],
            getCommand: (state) => {
                state.addAngle(45)
                return {
                    n: 'turn',
                    v: 45
                }
            }
        },
        // 7
        coordinatesKnown: {
            n: "coordinatesKnown",
            e: ['coordinatesKnown_stayedGoal', 'coordinatesKnown_coordinatesWrong']
        },
        // 8
        stepToGoal: {
            n: "stepToGoal", e: ['stepToGoal_needStayAtGoal'],
            getCommand: (state) => {
                return {
                    n: 'dash',
                    v: 50,
                    a: state.envInfo.flags['gr'].angle
                }
            }
        },
        // 9
        stayedGoal: {n: "stayedGoal", e: ['stayedGoal_turnToFlag', 'stayedGoal_stayedGoalAndTurn45']},
        // 10
        turnToFlag: {
            n: "turnToFlag", e: [],
            getCommand: (state) => {
                state.angleToTurnFromCenter = 0
                return {
                    n: 'turn',
                    v: state.envInfo.flags['fc'].angle
                }
            }
        },
        // 11
        stayedGoalAndTurn45: {
            n: "stayedGoalAndTurn45", e: ['stayedGoalAndTurn45_stayedGoal'],
            getCommand: (state) => {
                state.addAngle(45)
                return {
                    n: 'turn',
                    v: 45
                }
            }
        },
        // 12
        readyToAction: {n: "readyToAction", e: ['readyToAction_catching', 'readyToAction_exitToKick']},
        // 13
        catching: {n: "catching", e: ['catching_catchBall', 'catching_stepToFutureBall']},
        // 14
        catchBall: {
            n: "catchBall", e: [],
            getCommand: (state) => {
                console.log('CATCH_BALL', state.envInfo.ball.angle)

                const angle = Math.abs(state.envInfo.ball.angle) <= 5 ? state.envInfo.ball.angle : state.envInfo.ball.angle < 0 ? -30 : 30
                return {
                    n: 'catch',
                    v: angle
                    // v: 0
                }
            }
        },
        // 15
        stepToFutureBall: {
            n: "stepToFutureBall", e: [],
            getCommand: (state) => {
                if (!state.envInfo.coordinates) {
                    return {
                        n: 'turn',
                        v: 0
                    }
                }
                const ballCoordinates = getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball)
                if (!ballCoordinates) {
                    return {
                        n: 'turn',
                        v: 0
                    }
                }

                let prevCoordinates = null
                for (let i = state.envHistory.length - 1; i >= 1; i--) {
                    const env = state.envHistory[i]
                    if (env.ball) {
                        if (!env.coordinates) {
                            continue
                        }
                        prevCoordinates = getObjectCoordinates(env.coordinates, Object.values(env.flags), env.ball)
                        break
                    }
                }
                if (!prevCoordinates) {
                    return {
                        n: 'turn',
                        v: 0
                    }
                }

                const command = {
                    n: 'dash',
                    v: 150,
                    a: (90 - state.angleToTurnFromCenter)
                }
                let yCross = findCrossWithGoal(
                    ballCoordinates.x,
                    ballCoordinates.y,
                    prevCoordinates.x,
                    prevCoordinates.y
                )

                console.log("STEP_TO_CATCH", ballCoordinates, prevCoordinates, yCross, state.envInfo.coordinates)
                if (yCross > state.envInfo.coordinates.y) {
                    command.a = (180 - command.a) * -1
                    console.log('STEP LEFT')
                } else {
                    console.log('STEP RIGHT')
                }

                return command
            }
        },
        // 16
        exitToKick: {n: "exitToKick", e: ['exitToKick_needKickOutBall', 'exitToKick_needGoToBall']},
        // 17
        needGoToBall: {
            n: "needGoToBall",
            e: ['needGoToBall_needGoToBallAndTurnToBall', 'needGoToBall_angleAllow']
        },
        // 18
        needGoToBallAndTurnToBall: {
            n: "needGoToBallAndTurnToBall", e: ['needGoToBallAndTurnToBall_needGoToBall'],
            getCommand: (state) => {
                state.addAngle(state.envInfo.ball.angle)
                return {
                    n: 'turn',
                    v: state.envInfo.ball.angle
                }
            }
        },
        // 19
        needGoToBallAndStepToBall: {
            n: "needGoToBallAndStepToBall", e: [],
            getCommand: (state) => {
                return {
                    n: 'dash',
                    v: 100,
                    a: state.envInfo.ball.angle
                }
            }
        },
        // 20
        needKickOutBall: {
            n: "needKickOutBall",
            e: ['needKickOutBall_weakKickInSide', 'needKickOutBall_kickOutToRandomFlag']
        },
        // 21
        weakKickInSide: {
            n: "weakKickInSide", e: ['weakKickInSide_turnToBallToKickOut'],
            getCommand: (state) => {
                const topFlags = Object.keys(state.envInfo.flags).filter(flag => flag.startsWith('ft') || flag.startsWith('frt'))
                const bottomFlags = Object.keys(state.envInfo.flags).filter(flag => flag.startsWith('fb') || flag.startsWith('frb'))
                const coefficient = topFlags.length > bottomFlags.length ? -1 : 1
                return {
                    n: 'kick',
                    v: 3,
                    a: 60 * coefficient
                }
            }
        },
        // 22
        turnToBallToKickOut: {
            n: "turnToBallToKickOut", e: ['turnToBallToKickOut_stepBallToKickOut'],
            getCommand: (state) => {
                const angle = state.envInfo.ball ? state.envInfo.ball.angle : 0
                state.addAngle(angle)
                return {
                    n: 'turn',
                    v: angle
                }
            }
        },
        // 23
        stepBallToKickOut: {
            n: "stepBallToKickOut", e: [],
            getCommand: (state) => {
                return {
                    n: 'dash',
                    v: state.envInfo.ball ? 50 : 0,
                    a: state.envInfo.ball ? state.envInfo.ball.angle : 0
                }
            }
        },
        // 24
        kickOutToRandomFlag: {
            n: "kickOutToRandomFlag", e: ['kickOutToRandomFlag_needStayAtGoal'],
            getCommand: (state) => {
                const visibleFlags = Object.keys(state.envInfo.flags).filter(flag => flag.startsWith('fc'))
                return {
                    n: 'kick',
                    v: 150,
                    a: state.envInfo.flags[visibleFlags[0]].angle
                }
            }
        },
        // 25
        coordinatesWrong: {
            n: "coordinatesWrong",
            e: ['coordinatesWrong_coordinatesWrongAndTurn45', 'coordinatesWrong_stepToGoal']
        },
        // 26
        coordinatesWrongAndTurn45: {
            n: "coordinatesWrong", e: ['coordinatesWrongAndTurn45_coordinatesWrong'],
            getCommand: (state) => {
                state.addAngle(45)
                return {
                    n: 'turn',
                    v: 45
                }
            }
        },
        // 27
        noCoordinates: {n: "noCoordinates", e: ['noCoordinates_goalVisible', 'noCoordinates_needToStayGoalAndTurn45']},
        // 28
        goalVisible: {n: "goalVisible", e: ['goalVisible_stepToGoal', 'goalVisible_needToStayGoalAndTurn45']},
        // 29
        angleAllow: {n: "eAllow", e: ['angleAllow_needStayAtGoal', 'angleAllow_needGoToBallAndStepToBall']},
    },

    edges: {
        // 1
        start_ballInvisibleTurn45: {
            destination: 'ballInvisibleTurn45',
            condition: (state) => {
                return !state.envInfo.ball
            }
        },
        // 2
        start_ballVisible: {
            destination: 'ballVisible',
            condition: (state) => {
                return !!state.envInfo.ball
            }
        },
        // 3
        ballVisible_turnToBall: {
            destination: 'turnToBall',
            condition: (state) => {
                const ball = state.envInfo.ball
                const ballCoordinates = state.envInfo.coordinates ? getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), ball) : null

                if (!ballCoordinates) {
                    return false
                }

                const dist = Math.sqrt(Math.pow(ballCoordinates.x - 52.5, 2) + Math.pow(ballCoordinates.y, 2))

                return dist <= 30 && (ballCoordinates.x < PENALTY_AREA_X || Math.abs(ballCoordinates.y) > 20)
            }
        },
        //4
        ballVisible_needStayAtGoal: {
            destination: 'needStayAtGoal',
            condition: (state) => {
                const ball = state.envInfo.ball
                const ballCoordinates = state.envInfo.coordinates ? getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), ball) : null
                if (!ballCoordinates) {
                    return false
                }
                const distFromGoals = Math.sqrt(Math.pow(ballCoordinates.x - 52.5, 2) + Math.pow(ballCoordinates.y, 2))
                return distFromGoals > 30
            }
        },
        // 5
        ballVisible_readyToAction: {
            destination: 'readyToAction',
            condition: (state) => {
                const ballCoordinates = state.envInfo.coordinates ? getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball) : null
                return ballCoordinates.x >= PENALTY_AREA_X && Math.abs(ballCoordinates.y) <= PENALTY_AREA_Y
            }
        },
        // 6
        needStayAtGoal_coordinatesKnown: {
            destination: 'coordinatesKnown',
            condition: (state) => {
                console.log('COORD', state.envInfo.coordinates)
                return !!state.envInfo.coordinates
            }
        },
        // 7
        needStayAtGoal_noCoordinates: {
            destination: 'noCoordinates',
            condition: (state) => {
                console.log('COORD', state.envInfo.coordinates)
                return !state.envInfo.coordinates
            }
        },
        // 8
        needToStayGoalAndTurn45_needStayAtGoal: {
            destination: 'needStayAtGoal',
            condition: (state) => {
                return true
            }
        },
        //9
        coordinatesKnown_stayedGoal: {
            destination: 'stayedGoal',
            condition: (state) => {
                return (state.envInfo.coordinates.x - 52.5) ** 2 + (state.envInfo.coordinates.y) ** 2 <= 1
            }
        },
        // 10
        coordinatesKnown_coordinatesWrong: {
            destination: 'coordinatesWrong',
            condition: (state) => {
                return (state.envInfo.coordinates.x - 52.5) ** 2 + (state.envInfo.coordinates.y) ** 2 > 1
            }
        },
        // 11
        stepToGoal_needStayAtGoal: {
            destination: 'needStayAtGoal',
            condition: (state) => {
                return true
            }
        },
        // 12
        stayedGoal_turnToFlag: {
            destination: 'turnToFlag',
            condition: (state) => {
                return !!state.envInfo.flags['fc']
            }
        },
        // 13
        stayedGoal_stayedGoalAndTurn45: {
            destination: 'stayedGoalAndTurn45',
            condition: (state) => {
                return !state.envInfo.flags['fc']
            }
        },
        // 14
        stayedGoalAndTurn45_stayedGoal: {
            destination: 'stayedGoal',
            condition: (state) => {
                return true
            }
        },
        // 15
        readyToAction_catching: {
            destination: 'catchBall',
            condition: (state) => {

                let prevBall
                for (let env of state.envHistory) {
                    if (env.ball) {
                        prevBall = env.ball
                        break
                    } else {
                        console.log(env)
                    }
                }

                const ballCoord = getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball)


                console.log('15', 'ball  dist ', state.envInfo.ball.distance, ' prev ', prevBall ? prevBall.distance : undefined)
                return state.envInfo.ball.distance <= 3 && prevBall && prevBall.distance !== state.envInfo.ball.distance
            }
        },
        // 16
        readyToAction_exitToKick: {
            destination: 'exitToKick',
            condition: (state) => {
                let prevBall
                for (let env of state.envHistory) {
                    if (env.ball) {
                        prevBall = env.ball
                        break
                    } else {
                        console.log(env)
                    }
                }
                console.log('16', 'ball  dist ', state.envInfo.ball.distance, ' prev ', prevBall ? prevBall.distance : undefined)
                if (!prevBall) {
                    return true
                }
                return state.envInfo.ball.distance > 3 || prevBall.distance === state.envInfo.ball.distance
            }
        },
        // 17
        catching_catchBall: {
            destination: 'catchBall',
            condition: (state) => {
                return state.envInfo.ball.distance <= 2
            }
        },
        // 18
        catching_stepToFutureBall: {
            destination: 'stepToFutureBall',
            condition: (state) => {
                return state.envInfo.ball.distance > 2
            }
        },
        // 19
        exitToKick_needKickOutBall: {
            destination: 'needKickOutBall',
            condition: (state) => {
                if (!state.envInfo.ball) {
                    return false
                }
                return state.envInfo.ball.distance <= 0.5
            }
        },
        // 20
        exitToKick_needGoToBall: {
            destination: 'needGoToBall',
            condition: (state) => {
                if (!state.envInfo.ball) {
                    return false
                }
                return state.envInfo.ball.distance > 0.5
            }
        },
        // 21
        needGoToBall_needGoToBallAndTurnToBall: {
            destination: 'needGoToBallAndTurnToBall',
            condition: (state) => {
                if (!state.envInfo.ball) {
                    return false
                }
                return Math.abs(state.envInfo.ball.angle) > 20
            }
        },
        // 22
        needGoToBall_angleAllow: {
            destination: 'angleAllow',
            condition: (state) => {
                if (!state.envInfo.ball) {
                    return false
                }
                return Math.abs(state.envInfo.ball.angle) <= 20
            }
        },
        // 23
        needGoToBallAndTurnToBall_needGoToBall: {
            destination: 'needGoToBall',
            condition: (state) => {
                return true
            }
        },
        // 24
        needGoToBallAndStepToBall_exitToKick: {
            destination: 'exitToKick',
            condition: (state) => {
                return true
            }
        },
        // // 25
        // stepToFutureBall_readyToAction: {
        //     destination: 'readyToAction',
        //     condition: (state) => {
        //         return true
        //     }
        // },
        // 26
        needKickOutBall_weakKickInSide: {
            destination: 'weakKickInSide',
            condition: (state) => {
                const flagsToKick = Object.keys(state.envInfo.flags).filter(flagName => flagName === 'fc'
                    || flagName === 'fct' || flagName === 'fcb')
                return flagsToKick.length === 0
            }
        },
        // 27
        needKickOutBall_kickOutToRandomFlag: {
            destination: 'kickOutToRandomFlag',
            condition: (state) => {
                const flagsToKick = Object.keys(state.envInfo.flags).filter(flagName => flagName === 'fc'
                    || flagName === 'fct' || flagName === 'fcb')
                return flagsToKick.length !== 0
            }
        },
        // 28
        weakKickInSide_turnToBallToKickOut: {
            destination: 'turnToBallToKickOut',
            condition: (state) => {
                return true
            }
        },
        //29
        turnToBallToKickOut_stepBallToKickOut: {
            destination: 'stepBallToKickOut',
            condition: (state) => {
                return true
            }
        },
        // // 30
        // stepBallToKickOut_needKickOutBall: {
        //     destination: 'needKickOutBall',
        //     condition: (state) => {
        //         return true
        //     }
        // },
        // 31
        coordinatesWrong_coordinatesWrongAndTurn45: {
            destination: 'coordinatesWrongAndTurn45',
            condition: (state) => {
                return !state.envInfo.flags['gr']
            }
        },
        // 32
        coordinatesWrong_stepToGoal: {
            destination: 'stepToGoal',
            condition: (state) => {
                return !!state.envInfo.flags['gr']
            }
        },
        // 33
        coordinatesWrongAndTurn45_coordinatesWrong: {
            destination: 'coordinatesWrong',
            condition: (state) => {
                return true
            }
        },
        // 34
        noCoordinates_goalVisible: {
            destination: 'goalVisible',
            condition: (state) => {
                return !!state.envInfo.flags['gr']
            }
        },
        // 35
        noCoordinates_needToStayGoalAndTurn45: {
            destination: 'needToStayGoalAndTurn45',
            condition: (state) => {
                return !state.envInfo.flags['gr']
            }
        },
        // 36
        goalVisible_stepToGoal: {
            destination: 'stepToGoal',
            condition: (state) => {
                return state.envInfo.flags['gr'].distance > 1
            }
        },
        // 37
        goalVisible_needToStayGoalAndTurn45:{
            destination: 'needToStayGoalAndTurn45',
            condition: (state) => {
                return state.envInfo.flags['gr'].distance <= 1
            }
        },
        //38
        angleAllow_needStayAtGoal:{
            destination: 'needStayAtGoal',
            condition: (state) => {
                if (!state.envInfo.coordinates || !state.envInfo.ball) {
                    return false
                }
                const ballCoordinates = getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball)
                return !(ballCoordinates && ballCoordinates.x >= PENALTY_AREA_X && Math.abs(ballCoordinates.y) <= PENALTY_AREA_Y)
            }
        },
        //39
        angleAllow_needGoToBallAndStepToBall:{
            destination: 'needGoToBallAndStepToBall',
            condition: (state) => {
                if (!state.envInfo.coordinates || !state.envInfo.ball) {
                    return false
                }
                const ballCoordinates = getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball)
                return ballCoordinates && ballCoordinates.x >= PENALTY_AREA_X && Math.abs(ballCoordinates.y) <= PENALTY_AREA_Y
            }
        },
        // 40
        kickOutToRandomFlag_needStayAtGoal:{
            destination: 'needStayAtGoal',
            condition: (state) => {
                return true
            }
        },
        // 41
        undefinedBallCoordinates:{
            destination: 'exitToKick',
            condition: (state) => {
                return !state.envInfo.coordinates || !getObjectCoordinates(state.envInfo.coordinates, Object.values(state.envInfo.flags), state.envInfo.ball)
            }
        },
    }
}

module.exports = GkTA