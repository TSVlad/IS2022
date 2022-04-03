const Agent = require('./agent')
const {rl} = require("./console");
const VERSION = 7
let teamName = process.env.TEAM
let agent = new Agent(teamName)

require('./socket')(agent, teamName, VERSION)

setTimeout( () => {
    // agent.active = true
    // if (process.env.QWE) {
    //     agent.socketSend('move', `${process.env.X} ${process.env.Y}`)
    // } else {
    //     agent.socketSend('move', `-20 -20`)
    // }

    agent.socketSend('move', `${process.env.X} ${process.env.Y}`)


    agent.active = false

    if (agent.side !== 'l') {
        setTimeout( () => {
            agent.active = true
            agent.act = {
                n: 'turn',
                v: 180
            }
            agent.sendCmd()
            agent.active = false
        }, 1000)
    }

}, 2000)