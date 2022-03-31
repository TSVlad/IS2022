const GoToPositionTree = require("../trees/GoToPositionTree");
const {getCommandFromTree} = require("../utils");

class PositionController {
    constructor() {
        this.goToPositionTree = GoToPositionTree
    }

    getCommand(env, envHistory, hearedEvents){
        return getCommandFromTree(this.goToPositionTree, env, envHistory, hearedEvents)
    }

}

module.exports = PositionController