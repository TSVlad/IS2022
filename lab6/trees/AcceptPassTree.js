const AcceptPassTree = {
    root: {
        exec: () => {},
        next: 'isBallVisible'
    },

    // 1
    isBallVisible : {
        condition: (env, envHistory, hearedEvents) => !!env.ball,
        trueCond: 'isBallAngleOk',
        falseCond: 'turnToSound'
    },

    // 2
    turnToSound: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                a: hearedEvents.angle
            }
        }
    },

    // 3
    isBallAngleOk: {
        condition: (env, envHistory, hearedEvents) => Math.abs(env.ball.angle) <= 1,
        trueCond: 'stepToBall',
        falseCond: 'turnToBall'
    },

    // 4
    stepToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 100,
                a: env.ball.angle
            }
        }
    },

    // 5
    turnToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                a: env.ball.angle
            }
        }
    }
}

module.exports = AcceptPassTree