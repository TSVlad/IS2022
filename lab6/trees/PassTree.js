const {TreesRepository} = require("./TreesRepository");
const {getRandomInt} = require("../utils");

const isFartherByXToEnemiesGoals = (coordinates1, coordinates2, side) => {
    if (side === 'l') {
        return coordinates1.x > coordinates2.x
    } else {
        return  coordinates1.x < coordinates2.x
    }
}

const isOwnHalf = (coordinates, side) => {
    if (side === 'l') {
        return coordinates.x < 0
    } else {
        return coordinates.x > 0
    }
}

const PassTree = {
    root: {
        exec: () => {},
        next: 'isBallVisible',
    },

    // 1
    isTeammateVisible:{
        condition: (env) => {
            TreesRepository.teammates = env.players.filter(player => player.team === process.env.TEAM)
            return TreesRepository.teammates.length > 0
        },
        trueCond: 'isTeammatesNotInOffside',
        falseCond: 'isBallAngleOk'
    },

    // 2
    isTeammatesNotInOffside: {
        condition: (env, envHistory) => {
            TreesRepository.enemies = env.players.filter(player => player.team !== process.env.TEAM)
            TreesRepository.teammatesNotInOffside = TreesRepository.teammates.filter(player => {
                if (player.goalie) {
                    return false
                }
                if (isOwnHalf(player.coordinates, env.side)) {
                    return true
                }
                for (const enemy of TreesRepository.enemies) {
                    if (enemy.coordinates && player.coordinates && isFartherByXToEnemiesGoals(enemy.coordinates, player.coordinates)) {
                        return true
                    }
                }
                return false
            })
            return TreesRepository.teammatesNotInOffside.length > 0
        },

        trueCond: 'thereAreFreeTeammates',
        falseCond: 'isBallAngleOk'
    },

    // 3
    thereAreFreeTeammates:{
        condition: (env, envHistory) => {
            for (const teammate of TreesRepository.teammatesNotInOffside){
                let flag = true
                for (const enemy of TreesRepository.enemies){
                    if (teammate.angle - 2 < enemy.angle && enemy.angle < teammate.angle + 2){
                        flag = false;
                    }
                }

                if (flag) {
                    TreesRepository.freeTeammatesNotInOffside.push(teammate)
                }
            }

            return TreesRepository.freeTeammatesNotInOffside.length !== 0
        },

        trueCond: 'passAction',
        falseCond: 'isBallAngleOk'
    },

    // 4
    passAction:{
        exec: () => {
            const targetTeammate = TreesRepository.freeTeammatesNotInOffside[getRandomInt(TreesRepository.freeTeammatesNotInOffside.length - 1)]
            TreesRepository.coordinatesPass = targetTeammate.coordinates
            return {
                n: 'kick',
                v: 3 * targetTeammate.distance,
                a: targetTeammate.angle
            }
        }
    },

    // 5
    isBallClose:{
        condition: (env, envHistory) => {
            if (!!env.ball){
                return env.ball.distance < 0.5
            } else {
                console.log("ERROR PassTree.js isBallClose ball is not visible")
                return false
            }
        },

        trueCond: 'isTeammateVisible',
        falseCond: 'stetToBall'
    },

    // 6
    kick45:{
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'kick',
                v: 5,
                a: 45
            }
        }
    },

    // 7
    isBallAngleOk:{
        condition: (env, envHistory) => Math.abs(env.ball.angle) < 5,

        trueCond: 'kick45',
        falseCond: 'turnToBall'
    },

    // 8
    turnToBall:{
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: !!env.ball ? env.ball.angle : 45
            }
        }
    },

    // 9
    stetToBall:{
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'dash',
                v: env.ball.distance > 5 ? 100 : 50,
                a: env.ball.angle
            }
        }
    },

    // 10
    isBallVisible:{condition: (env) => !!env.ball,
        trueCond: 'isBallClose',
        falseCond: 'turn45'
    },

    // 11
    turn45:{
        exec: (env, envHistory, hearedEvents) => {
            return {
                n: 'turn',
                v: 45
            }
        }
    }

}

module.exports = PassTree