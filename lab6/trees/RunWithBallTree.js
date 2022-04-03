
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
            !!env.ball && env.ball.distance < 0.5,
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
                v: !!env.ball ? env.ball.angle : 45
            }
        }
    },

    // 5
    stepToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 75,
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
                v: 15,
                a:  env.flags[env.side === 'l' ?'gr' : 'gl'].angle
            }
        }
    }
}

module.exports = RunWithBallTree