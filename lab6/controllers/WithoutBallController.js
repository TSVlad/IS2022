const AcceptPassTree = require("../trees/AcceptPassTree");
const HelpAttackTree = require("../trees/HelpAttackTree");
const {getCommandFromTree} = require("../utils");
const {TreesRepository} = require("../trees/TreesRepository");

const getLastSeenCoordinates = (env, envHistory) => {
    if (env.coordinates) {
        return env.coordinates
    } else {
        for (const e of envHistory) {
            if (e.coordinates) {
                return e.coordinates
            }
        }
    }
    return null
}

const getDistance = (coords1, coords2) => {
    return Math.sqrt((coords1.x - coords2.x) ** 2 + (coords1.y - coords2.y) ** 2)
}

class WithoutBallController {
    constructor() {
        this.acceptPassTree = AcceptPassTree
        this.helpAttackTree = HelpAttackTree
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('7 IN WITHOUT BALL CONTROLLER')

        TreesRepository.decidePass = false

        let tree;
        const coordinates = getLastSeenCoordinates(env, envHistory)
        if (hearedEvents.pass.time >= 0 && env.time - hearedEvents.pass.time <= 10 && coordinates
            && getDistance(coordinates, hearedEvents.pass.coordinates < 2)) {
            tree = this.acceptPassTree
        } else {
            tree = this.helpAttackTree
        }
        return getCommandFromTree(tree, env, envHistory, hearedEvents)
    }
}

module.exports = WithoutBallController