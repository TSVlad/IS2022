const PressingTree = require("../trees/PressingTree");
const {getCommandFromTree} = require("../utils");

class PressingController {
    constructor() {
        this.pressingTree = PressingTree
    }

    getCommand(env, envHistory, hearedEvents){
        return getCommandFromTree(this.pressingTree, env, envHistory, hearedEvents)
    }

}

module.exports = PressingController