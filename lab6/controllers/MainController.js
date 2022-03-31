const AttackController = require("./AttackController");
const DefenceController = require("./DefenceController");
const {getDistanceBetweenObjects} = require("../../field");
const TreesRepository = require("../trees/TreesRepository");

class MainController {
    constructor() {
        this.atackController = new AttackController()
        this.defenceController = new DefenceController()
    }

    getCommand(env, envHistory, hearedEvents){
        let envWithBall = env
        if (!env.ball) {
            envWithBall = null
            for (const e of envHistory) {
                if (e.ball) {
                    envWithBall = e
                    break
                }
            }
        }

        if (!!TreesRepository.coordinatesPass) {
            const coordinatesPass = {...TreesRepository.coordinatesPass}
            TreesRepository.coordinatesPass = null
            return {
                n: 'say',
                v: `\" pass ${process.env.TEAM} ${coordinatesPass.x} ${coordinatesPass.y} \"`
            }
        }

        if (envWithBall && this.isAttacking(envWithBall)){
            return this.atackController.getCommand(env, envHistory, hearedEvents)
        } else if (envWithBall) {
            return this.defenceController.getCommand(env, envHistory, hearedEvents)
        }
        return {
            a: 'turn',
            v: '45'
        }
    }

    isAttacking(env) {
        let closestPlayer = null
        for (const player of env.players) {
            player.distanceToBall = getDistanceBetweenObjects(player, env.ball)
            if (!closestPlayer || player.distanceToBall < closestPlayer.distanceToBall) {
                closestPlayer = player
            }
        }
        TreesRepository.closestPlayerToBall = closestPlayer
        return !closestPlayer || closestPlayer.distanceToBall > env.ball.distance || closestPlayer.team === process.env.TEAM
    }
}

module.exports = MainController