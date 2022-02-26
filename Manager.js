const DecisionTree = require("./DecisionTree");

class Manager {

    constructor() {
    }

    setController(controller) {
        this.controller = controller
    }

    doActions() {
        let currentVertex = DecisionTree.root
        while (!!currentVertex.next) {
            currentVertex.exec(this, DecisionTree.state)
            currentVertex = DecisionTree[currentVertex.next]
        }
        currentVertex.exec(this, DecisionTree.state)
    }

    isTeammateVisible(){

    }

    getVisibleTeammates() {
        // const objects = this.controller.visibleObjects
    }
    isGoalReached(action) {

    }
    isObjectVisible(objName) {

    }
    getObject(goal) {

    }
    isStartAngleDifferenceBig(leader) {

    }
    getTeammate(leader) {

    }
    sendCommand(command) {

    }

    isBallVisible() {

    }

    canIKick() {

    }
}

module.exports = Manager