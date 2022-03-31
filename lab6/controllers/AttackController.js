const BallControlController = require("./BallControlController");
const WithoutBallController = require("./WithoutBallController");
const TreesRepository = require("../trees/TreesRepository");

class AttackController {
    constructor() {
        this.ballControlController = new BallControlController()
        this.withoutBallController = new WithoutBallController()
    }

    getCommand(env, envHistory, hearedEvents){

        if (!TreesRepository.closestPlayerToBall || TreesRepository.closestPlayerToBall.distanceToBall > env.ball.distance){
            return this.ballControlController.getCommand(env, envHistory, hearedEvents)
        }

        return  this.withoutBallController.getCommand(env, envHistory, hearedEvents)
    }

}

module.exports = AttackController