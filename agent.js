const Msg = require('./msg')
const {rl} = require("./console");
const {Flags, getCoordinatesBy3Points, getObjectCoordinates} = require("./field");
const {parseVisibleData} = require("./msg");
class Agent {
    constructor() {
        this.turnSpeed = 0
        this.shouldTurn = false
        this.printable = false

        this.side = 'l'
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

    checkXLine(flags) {
        if (flags[0].x === flags[1].x && flags[0].x === flags[2].x) {
            let foundAnother = false;
            for (let i = 3; i < flags.length; i++) {
                foundAnother = flags[i].x !== flags[0].x
                if (foundAnother) {
                    break
                }
            }
            return foundAnother
        } else {
            return true
        }
    }

    checkYLine(flags) {
        if (flags[0].y === flags[1].y && flags[0].y === flags[2].y) {
            let foundAnother = false;
            for (let i = 3; i < flags.length; i++) {
                foundAnother = flags[i].y !== flags[0].y
                if (foundAnother) {
                    break
                }
            }
            return foundAnother
        } else {
            return true
        }
    }


    printCoordinates(data) {
        const objects =  parseVisibleData(data)

        if (objects.flags.length >= 3) {

            if (!this.checkXLine(objects.flags) || !this.checkYLine(objects.flags)) {
                console.log('SAME LINE FLAGS')
                return
            }

            const coordinates = getCoordinatesBy3Points(objects.flags.sort((f1, f2) => f1.distance - f2.distance))
            console.log(`My coordinates: ${coordinates.x}, ${coordinates.y}`)
            if (objects.players.length > 0) {
                const anotherPlayerCoordinates = getObjectCoordinates(coordinates, objects.flags, objects.players[0])
                console.log(`Another player coordinates: ${anotherPlayerCoordinates.x}, ${anotherPlayerCoordinates.y}`)

            }

        } else {
            console.log(`Few flags: ${objects.flags.length}`)
        }
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