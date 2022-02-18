const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");

class Controller {

    constructor() {
        this.actions = [
            {act: "go_to_object", objName: "frb"},
            {act: "go_to_object", objName: "gl"},
            {act: "go_to_object", objName: "fc"},
            /*{act: "kick", objName: "b", goal: "gr"}*/]
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        if (!data) {
            throw new Error("Parse error\n" + msg)
        }
        switch (data.cmd) {
            case 'hear':
                this.handleHear(data)
                break
            case 'init':
                this.handleInit(data)
                break
            case 'see':
                this.handleSee(data)
        }
    }

    handleInit(data) {
        if (data.p[0] === 'r') {
            this.agent.position = 'r'
        }
        if (data.p[1]) {
            this.agent.id = data.p[1]
        }
    }

    handleSee(data) {
        if (this.agent.active) {

            this.agent.visibleObjects = parseVisibleData(data)
            this.agent.coordinates = getAgentCoordinates(this.agent.visibleObjects)

            this.doCurrentAction()

            this.agent.sendCmd()
        }
    }

    doCurrentAction() {
        if (this.actions.length > 0) {
            switch (this.actions[0].act) {
                case 'go_to_object':
                    this.goToObject()
                    break
                case 'kick':
                    break
            }
        }
    }

    goToObject() {
        const obj = this.getObjectFromVisible(this.actions[0].objName)

        if (obj) {
            if (Math.abs(obj.angle) > 1) {
                this.agent.act = {
                    n: 'turn',
                    v: obj.angle
                }
            } else {
                if (obj.distance < 3) {
                    this.finishAction()
                }
                this.agent.act = {
                    n: 'dash',
                    v: 100
                }
            }
        } else {
            // console.log(this.agent.visibleObjects)
            this.agent.act = {
                n: 'turn',
                v: 45
            }
        }
    }

    finishAction() {
        this.actions.shift()
        this.doCurrentAction()
    }

    getObjectFromVisible(objName) {
        switch (objName.charAt(0)){
            case 'f':
            case 'g':
                return this.agent.visibleObjects.flags[objName]
            case 'p':
                //TODO: add logic
                break
            case 'b':
                return this.agent.visibleObjects.ball
            default:
                console.log('getObjectFromVisible: Undefined object')

        }
    }

    kick(){

    }

    handleHear(data) {
        if (data.p[2] === 'play_on') {
            console.log('PLAY ON')
            this.agent.active = true
        } else if (data.p[2].startsWith('goal')) {
            // TODO action on a goal
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller