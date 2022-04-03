const PositionController = require("./PositionController");
const PressingController = require("./PressingController");
const {TreesRepository} = require("../trees/TreesRepository");

const getEnvWithBall = (env, envHistory) => {
    if (env.ball) {
        return env
    }
    for (const e of envHistory) {
        if (e.ball) {
            return e
        }
    }
    console.log('WARN HelpAttackTree getLastSeenBall: ball not found in last 11 ticks!')
    return null
}

const getDistance = (coords1, coords2) => {
    return Math.sqrt((coords1.x - coords2.x) ** 2 + (coords1.y - coords2.y) ** 2)
}

class DefenceController {
    constructor() {
        this.pressingController = new PressingController()
        this.positionController = new PositionController()
    }

    getCommand(env, envHistory, hearedEvents) {
        console.log('3 IN DEFENCE CONTROLLER')

        TreesRepository.decidePass = false

        let histEnv = getEnvWithBall(env, envHistory);

        if (!histEnv || !histEnv.ball.coordinates) {
            return this.positionController.getCommand(env, envHistory, hearedEvents)
        }
        const teammatesCloser = histEnv.players.filter(player =>
            player.coordinates
            && player.team === process.env.TEAM
            /*&& getDistance(player.coordinates, ball.coordinates) < ball.distance */
            && histEnv.ball.distance > player.distance)
        console.log('TEAMMATES CLOSER:')
        console.log(teammatesCloser)
        console.log('BETA IS:', env.currentAngle)
        return teammatesCloser.length > 0 ? this.positionController.getCommand(env, envHistory, hearedEvents)
            : this.pressingController.getCommand(env, envHistory, hearedEvents)
    }

}

module.exports = DefenceController