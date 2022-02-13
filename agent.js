const Msg = require('./msg')
const {rl} = require("./console");
const {Flags, getCoordinatesBy3Points} = require("./field");
class Agent {
    constructor() {
        this.turnSpeed = 0
        this.shouldTurn = false
        this.printable = false

        this.position = "l"
        this.run = false
        this.act = null
        this.rl = rl
        this.rl.on('line', (input) => {
            if (this.run) {
                switch (input) {
                    case 'w':
                        this.act = {
                            n: 'dash',
                            v: 100
                        }
                        break
                    case 'd':
                        this.act = {
                            n: 'turn',
                            v: 20
                        }
                        break
                    case 'a':
                        this.act = {
                            n: 'turn',
                            v: -20
                        }
                        break
                    case 's':
                        this.act = {
                            n: 'kick',
                            v: 100
                        }
                        break
                }
            }
        })

        this.setTurningState()
    }

    msgGot(msg) {
        let data = msg.toString('utf8')
        this.processMsg(data)
        this.sendCmd()
    }

    setSocket(socket) {
        this.socket = socket
    }

    setTurnSpeed(speed) {
        this.turnSpeed = speed
    }

    socketSend(cmd, value) {
        this.socket.sendMsg(`(${cmd} ${value})`)
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
                this.initAgent(data.p)
                break
            case 'see':
                this.handleSee(data)
        }
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(p) {
        if (p[0] === 'r') {
            this.position = 'r'
        }
        if (p[1]) {
            this.id = p[1]
        }
    }

    analyzeEnv(msg, cmd, p) {

    }

    sendCmd() {
        if (this.run) {
            if (this.act) {
                if (this.act.n === 'kick') {
                    this.socketSend(this.act.n, this.act.v + ' 0')
                } else {
                    this.socketSend(this.act.n, this.act.v)
                }
            }
            this.act = null
        }
    }

    setTurningState() {
        this.act = {
            n: 'turn',
            v: this.turnSpeed
        }
    }

    handleSee(data) {
        if (this.shouldTurn) {
            this.setTurningState()
            this.sendCmd()
        }

        if (this.printable) {
            this.printCoordinates(data)
        }
    }

    printCoordinates(data) {
        const flags = this.getFlags(data, 3)
        if (flags.length >= 3) {
            const coordinates = getCoordinatesBy3Points(flags.sort((f1, f2) => f1.distance - f2.distance))
            console.log(coordinates)
        } else {
            console.log(`Few flags: ${flags.length}`)
        }
    }

    getFlags(data, limit) {
        const flags = []
        for (let i = 1; i < data.p.length; i++) {
            let flagName = ''
            for (const letter of data.p[i].cmd.p) {
                flagName += letter
            }
            const potentialCoordinates = Flags[flagName]
            if (!potentialCoordinates) {
                continue
            }

            flags.push({
                ...potentialCoordinates,
                distance: data.p[i].p[0],
                angle: data.p[i].p[1]
            })

            // if (flags.length === limit) {
            //     break
            // }
        }
        return flags
    }

    handleHear(data) {
        if (data.p[2] === 'play_on') {
            console.log('PLAY ON')
            this.shouldTurn = true
            this.printable = true
        }
        this.run = true
    }
}

module.exports = Agent