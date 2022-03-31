const RunWithBallTree = require("../trees/RunWithBallTree");
const PassTree = require("../trees/PassTree");
const ShotTree = require("../trees/ShotTree");
const {getCommandFromTree} = require("../utils");

const getEnemiesGoals = (env) => {
    if (env.side === 'l') {
        return env.flags['gr']
    } else {
        return env.flags['gl']
    }
}

class BallControlController {
    constructor() {
        this.passTree = PassTree
        this.runWithBallTree = RunWithBallTree
        this.shotTree = ShotTree
    }

    getCommand(env, envHistory, hearedEvents){
        let passPoints = 2
        let goWithBallPoints = 0
        let kickPoints = 0
        if (env.players.filter(player => player.team !== process.env.TEAM && Math.abs(player.angle) < 30 && player.distance < 5 ).length > 0){
            goWithBallPoints = 2
        }
        const enemiesGoals = getEnemiesGoals(env)
        if (enemiesGoals) {
            kickPoints = enemiesGoals.distance <= 35 ? 6 * (1 - enemiesGoals.distance / 35) + 1: 0
        }
        
        
        const passProbability = passPoints / (passPoints + goWithBallPoints + kickPoints)
        const goWithBallProbability = goWithBallPoints / (passPoints + goWithBallPoints + kickPoints)
        const kickProbability = kickPoints / (passPoints + goWithBallPoints + kickPoints)

        const randomNum = Math.random()

        if (randomNum < kickProbability){
            getCommandFromTree(this.shotTree, env, envHistory, hearedEvents)
        } else if (randomNum < kickProbability + goWithBallProbability){
            getCommandFromTree(this.runWithBallTree, env, envHistory, hearedEvents)
        } else {
            getCommandFromTree(this.passTree, env, envHistory, hearedEvents)
        }
    }

}

module.exports = BallControlController