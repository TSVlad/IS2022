const {TreesRepository} = require("./TreesRepository");
const {getRandomInt} = require("../utils");

const getLeftF = (env) => {
    return env.flags[`${env.side === 'l' ? 'fgrt' : 'fglb'}`]
}

const getRightF = (env) => {
    return env.flags[`${env.side === 'l' ? 'fgrb' : 'fglt'}`]
}
const ShotTree = {
    root: {
        exec:() => {},
        next: 'isGoalFree'
    },

    // 1
    isGoalFree:{
        condition: (env) => {
            const leftF = getLeftF(env)
            const rightF = getRightF(env)
            if (leftF && rightF) {
                TreesRepository.enemiesInGoals = env.players.filter(player => player.team !== process.env.TEAM && player.angle >= leftF && player.angle <= rightF)
                return TreesRepository.enemiesInGoals.length === 0
            } else {
                return true
            }
        },

        trueCond:'kickToCenter',
        falseCond:'kickWithAngle'
    },

    // 2
    kickToCenter:{
        exec:(env) => {
            return {
                n: 'kick',
                v: 100,
                a: env.flags[env.side === 'l' ?'gr' : 'gl'] ? env.flags[env.side === 'l' ?'gr' : 'gl'].angle : 0
            }
        }
    },

    // 3
    kickWithAngle: {
        exec:(env) => {
            const leftFlag = getLeftF(env)
            const rightFlag = getRightF(env)
            const step = Math.ceil(Math.abs(leftFlag.angle - rightFlag.angle) / 7)

            console.log("STEP:", step)

            const rand = Math.random() > 0.5

            console.log('RAND:', rand)

            if (rand) {
                for (let i = leftFlag + step; i <= rightFlag - step; i += step){
                    let foundEnemy = false
                    for (let v of TreesRepository.enemiesInGoals){
                        if (i - step < v.angle && v.angle < i + step ){
                            foundEnemy = true
                            break
                        }
                    }
                    if (!foundEnemy) {
                        return {
                            n: 'kick',
                            v: 200,
                            a: i
                        }
                    }
                }
            } else {
                for (let i = rightFlag.angle - step/2; i >= leftFlag.angle + step/2; i -= step){
                    let foundEnemy = false
                    for (let v of TreesRepository.enemiesInGoals){
                        if (i - step < v.angle && v.angle < i + step ){
                            console.log('ENEMY FOUNDED2')
                            foundEnemy = true
                            break
                        }
                    }
                    if (!foundEnemy) {
                        return {
                            n: 'kick',
                            v: 200,
                            a: i
                        }
                    }
                }
            }

        }
    }
}

module.exports = ShotTree