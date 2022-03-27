const AcceptPassTree = require("../trees/AcceptPassTree");
const HelpAttackTree = require("../trees/HelpAttackTree");
const {getCommandFromTree} = require("../utils");

class WithoutBallController {
    constructor() {
        this.acceptPassTree = AcceptPassTree
        this.helpAttackTree = HelpAttackTree
    }

    getCommand(env, envHistory, hearedEvents){
        let tree;
        if (hearedEvents.pass.time >= 0 && env.time - hearedEvents.pass.time <= 10) {
            tree = this.acceptPassTree
        } else {
            tree = this.helpAttackTree
        }
        return getCommandFromTree(tree, env, envHistory, hearedEvents)
    }
}

module.exports = WithoutBallController