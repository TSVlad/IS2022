const Agent = require('./agent')
const {rl} = require("./console");
const VERSION = 7
let teamName = process.env.TEAM
let agent = new Agent(teamName)

require('./socket')(agent, teamName, VERSION)

// rl.question('x: ', x => {
//     rl.question('y: ', y => {
//         agent.socketSend('move', `${x} ${y}`)
//     })
// })

setTimeout(() => {
    agent.socketSend('move', `${process.env.X} ${process.env.Y}`)
}, 2500)