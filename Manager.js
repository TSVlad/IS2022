const DecisionTree = require("./DecisionTree");
const {getObjectCoordinates, getDistanceBetweenObjects} = require("./field");

class Manager {

    constructor() {
    }

    setController(controller) {
        this.controller = controller
    }

    doActions() {
        let currentVertex = DecisionTree.root
        while (!!currentVertex.next || currentVertex.trueCond) {

            if (currentVertex.exec) {
                currentVertex.exec(this, DecisionTree.state)
                console.log(currentVertex.next)
                currentVertex = DecisionTree[currentVertex.next]
            } else if (currentVertex.condition) {
                const next = currentVertex.condition(this, DecisionTree.state) ? currentVertex.trueCond : currentVertex.falseCond
                currentVertex = DecisionTree[next]
                console.log(next)
            } else {
                return
            }

        }
        currentVertex.exec(this, DecisionTree.state)
    }

    isTeammatesVisible() {
        return this.controller.visibleObjects.players.length > 0
    }

    chooseLeader(turnedRight) {
        if (this.controller.visibleObjects.players.length > 1) {
            if (turnedRight) {
                return this.controller.visibleObjects.players
                    .filter(player => player.team === this.controller.agent.team)
                    .sort((a, b) => a.angle < b.angle ? 0 : 1)[0]
            }
            return this.controller.visibleObjects.players
                .filter(player => player.team === this.controller.agent.team)
                .sort((a, b) => a.angle < b.angle ? 1 : 0)[0]
        } else {
            return this.controller.visibleObjects.players[0]
        }
    }

    getVisibleTeammate() {
        return  this.controller.visibleObjects.players
    }

    isGoalReached(action) {
        switch (action.act) {
            case 'go_to_object':
                const flag = this.controller.visibleObjects.flags[action.objName]
                return !!flag && flag.distance <= action.targetDist
            case 'goal':
                return false
        }
    }

    isGoalReachedByLeader(action, leader) {
        switch (action.act) {
            case 'go_to_object':
                const leaderNow = this.controller.visibleObjects.players.filter(player => player.number === leader.number && player.team === leader.team)[0]
                const flag = this.controller.visibleObjects.flags[action.objName]
                return flag && getDistanceBetweenObjects(leaderNow, flag) <= action.targetDist
            case 'goal':
                return false
        }
    }

    getVisibleObject(objName) {
        switch (objName.charAt(0)){
            case 'f':
            case 'g':
                return this.controller.visibleObjects.flags[objName]
            case 'p':
                //TODO: add logic
                break
            case 'b':
                return this.controller.visibleObjects.ball
            default:
                return undefined;

        }
    }

    getVisibleBall() {
        return this.controller.visibleObjects.ball
    }

    isStartAngleDifferenceBig(leader) {

    }

    getPlayer(playerInfo) {
        return this.controller.visibleObjects.players
            .filter(player => player.team === playerInfo.team && player.number === playerInfo.number)[0]
    }

    sendCommand(command) {
        this.controller.agent.act = command
        this.controller.agent.sendCmd()
    }

}

module.exports = Manager