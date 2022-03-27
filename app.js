const Agent = require('./agent')
const {rl} = require("./console");
const VERSION = 7
let teamName = process.env.TEAM
let agent = new Agent(teamName)

require('./socket')(agent, teamName, VERSION)

setTimeout( () => {
    agent.active = true
    agent.socketSend('move', `${process.env.X} ${process.env.Y}`)
    agent.active = false
}, 2000)