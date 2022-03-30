const TreesRepository = require("./TreesRepository");

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
        falseCond: 'onStartPosition'
    },

    // 2
    turn90: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: 90
            }
        }
    },

    // 3
    startDotWith0: {
        condition: (env, envHistory, hearedEvents) => {
            return true
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
    turnToStartDot: {exec: (env, envHistory, hearedEvents) => {
            return
        }}
}

module.exports = GoToPositionTree