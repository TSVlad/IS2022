
const RunWithBallTree  = {
    root: {
        exec: (env, envHistory, hearedEvents) => {},
        next: 'isBallSeeWithZeroAngle'
    },

    // 1
    isBallSeeWithZeroAngle: {
        condition: (env, envHistory, hearedEvents) =>
            !!env.ball && Math.abs(env.ball.angle) < 5,
        trueCond: 'isBallClose',
        falseCond: 'turnToBall'
    },

    // 2
    isBallClose: {
        condition: (env, envHistory, hearedEvents) =>
            !!env.ball && env.ball.distance < 2,
        trueCond: 'isGoalVisible',
        falseCond: 'stepToBall'
    },

    // 3
    isGoalVisible: {
        condition: (env, envHistory, hearedEvents) => !!env.flags[env.side === 'l' ?'gr' : 'gl'],
        trueCond: 'kickToGoal',
        falseCond: 'kick60'
    },

    // 4
    turnToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return  {
                n: 'turn',
                v: env.ball.angle
            }
        }
    },

    // 5
    stepToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 200,
                a: env.ball.angle
            }
        }
    },

    // 6
    kick60: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'kick',
                v: 3,
                a: 60
            }
        }
    },

    // 7
    kickToGoal: {
        exec: (env, envHistory, hearedEvents) => {
            return  {
                n: 'kick',
                v: 150,
                a:  env.flags[env.side === 'l' ?'gr' : 'gl'].angle
            }
        }
    }
}

module.exports = RunWithBallTree