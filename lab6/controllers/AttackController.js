const BallControlController = require("./BallControlController");
const WithoutBallController = require("./WithoutBallController");
const {TreesRepository} = require("../trees/TreesRepository");


class AttackController {
    constructor() {
        this.ballControlController = new BallControlController()
        this.withoutBallController = new WithoutBallController()
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('1 IN ATTACK CONTROLLER')

        const histEnv = this.getEnvWithBal(env, envHistory)

        if (!TreesRepository.closestPlayerToBall || TreesRepository.closestPlayerToBall.distanceToBall > histEnv.ball.distance){
            return this.ballControlController.getCommand(env, envHistory, hearedEvents)
        }

        return  this.withoutBallController.getCommand(env, envHistory, hearedEvents)
    }

    getEnvWithBal(env, envHistory){
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

}

module.exports = AttackController