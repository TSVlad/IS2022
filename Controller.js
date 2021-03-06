const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");
const Manager = require("./Manager");
const TaManager = require("./lab5/TaManager");

class Controller {


    constructor() {
        this.mgr = new TaManager()
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
            const visibleObjects = parseVisibleData(data)
            const coordinates = getAgentCoordinates(visibleObjects)
            console.log('handleSee', coordinates)
            this.mgr.addInfo({...visibleObjects, coordinates})
            this.agent.act = this.mgr.getCommand()
            this.agent.sendCmd()
        }
    }


    handleHear(data) {
        console.log('HEAR', data.p[2])
        console.log(data.msg)
        if (data.p[2] === 'play_on') {
            if (process.env.ROLE !== 'STATIST') {
                this.agent.active = true
            }
        } else if (data.p[2] === '\"go\"') {
            this.agent.ready = true
        } else if (data.p[2].startsWith('goalie_catch_ball_r')) {
            // this.ballInHands = true
        } else if (data.p[2].startsWith('goal')) {
            this.agent.ready = false
            this.mgr.initTA()
            if (process.env.ROLE === 'PASS') {
                this.agent.act = {n: 'move', v: '-20 -5'}
                this.agent.sendCmd()
            } else if (process.env.ROLE === 'KICK') {
                this.agent.act = {n: 'move', v: '-20 5'}
                this.agent.sendCmd()
            }
            this.agent.active = false
        } else if (data.p[2] === 'half_time') {
            this.mgr.initTA()
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller