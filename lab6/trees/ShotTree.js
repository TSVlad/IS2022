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
        next: 'TESTcondition1'
    },

    // 0
    TESTcondition1:{
        condition: (env) => env.ball.distance < 0.5,

        trueCond:'isGoalFree',
        falseCond:'TESTcondition2'
    },
    // 0
    TESTcondition2:{
        exec:(env) => {
            return {
                n: 'dash',
                v: 50,
                a: env.ball.angle
            }
        }
    },

    // 1
    isGoalFree:{
        condition: (env) => {
            const leftF = getLeftF(env)
            const rightF = getRightF(env)
            console.log("ШТАНГИ ", leftF, rightF)
            if (leftF && rightF) {
                TreesRepository.enemiesInGoals = env.players.filter(player => player.team !== process.env.TEAM && player.angle >= leftF.angle && player.angle <= rightF.angle)
                console.log("PLYERS", env.players)
                console.log("ENEM", TreesRepository.enemiesInGoals)

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
                console.log('ГРАНИЦЫ', leftFlag.angle + step, rightFlag.angle - step)
                for (let i = leftFlag.angle + step/2; i <= rightFlag.angle - step/2; i += step){
                    let foundEnemy = false
                    console.log('CURENT ANGLE TO CHECK', i)
                    console.log('ALL ENEMY IN GOALS1', TreesRepository.enemiesInGoals)
                    for (let v of TreesRepository.enemiesInGoals){
                        console.log('ENEMY IN CYCLE1 ', v)
                        if (i - step < v.angle && v.angle < i + step ){
                            console.log('ENEMY FOUNDED1')
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
                console.log("ERROR NOT FOUND CORRECT ENEMY 1")
            } else {
                for (let i = rightFlag.angle - step/2; i >= leftFlag.angle + step/2; i -= step){
                    let foundEnemy = false
                    console.log('CURENT ANGLE TO CHECK', i)
                    console.log('ALL ENEMY IN GOALS2', TreesRepository.enemiesInGoals)
                    for (let v of TreesRepository.enemiesInGoals){
                        console.log('ENEMY IN CYCLE2', v)
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
                console.log("ERROR NOT FOUND CORRECT ENEMY 2")
            }

            console.log("KICK FORWARD")

            return {
                n: 'kick',
                v: 200,
                a: 0
            }

        }
    }
}

module.exports = ShotTree