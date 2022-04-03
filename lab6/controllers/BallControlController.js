const RunWithBallTree = require("../trees/RunWithBallTree");
const PassTree = require("../trees/PassTree");
const ShotTree = require("../trees/ShotTree");
const {getCommandFromTree} = require("../utils");
const {TreesRepository} = require("../trees/TreesRepository");

const getEnemiesGoals = (env) => {
    if (env.side === 'l') {
        return env.flags['gr']
    } else {
        return env.flags['gl']
    }
}
const getEnvWithBall = (env, envHistory) => {
    if (env.ball) {
        return env
    }
    for (const e of envHistory) {
        if (e.ball) {
            return e
        }
    }
    console.log('WARN BallControlController: ball not found in last 11 ticks!')
    return null
}
class BallControlController {
    constructor() {
        this.passTree = PassTree
        this.runWithBallTree = RunWithBallTree
        this.shotTree = ShotTree
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('2 IN BALL CONTROL CONTROLLER')

        if (TreesRepository.decidePass) {
            return getCommandFromTree(this.passTree, env, envHistory, hearedEvents)
        }

        let passPoints = 2
        let goWithBallPoints = 0
        let kickPoints = 0

        //let histEnv = getEnvWithBall(env, envHistory)

        /*if (!histEnv || histEnv.ball.distance > 0.5){
            return getCommandFromTree(this.runWithBallTree, env, envHistory, hearedEvents)
        }*/

        if (env.players.filter(player => player.team !== process.env.TEAM && Math.abs(player.angle) < 30 && player.distance < 5 ).length === 0) {
            goWithBallPoints = 2 * 4
        }
        const enemiesGoals = getEnemiesGoals(env)
        if (enemiesGoals && env.ball) {
            kickPoints = enemiesGoals.distance <= 35 ? (6 * (1 - enemiesGoals.distance / 35) + 1) * 3: 0
        }
        
        
        const passProbability = passPoints / (passPoints + goWithBallPoints + kickPoints)
        const goWithBallProbability = goWithBallPoints / (passPoints + goWithBallPoints + kickPoints)
        const kickProbability = kickPoints / (passPoints + goWithBallPoints + kickPoints)

        const randomNum = Math.random()

        if (randomNum < kickProbability){
            console.log('IN SHOT TREE')
            return getCommandFromTree(this.shotTree, env, envHistory, hearedEvents)
        } else if (randomNum < kickProbability + goWithBallProbability){
            console.log('IN RUN WITH BALL TREE')
            return getCommandFromTree(this.runWithBallTree, env, envHistory, hearedEvents)
        } else {
            console.log('IN PASS TREE')
            TreesRepository.decidePass = false
            return getCommandFromTree(this.passTree, env, envHistory, hearedEvents)

        }
    }

}

module.exports = BallControlController