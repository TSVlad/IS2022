const PositionController = require("./PositionController");
const PressingController = require("./PressingController");

const getLastSeenBall = (env, envHistory) => {
    if (env.ball) {
        return env.ball
    }
    for (const e of envHistory) {
        if (e.ball) {
            return e.ball
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
        let ball = getLastSeenBall(env, envHistory);
        if (!ball || !ball.coordinates) {
            return this.positionController.getCommand(env, envHistory, hearedEvents)
        }
        const teammatesCloser = env.players.filter(player => player.coordinates && player.team === process.env.TEAM
            && getDistance(player.coordinates, ball.coordinates) < ball.distance)
        return teammatesCloser.length > 0 ? this.positionController.getCommand(env, envHistory, hearedEvents)
            : this.pressingController.getCommand(env, envHistory, hearedEvents)
    }

}

module.exports = DefenceController