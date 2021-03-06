const Controller = require("./Controller");
class Agent {

    constructor(team) {
        this.side = 'l'
        this.act = null

        this.active = false
        this.visibleObject = null
        this.coorfinates = null
        this.id = null
        this.team = team

        this.controller = new Controller()
        this.controller.setAgent(this)
    }

    msgGot(msg) {
        let data = msg.toString('utf8')
        this.controller.processMsg(data)
        this.sendCmd()
    }

    setSocket(socket) {
        this.socket = socket
    }

    socketSend(cmd, value) {
        console.log(cmd, value)
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    sendCmd() {
        if (this.active) {
            if (this.act) {
                    this.socketSend(this.act.n, `${this.act.v}${!isNaN(this.act.a)? ' ' + this.act.a : ''}`)
            }
            this.act = null
        }
    }
}

module.exports = Agent