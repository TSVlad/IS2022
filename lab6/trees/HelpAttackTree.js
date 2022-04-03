const {TreesRepository} = require("./TreesRepository");
const state = {}

const compPlayersByX = (player1, player2, side) => {
    if (side === 'l') {
        return player1.coordinates.x > player2.coordinates.x ? 1 : -1
    } else {
        return player1.coordinates.x < player2.coordinates.x ? 1 : -1
    }
}

const isCloserToEnemyGoal = (coords1, coords2, side) => {
    if (side === 'l') {
        return coords1.x > coords2.x
    } else {
        return coords1.x < coords2.x
    }
}

const isCloserToMyGoal = (coords1, coords2, side) => {
    if (side === 'l') {
        return coords1.x < coords2.x
    } else {
        return coords1.x > coords2.x
    }
}

const getAngleForStepToEnemyGoal = (env) => {
    return - env.currentAngle
}

const getAngleForStepToMyGoal = (env) => {
    return env.currentAngle >= 0 ? 180 - env.currentAngle
        : -180 - env.currentAngle
}

const getAngleToCoordinatesByX = (env, coordinates, targetCoordinates, side) => {
    if (side === 'l') {
        return coordinates.x < targetCoordinates.x ? getAngleForStepToEnemyGoal(env) : getAngleForStepToMyGoal(env)
    } else {
        return coordinates.x > targetCoordinates.x ? getAngleForStepToEnemyGoal(env) : getAngleForStepToMyGoal(env)
    }
}

const getDistanceToMyGoalLine = (coordinates, side) => {
    if (side === 'l') {
        return Math.abs(-52.5 - coordinates.x)
    } else {
        return Math.abs(52.5 - coordinates.x)
    }
}

const getLastSeenBall = (env, envHistory) => {
    if (env.ball) {
        return env.ball
    }
    for (const e of envHistory) {
        if (e.ball) {
            return e.ball
        }
    }
    console.log('WARN HelpAttackTree getLastSeenBall: ball not found in last 11 ticks!')
    return null
}

const getBordersForMiddle = (ballCoordinates, side) => {
    if (side === 'l') {
        return {
            top: ballCoordinates.x - 10,
            bottom: ballCoordinates.x - 20
        }
    } else {
        return {
            top: ballCoordinates.x + 20,
            bottom: ballCoordinates.x + 10
        }
    }
}

const getBordersForDefZone= (ballCoordinates, side) => {
    if (side === 'l') {
        return {
            top: ballCoordinates.x - 20,
            bottom: ballCoordinates.x - 30
        }
    } else {
        return {
            top: ballCoordinates.x + 30,
            bottom: ballCoordinates.x + 20
        }
    }
}

const getAngleForZone = (env, coordinates, borders, side) => {
    if (side === 'l') {
        if (coordinates.x > borders.top) {
            return getAngleForStepToMyGoal(env)
        } else {
            return getAngleForStepToEnemyGoal(env)
        }
    } else {
        if (coordinates.x > borders.top) {
            return getAngleForStepToEnemyGoal(env)
        } else {
            return getAngleForStepToMyGoal(env)
        }
    }
}

const getLastSeenCoordinates = (env, envHistory) => {
    if (env.coordinates) {
        return env.coordinates
    } else {
        for (const e of envHistory) {
            if (e.coordinates) {
                return e.coordinates
            }
        }
    }
    return null
}

