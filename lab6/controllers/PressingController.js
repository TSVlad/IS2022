const PressingTree = require("../trees/PressingTree");
const {getCommandFromTree} = require("../utils");

class PressingController {
    constructor() {
        this.pressingTree = PressingTree
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('6 IN PRESSING CONTROLLER')
        return getCommandFromTree(this.pressingTree, env, envHistory, hearedEvents)
    }

}

module.exports = PressingController