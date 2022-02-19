const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");

const actions = [
    // {act: "go_to_object", objName: "frb", targetDist: 3},
    // {act: "go_to_object", objName: "gl", targetDist: 3},
    // {act: "go_to_object", objName: "fc", targetDist: 3},
    {act: "kick", objName: "b", goal: "gl"}]

class Controller {

    constructor() {
        this.actions = [...actions]
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
                    this.kick()
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
                if (obj.distance < this.actions[0].targetDist) {
                    this.finishAction()
                    return
                }
                this.agent.act = {
                    n: 'dash',
                    v: obj.distance < this.actions[0].targetDist + 2 ? 50 : 100
                }
            }
        } else {
            this.agent.act = {
                n: 'turn',
                v: 45
            }
        }
    }

    kick() {
        const objToKick = this.getObjectFromVisible(this.actions[0].objName)
        const directionToKick = this.getObjectFromVisible(this.actions[0].goal)

        if (!objToKick || objToKick.distance >= 0.5) {
            console.log('RUN TO BALL')
            this.actions.unshift({
                act: 'go_to_object',
                objName: 'b',
                targetDist: 0.5
            })
        } else if (!directionToKick) {
            this.agent.act = {
                n: 'kick',
                v: 5,
                a: 45
            }
        } else {
            console.log('KICK BALL')
            this.agent.act = {
                n: 'kick',
                v: 100,
                a: this.getObjectFromVisible(this.actions[0].goal).angle
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

    handleHear(data) {
        if (data.p[2] === 'play_on') {
            console.log('PLAY ON')
            this.agent.active = true
        } else if (data.p[2].startsWith('goal')) {
            this.actions = [...actions]
            this.agent.active = false
            // TODO action on a goal
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller