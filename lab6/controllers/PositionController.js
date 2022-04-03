const GoToPositionTree = require("../trees/GoToPositionTree");
const {getCommandFromTree} = require("../utils");

class PositionController {
    constructor() {
        this.goToPositionTree = GoToPositionTree
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('5 IN POSITION CONTROLLER')
        return getCommandFromTree(this.goToPositionTree, env, envHistory, hearedEvents)
    }

}

module.exports = PositionController