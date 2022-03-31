const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");
const MainController = require("./lab6/controllers/MainController");
const TreesRepository = require("./lab6/trees/TreesRepository");

class Controller {


    constructor() {
        this.subController = new MainController()
        this.envHistory = []
        this.hearedEvents = {
            pass: {
                time: -1,
                angle: 0
            }
        }
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
            if (coordinates) {
                const flags = Object.values(visibleObjects.flags)
                for (const player of visibleObjects.players) {
                    player.coordinates = getObjectCoordinates(coordinates, flags, player)
                }
                if (visibleObjects.ball) {
                    visibleObjects.ball.coordinates = getObjectCoordinates(coordinates, flags, visibleObjects.ball)
                }
            }

            const env = {...visibleObjects, coordinates, side: this.agent.position, number: this.agent.id}
            this.agent.act = this.subController.getCommand(env, this.envHistory, this.hearedEvents)
            this.agent.sendCmd()
            this.addToHistory(env)
        }
    }

    addToHistory(env) {
        if (this.envHistory.length >= 10) {
            this.envHistory.pop()
        }
        this.envHistory.unshift(env)
    }


    handleHear(data) {
        console.log(this.agent.id)
        console.log('HEAR', data)
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
            this.agent.active = false
        } else if (data.p[2] === 'half_time') {
            
        } else if (data.p[2] === 'pass' && data.p[3] === process.env.TEAM) {
            this.hearedEvents.pass = {
                time: data.p[0],
                angle: data.p[1],
                coordinates: {
                    x: parseFloat(data.p[4]),
                    y: parseFloat(data.p[5])
                }
            }
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller