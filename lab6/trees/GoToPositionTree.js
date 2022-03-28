
const getStartPosition = (side) => {
    return side === 'l' ? {x: process.env.X, y: process.env.Y} : {x: -process.env.X, y: -process.env.Y}
}

const GoToPositionTree = {
    root: {
        exec: () => {},
        next: 'is4Tick'
    },

    // 1
    is4Tick:{
        condition: (env, envHistory, hearedEvents) => env.time % 10 >= 1 && env.time % 10 <= 4,

        trueCond: 'turn90',
        falseCond: 'startDotWith0'
    },

    // 2
    turn90: {exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: 90
            }
        }},

    // 3
    startDotWith0:{
        condition: (env, envHistory, hearedEvents) => {
            return true
        },
        trueCond: '',
        falseCond: ''},

    // 4
    stepForward:{exec: (env, envHistory, hearedEvents) => {
        return
        }},

    // 5
    turnToStartDot: {exec: (env, envHistory, hearedEvents) => {
            return
        }}
}

module.exports = GoToPositionTree