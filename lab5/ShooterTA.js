// 3 4 Угол до мяча
const ANGLE_TO_BALL = 30
// 5 6 расстояние до удара
const DIST_TO_KICK = 0.5
// 7 8 смотрит на мяч
const ANGLE_TO_KICK = 1
// 12 13 расстояние до ворот
const DIST_TO_GOAL = 16
const HISTORY_SIZE = 5

const ShooterTA = {
    state: {
        currentNode: 'start',
        envInfo: {},
        envHistory: [],
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
        start: {n: "start", e: ['start_ballVisible', 'start_ballInvisibleTurn45']},
        // 2
        ballVisible: {n: "ballVisible", e: ['ballVisible_angleToBallBigTurnToBall', 'ballVisible_angleToBallNormal']},
        // 3
        ballInvisibleTurn45: {
            n: "ballInvisibleTurn45", e: [], getCommand: (state) => {
                return {
                    n: 'turn',
                    v: '45'
                }
            }
        },
        // 4
        angleToBallBigTurnToBall: {
            n: "angleToBallBigTurnToBall", e: [], getCommand: (state) => {
                return {
                    n: 'turn',
                    v: state.envInfo.ball.angle
                }
            }
        },
        // 5
        angleToBallNormal: {
            n: "angleToBallNormal",
            e: ['angleToBallNormal_stepToBall', 'angleToBallNormal_distanceToKick']
        },
        // 6
        stepToBall: {
            n: "stepToBall", e: [], getCommand: (state) => {
                return {
                    n: 'dash',
                    v: state.envInfo.ball ? 50 : 0,
                    a: state.envInfo.ball ? state.envInfo.ball.angle : 0
                }
            }
        },
        // 7
        distanceToKick: {
            n: "distanceToKick",
            e: ["distanceToKick_angleToBallBigTurnToBall", "distanceToKick_lookAtBall"]
        },
        // 8
        lookAtBall: {n: "lookAtBall", e: ["lookAtBall_weakKickInSide", "lookAtBall_goalsVisible"]},
        // 9
        goalsVisible: {n: "goalsVisible", e: ["goalsVisible_kickInGoal", "goalsVisible_runToGoalWithBall"]},
        // 10
        runToGoalWithBall: {
            n: "runToGoalWithBall", e: [], getCommand: (state) => {
                return {
                    n: 'kick',
                    v: 30,
                    a: state.envInfo.flags['gr'].angle
                }
            }
        },
        // 11
        kickInGoal: {
            n: "kickInGoal", e: [], getCommand: (state) => {
                return {
                    n: 'kick',
                    v: 70,
                    a: state.envInfo.flags['gr'].angle
                }
            }
        },
        // 12
        weakKickInSide: {
            n: "weakKickInSide", e: ["weakKickInSide_turnToBall"], getCommand: (state) => {
                const topFlags = Object.keys(state.envInfo.flags).filter(flag => flag.startsWith('ft') || flag.startsWith('frt'))
                const bottomFlags = Object.keys(state.envInfo.flags).filter(flag => flag.startsWith('fb') || flag.startsWith('frb'))
                const coefficient = topFlags.length > bottomFlags.length ? 1 : -1
                return {
                    n: 'kick',
                    v: 3,
                    a: 60 * coefficient
                }
            }
        },
        // 13
        turnToBall: {
            n: "turnToBall", e: ["turnToBall_stepToBall"], getCommand: (state) => {
                return {
                    n: 'turn',
                    v: state.envInfo.ball ? state.envInfo.ball.angle : 0
                }
            }
        }
    },

    edges: {
        // 1
        start_ballVisible: {
            destination: 'ballVisible',
            condition: (state) => {
                console.log('BALL', state.envInfo.ball)
                return !!state.envInfo.ball
            }
        },
        // 2
        start_ballInvisibleTurn45: {
            destination: 'ballInvisibleTurn45',
            condition: (state) => {
                console.log('BALL', state.envInfo.ball)
                return !state.envInfo.ball
            }
        },
        // 3
        ballVisible_angleToBallBigTurnToBall: {
            destination: 'angleToBallBigTurnToBall',
            condition: (state) => {
                const ball = state.envInfo.ball
                return Math.abs(ball.angle) >= ANGLE_TO_BALL
            }
        },
        // 4
        ballVisible_angleToBallNormal: {
            destination: 'angleToBallNormal',
            condition: (state) => {
                const ball = state.envInfo.ball
                return Math.abs(ball.angle) < ANGLE_TO_BALL
            }
        },
        // 5
        angleToBallNormal_stepToBall: {
            destination: 'stepToBall',
            condition: (state) => {
                return state.envInfo.ball.distance > DIST_TO_KICK
            }
        },
        // 6
        angleToBallNormal_distanceToKick: {
            destination: 'distanceToKick',
            condition: (state) => {
                return state.envInfo.ball.distance <= DIST_TO_KICK
            }
        },
        // 7
        distanceToKick_angleToBallBigTurnToBall: {
            destination: 'angleToBallBigTurnToBall',
            condition: (state) => {
                return Math.abs(state.envInfo.ball.angle) > ANGLE_TO_KICK
            }
        },
        // 8
        distanceToKick_lookAtBall: {
            destination: 'lookAtBall',
            condition: (state) => {
                return Math.abs(state.envInfo.ball.angle) <= ANGLE_TO_KICK
            }
        },
        // 9
        lookAtBall_weakKickInSide: {
            destination: 'weakKickInSide',
            condition: (state) => {
                return !state.envInfo.flags['gr']
            }
        },
        // 10
        lookAtBall_goalsVisible: {
            destination: 'goalsVisible',
            condition: (state) => {
                return !!state.envInfo.flags['gr']
            }
        },
        // 11
        weakKickInSide_turnToBall: {
            destination: 'turnToBall',
            condition: (state) => {
                return true
            }
        },
        // 12
        goalsVisible_kickInGoal: {
            destination: 'kickInGoal',
            condition: (state) => {
                return state.envInfo.flags['gr'].distance < DIST_TO_GOAL
            }
        },
        // 13
        goalsVisible_runToGoalWithBall: {
            destination: 'runToGoalWithBall',
            condition: (state) => {
                return state.envInfo.flags['gr'].distance >= DIST_TO_GOAL
            }
        },
        // 14
        turnToBall_stepToBall: {
            destination: 'stepToBall',
            condition: (state) => {
                return true
            }
        },
    }
}

module.exports = ShooterTA