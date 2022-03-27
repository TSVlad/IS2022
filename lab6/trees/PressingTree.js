const PressingTree = {
    root: {
        exec: () => {},
        next: ''
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
        exec: (env, envHistory, hearedEvents) => {}
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
        exec: () => {}
    },

    // 10
    isEnemyGoalVisible: {
    condition: (env, envHistory, hearedEvents) => true,
        trueCond: '',
        falseCond: ''
    },

    // 11
    kickFromMyGoal: {
        exec: () => {}
    }

}

module.exports = PressingTree