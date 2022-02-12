const Msg = require('./msg')
const readline = require('readline')
class Agent {
    constructor() {
        this.position = "l"
        this.run = false
        this.act = null
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        this.rl.on('line', (input) => {
            if (this.run) {
                switch (input) {
                    case 'w':
                        console.log(123)
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
    }

    msgGot(msg) {
        let data = msg.toString('utf8')
        this.processMsg(data)
        this.sendCmd()
    }

    setSocket(socket) {
        this.socket = socket
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
                this.run = true
                break
            case 'init':
                this.initAgent(data.p)
                break
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
}

module.exports = Agent