const HelpAttackTree = {
    root: {
        exec: () => {},
        next: 'timeCheck'
    },

    // 1
    timeCheck: {
        condition: (env, envHistory, hearedEvents) => env.time % 10 >= 1 && env.time % 10 <= 4,
        trueCond: 'turn90',
        falseCond: 'rewriteAllValues'
    },

    // 2
    turn90: {
        exec: (env, envHistory, hearedEvents) => {
            return  {
                n: 'turn',
                v: 90
            }
        }
    },

    // 3
    isNeedToGoAhead: {
        condition: (env, envHistory, hearedEvents) => {
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return false
            }
            if (TreesRepository.teammatesSortedByX.length > 0) {
                for (let i = TreesRepository.teammatesSortedByX.length - 1; i > TreesRepository.teammatesSortedByX.length - 4 && i >= 0; i--) {
                    if (isCloserToEnemyGoal(coordinates, TreesRepository.teammatesSortedByX[i].coordinates)) {
                        return true
                    }
                }
            } else {
                console.log("WARN GoToPositionTree isNeedToGoAhead : TreesRepository.len = " + TreesRepository.teammatesSortedByX.length)
            }
            return false
        },
        trueCond: 'isDistanceToBallBig',
        falseCond: 'isNeedToGoWithBallLine'
    },

    // 4
    isDistanceToBallBig: {
        condition: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            return !ball || ball.distance > 40
        },
        trueCond: 'stepToTeamGoal',
        falseCond: 'isOffside'
    },

    // 5
    stepToTeamGoal: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 100,
                a: getAngleForStepToMyGoal(env)
            }
        }
    },

    // 6
    isOffside: {
        condition: (env, envHistory, hearedEvents) => {
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return true
            }
            return TreesRepository.enemiesSortedByX.length > 0
            && TreesRepository.enemiesSortedByX[TreesRepository.enemiesSortedByX.length - 1].coordinates.x < coordinates.x
        },
        trueCond: 'stepToTeamGoal',
        falseCond: 'stepToEnemyGoal'
    },

    // 7
    stepToEnemyGoal: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 100,
                a: -env.currentAngle
            }
        }
    },

    // 8
    isNeedToGoWithBallLine: {
        condition: (env, envHistory, hearedEvents) => {
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return true
            }
            if (TreesRepository.teammatesSortedByX.length >= 6) {
                for (let i = TreesRepository.teammatesSortedByX.length - 4; i > TreesRepository.teammatesSortedByX.length - 6 && i >= 0; i--) {
                    if (isCloserToEnemyGoal(coordinates, TreesRepository.teammatesSortedByX[i].coordinates)) {
                        return true
                    }
                }
            } else {
                console.log("WARN GoToPositionTree isNeedToGoWithBallLine : TreesRepository.len = " + TreesRepository.teammatesSortedByX.length)
            }
            return false
        },
        trueCond: 'amIInLineWithBall',
        falseCond: 'isNeedToBeInMiddleZone'
    },

    // 9
    amIInLineWithBall: {
        condition: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates || !ball || !ball.coordinates) {
                return true
            }
            return Math.abs(ball.coordinates.x - coordinates.x) <= 3
        },
        trueCond: 'doNothing',
        falseCond: 'stepToBallLine'
    },

    // 10
    stepToBallLine: {
        exec: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            const coordinates = getLastSeenCoordinates(env, envHistory)
            return {
                n: 'dash',
                v: 100,
                a: getAngleToCoordinatesByX(env, coordinates , ball.coordinates, env.side)
            }

        }
    },

    // 11
    doNothing: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                a: 'turn',
                v: 0
            }
        }
    },

    // 12
    isNeedToBeInMiddleZone: {
        condition: (env, envHistory, hearedEvents) => {
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return false
            }
            if (TreesRepository.teammatesSortedByX.length > 5) {
                for (let i = 0; i < 3; i++) {
                    if (isCloserToMyGoal(coordinates, TreesRepository.teammatesSortedByX[i].coordinates)) {
                        return false
                    }
                }
                return true
            } else {
                console.log("WARN GoToPositionTree isNeedToBeInMiddleZone : TreesRepository.len = " + TreesRepository.teammatesSortedByX.length)
            }
            return false
        },
        trueCond: 'amIInMiddleZone',
        falseCond: 'amIInDefZone'
    },

    //13
    amIInMiddleZone: {
        condition: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return true
            }
            if (!ball) {
                return true
            }
            const borders = getBordersForMiddle(ball.coordinates, env.side)

            if(getDistanceToMyGoalLine(coordinates, env.side) >= 7){
                return borders.top <= coordinates.x && coordinates.x <= borders.bottom;
            }

            return false
        } ,
        trueCond: 'doNothing',
        falseCond: 'stepToMiddleZone'
    },


    //14
    stepToMiddleZone: {
        exec: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            const borders = getBordersForMiddle(ball.coordinates, env.side)
            const coordinates = getLastSeenCoordinates(env, envHistory)
            return {
                n: 'dash',
                a: getAngleForZone(env, coordinates, borders, env.side)
            }
        }
    },

    //15
    amIInDefZone: {
        condition: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            if (!ball) {
                return true
            }
            const coordinates = getLastSeenCoordinates(env, envHistory)
            if (!coordinates) {
                return true
            }

            const borders = getBordersForDefZone(ball.coordinates, env.side)

            if(getDistanceToMyGoalLine(coordinates, env.side) >= 0){
                return borders.top <= coordinates.x && coordinates.x <= borders.bottom;
            }

            return false;
        },
        trueCond: 'doNothing',
        falseCond: 'stepToDefZone'
    },

    //16
    stepToDefZone: {
        exec: (env, envHistory, hearedEvents) => {
            const ball = getLastSeenBall(env, envHistory)
            const borders = getBordersForDefZone(ball.coordinates, env.side)
            const coordinates = getLastSeenCoordinates(env, envHistory)
            return {
                n: 'dash',
                a: getAngleForZone(env, coordinates, borders, env.side)
            }
        }
    },

    // 17
    shouldWrite: {
        condition: (env, envHistory, hearedEvents) => env.time % 10 === 5,
        trueCond: 'rewriteAllValues',
        falseCond: 'isNeedToGoAhead'
    },

    // 18
    rewriteAllValues: {
        exec: (env, envHistory, hearedEvents) => {
            let teammates = []
            for (let i = 0; i < 4 && i < envHistory.length; i++) {
                teammates = [...teammates, ...(envHistory[i].players.filter(player => player.team === process.env.TEAM && player.coordinates))]
            }
            TreesRepository.teammatesSortedByX = teammates.sort((p1, p2) => compPlayersByX(p1, p2, env.side))

            let enemies = []
            for (let i = 0; i < 4; i++) {
                enemies = [...teammates, ...(envHistory[i].players.filter(player => player.team !== process.env.TEAM && player.coordinates))]
            }
            TreesRepository.enemiesSortedByX = enemies.sort((p1, p2) => compPlayersByX(p1, p2, env.side))
        },
        next: 'isNeedToGoAhead'
    }
}

module.exports = HelpAttackTree