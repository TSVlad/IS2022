const {TreesRepository} = require("./TreesRepository");

const getStartPosition = (side) => {
    return side === 'l' ? {x: process.env.X, y: process.env.Y} : {x: -process.env.X, y: -process.env.Y}
}

const getLastCoordinates = (env, envHistory) => {
    if (env.coordinates) {
        return env.coordinates
    }
    for (const e of envHistory) {
        if (e.coordinates) {
            return e.coordinates
        }
    }
    return null
}

const getAlpha = (point, lastCoordinates) => {
    const a = Math.abs(point.x - lastCoordinates.x)
    const b = Math.abs(point.y - lastCoordinates.y)
    return (Math.PI * Math.atan(a / b)) / 180
}

const getAngleToTurn = (angle) => {
    if (angle > 180) {
        return -360 + angle
    } else if (angle < -180) {
        return 360 + angle
    } else {
        return angle
    }
}

const GoToPositionTree = {
    root: {
        exec: () => {
        },
        next: 'is4Tick'
    },

    // 1
    is4Tick: {
        condition: (env, envHistory, hearedEvents) => env.time % 10 >= 1 && env.time % 10 <= 4,

        trueCond: 'turn90',
        falseCond: 'isCurrentAngleExist'
    },

    // 2
    turn90: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: 90,
                mandatory: true
            }
        }
    },

    // 3
    startDotWith0: {
        condition: (env, envHistory, hearedEvents) => {
            const point = getStartPosition(env.side)
            const lastCoordinates = getLastCoordinates(env, envHistory)
            const alpha = getAlpha(point, lastCoordinates)
            const gamma = env.side === 'l' ? 90 : -90


            if (!lastCoordinates) {
                return true
            }

            if (point.x > lastCoordinates.x) {
                if (point.y > lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(gamma - alpha - TreesRepository.currentAngle)
                } else if (point.y < lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(-gamma + alpha - TreesRepository.currentAngle)
                } else {
                    const angle = env.side === 'l' ? -TreesRepository.currentAngle : 180 - TreesRepository.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            } else if (point.x < lastCoordinates.x) {
                if (point.y > lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(gamma + alpha - TreesRepository.currentAngle)
                } else if (point.y < lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(-gamma - alpha - TreesRepository.currentAngle)
                } else {
                    const angle = env.side === 'l' ? 180 - TreesRepository.currentAngle : -TreesRepository.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            } else {
                if (point.y > lastCoordinates.y) {
                    const angle = env.side === 'l' ? 90 - TreesRepository.currentAngle : -90 - TreesRepository.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                } else if (point.y < lastCoordinates.y) {
                    const angle = env.side === 'l' ? -90 - TreesRepository.currentAngle : 90 - TreesRepository.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            }
            return Math.abs(TreesRepository.angleToPosition) <= 1
        },
        trueCond: 'stepForward',
        falseCond: 'turnToStartDot'
    },

    // 4
    stepForward: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 100
            }
        }
    },

    // 5
    turnToStartDot: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: TreesRepository.angleToPosition
            }
        }
    },

    // 6
    onStartPosition: {
        condition: (env, envHistory, hearedEvents) => {
            const point = getStartPosition(env.side)
            const lastCoordinates = getLastCoordinates(env, envHistory)

            console.log('LOG onStartPosition:', Math.sqrt((point.x - lastCoordinates.x) ** 2 + (point.y - lastCoordinates.y) ** 2))
            return Math.sqrt((point.x - lastCoordinates.x) ** 2 + (point.y - lastCoordinates.y) ** 2) <= 3
        },

        trueCond: 'isBallVisible',
        falseCond: 'startDotWith0'
    },

    // 7
    isBallVisible: {
        condition: (env, envHistory, hearedEvents) => !!env.ball,

        trueCond: 'turnToBall',
        falseCond: 'turn90'
    },

    // 8
    turnToBall: {
        exec: (env) => {
            return {
                n: 'turn',
                v: env.ball.angle
            }
        }
    }
}

module.exports = GoToPositionTree