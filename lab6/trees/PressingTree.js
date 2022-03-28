const TreesRepository = require("./TreesRepository");
const {getRandomInt} = require("../utils");

const getAngleToKickOutByFlags = (topFlagsCount, bottomFlagsCount, side) => {
    if (topFlagsCount > bottomFlagsCount) {
        return side === 'l' ? 70 : -70
    } else {
        return side === 'l' ? -70 : 70
    }
}

const getTopFlags = (flags) => {
    return Object.values(flags).filter(flag => flag.name.startsWith("ft"))
}

const getBottomFlags = (flags) => {
    return Object.values(flags).filter(flag => flag.name.startsWith("fb"))
}

const PressingTree = {
    root: {
        exec: () => {},
        next: 'isBallVisible'
    },

    //1
    isBallVisible: {
        condition: (env, envHistory, hearedEvents) => !!env.ball,
        trueCond: 'isAngleToBall0',
        falseCond: 'turn45'
    },

    //2
    turn45: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: 45
            }
        }
    },

    // 3
    isAngleToBall0: {
        condition: (env, envHistory, hearedEvents) => Math.abs(env.ball.angle) <= 1,
        trueCond: 'isDDistanceToKick',
        falseCond: 'turnToBall'
    },

    // 4
    turnToBall: {
        exec: (env, envHistory, hearedEvents) => {}
    },

    // 5
    isDDistanceToKick: {
        condition: (env, envHistory, hearedEvents) => true,
        trueCond: '',
        falseCond: ''
    },

    // 6
    stepToBall: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: 100,
                a: env.ball.angle
            }
        }
    },

    // 7
    strongKickToGoal: {
        exec: (env, envHistory, hearedEvents) => {
            // const goal = env.flags[env.side === 'l' ?'gr' : 'gl']
            //
            // if (!!goal){
            //     return {
            //         n: 'kick'
            //
            //     }
            // }
        }
    },

    // 8
    isTeammateVisible: {
        condition: (env, envHistory, hearedEvents) => true,
        trueCond: '',
        falseCond: ''

    },

    // 9
    kickToTeammate:{
        exec: () => {
            const teammateToPass = TreesRepository.teammates[getRandomInt(TreesRepository.teammates.length)]
            return {
                n: 'kick',
                v: teammateToPass.distance * 2.5,
                a: teammateToPass.angle
            }
        }
    },

    // 10
    isEnemyGoalVisible: {
    condition: (env, envHistory, hearedEvents) => true,
        trueCond: '',
        falseCond: ''
    },

    // 11
    kickInSideByFlags: {
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'kick',
                v: 50,
                a: getAngleToKickOutByFlags(getTopFlags(env.flags).length, getBottomFlags(env.flags).length, env.side)
            }
        }
    },

    // 12
    isMyGoalVisible: {
        condition: (env, envHistory, hearedEvents) => !!env.flags[env.side === 'l' ?'gl' : 'gr'],
        trueCond: 'kickInsideByGoalAngle',
        falseCond: 'kickInSideByFlags'
    },

    // 13
    kickInsideByGoalAngle: {
        exec: (env) => {
            return {
                n: 'kick',
                v: '75',
                a: env.flags[env.side === 'l' ?'gl' : 'gr'] > 0 ? -70 : 70
            }
        }
    }

}

module.exports = PressingTree