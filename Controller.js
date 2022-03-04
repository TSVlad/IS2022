const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");
const Manager = require("./Manager");

class Controller {


    constructor() {
        this.mgr = new Manager()
        this.mgr.initActions()
        this.mgr.setController(this)
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

            this.visibleObjects = parseVisibleData(data)
            this.coordinates = getAgentCoordinates(this.visibleObjects)

            this.mgr.doActions()
        }
    }


    handleHear(data) {
        console.log('HEAR', data.p[2])
        if (data.p[2] === 'play_on') {
            if (process.env.ROLE !== 'STATIST') {
                this.agent.active = true
            }
        } else if (data.p[3] === '\"go\"') {
            this.agent.ready = true
        } else if (data.p[2].startsWith('goalie_catch_ball_r')) {
            // this.ballInHands = true
        } else if (data.p[2].startsWith('goal')) {
            this.mgr.initActions()
            this.agent.active = false
            if (process.env.ROLE === 'PASS') {
                this.agent.sendCmd({n: 'move', v: '-20 -5'})
            } else if (process.env.ROLE === 'KICK') {
                this.agent.sendCmd({n: 'move', v: '-20 5'})
            }
        } else if (data.p[2] === 'half_time') {
            this.mgr.initActions()
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller