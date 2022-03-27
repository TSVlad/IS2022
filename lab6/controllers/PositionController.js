const GoToPositionTree = require("../trees/GoToPositionTree");

class PositionController {
    constructor() {
        this.goToPositionTree = GoToPositionTree
    }

    getCommand(env, envHistory){}

}

module.exports = PositionController