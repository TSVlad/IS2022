const Msg = require("./msg");
const {parseVisibleData} = require("./msg");
const {getAgentCoordinates, getObjectCoordinates} = require("./field");
const MainController = require("./lab6/controllers/MainController");
const TreesRepository = require("./lab6/trees/TreesRepository");
const TaManager = require("./lab5/TaManager");

class Controller {


    constructor() {
        this.subController = new MainController()
        this.env = null
        this.envHistory = []
        this.hearedEvents = {
            pass: {
                time: -1,
                angle: 0
            }
        }

        this.taManager = new TaManager()

        this.time = 0
        this.mandatoryCommand = null
    }

    processMsg(msg) {
        let data = Msg.parseMsg(msg)
        console.log(data.msg)

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
            this.agent.side = 'r'
        }
        if (data.p[1]) {
            this.agent.id = data.p[1]
        }
    }

    handleSee(data) {
        if (this.agent.active) {
            console.log(this.time)
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
            const env = {...visibleObjects, coordinates, side: this.agent.side, number: this.agent.id, time: this.time}
            const coords = this.getLastCoordinates(env, this.envHistory)
            const flags = Object.values(env.flags)
            if (coords && flags.length > 0) {
                env.currentAngle = this.getCurrentAngle(coords, flags[0], this.agent.side)
            }
            this.addNewEnv(env)
            this.taManager.addInfo(env)
            try {
                this.agent.act = this.subController.getCommand(this.env, this.envHistory, this.hearedEvents)
            } catch (e) {
                console.log('EXCEPTION:')
                console.log(e)
                this.agent.act = {
                    n: 'turn',
                    v: 0
                }
            }
            this.agent.sendCmd()
            this.time++
        }
    }

    addNewEnv(env) {
        if (this.envHistory.length >= 10) {
            this.envHistory.pop()
        }
        this.envHistory.unshift(this.env)
        this.env = env
    }


    handleHear(data) {
        console.log('HEAR', data)
        if (data.p[2] === 'play_on') {
            if (process.env.ROLE !== 'STATIST') {
                this.agent.active = true
            }
        } else if (data.p[2] === '\"go\"') {
            this.agent.ready = true
        } else if (data.p[2].startsWith('goalie_catch_ball_r') || data.p[2].startsWith('goalie_catch_ball_l')) {
            // this.ballInHands = true
        } else if (data.p[2].startsWith('goal')) {
            this.agent.ready = false
            this.agent.active = false
        } else if (data.p[2] === 'half_time') {
            
        } else if (data.p[3] === `p${this.agent.side}`) {
                this.hearedEvents.pass = {
                    time: data.p[0],
                    angle: data.p[1],
                    coordinates: {
                        x: data.p[4],
                        y: data.p[5]
                    }
                }
        }

    }

    setAgent(agent) {
        this.agent = agent
    }


}

module.exports = Controller