const BallControlController = require("./BallControlController");
const WithoutBallController = require("./WithoutBallController");

class AttackController {
    constructor() {
        this.ballControlController = new BallControlController()
        this.withoutBallController = new WithoutBallController()
    }

    getCommand(env, envHistory, hearedEvents){

        if (!env.closestPlayer || env.closestPlayer.distanceToBall > env.ball.distance){
            return this.ballControlController.getCommand(env, envHistory, hearedEvents)
        }

        return  this.withoutBallController.getCommand(env, envHistory, hearedEvents)
    }

}

module.exports = AttackController