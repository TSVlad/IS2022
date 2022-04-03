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
    console.log("POINTS", point.x, point.y, lastCoordinates.x, lastCoordinates.y)
    console.log("GET ALPHA", a, b, a / b, Math.atan(a / b))
    return Math.ceil((180 * Math.atan(a / b)) / Math.PI)
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
            console.log('ANGLE', gamma, alpha, env.currentAngle, env.side)

            if (point.x > lastCoordinates.x) {
                if (point.y > lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(gamma - alpha - env.currentAngle)
                } else if (point.y < lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(-gamma + alpha - env.currentAngle)
                } else {
                    const angle = env.side === 'l' ? -env.currentAngle : 180 - env.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            } else if (point.x < lastCoordinates.x) {
                if (point.y > lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(gamma + alpha - env.currentAngle)
                } else if (point.y < lastCoordinates.y) {
                    TreesRepository.angleToPosition = getAngleToTurn(-gamma - alpha - env.currentAngle)
                } else {
                    const angle = env.side === 'l' ? 180 - env.currentAngle : -env.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            } else {
                if (point.y > lastCoordinates.y) {
                    const angle = env.side === 'l' ? 90 - env.currentAngle : -90 - env.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                } else if (point.y < lastCoordinates.y) {
                    const angle = env.side === 'l' ? -90 - env.currentAngle : 90 - env.currentAngle
                    TreesRepository.angleToPosition = getAngleToTurn(angle)
                }
            }
            console.log('LOG startDotWith0: ', Math.abs(Math.ceil(TreesRepository.angleToPosition)))
            return Math.abs(Math.ceil(TreesRepository.angleToPosition)) <= 5
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
                v: Math.ceil(TreesRepository.angleToPosition)
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
    },

    // 9
    isCurrentAngleExist: {
        condition: (env, envHistory, hearedEvents) => !!env.currentAngle,

        trueCond: 'onStartPosition',
        falseCond: 'turn90'
    }
}

module.exports = GoToPositionTree