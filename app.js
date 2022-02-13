const Agent = require('./agent')
const {rl} = require("./console");
const VERSION = 7
let teamName = 'ts_team'
let agent = new Agent()

require('./socket')(agent, teamName, VERSION)

rl.question('x: ', x => {
    rl.question('y: ', y => {
        agent.socketSend('move', `${x} ${y}`)
        rl.question('speed: ', speed => {
            agent.setTurnSpeed(speed)
        })
    })
})
