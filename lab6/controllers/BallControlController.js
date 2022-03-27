const RunWithBallTree = require("../trees/RunWithBallTree");
const PassTree = require("../trees/PassTree");
const ShotTree = require("../trees/ShotTree");

class BallControlController {
    constructor() {
        this.passTree = PassTree
        this.runWithBallTree = RunWithBallTree
        this.shotTree = ShotTree
    }

    getCommand(env, envHistory){

    }

}

module.exports = BallControlController