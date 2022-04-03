const AttackController = require("./AttackController");
const DefenceController = require("./DefenceController");
const {getDistanceBetweenObjects} = require("../../field");
const TreesRepository = require("../trees/TreesRepository");

class MainController {
    constructor() {
        this.atackController = new AttackController()
        this.defenceController = new DefenceController()
    }

    prepareCoord(num){
        var result = num < 0 ? '-' : '+'
        result += Math.abs(num.toFixed(0))
        return result
    }

    getDistance(coords1, coords2) {
        return Math.sqrt((coords1.x - coords2.x) ** 2 + (coords1.y - coords2.y) ** 2)
    }

    getCommand(env, envHistory, hearedEvents){
        console.log('4 IN MAIN CONTROLLER')

        if (process.env.GK) {
            return this.taManager.getCommand()
        }

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
                v: ` p${env.side}${this.prepareCoord(coordinatesPass.x)}${this.prepareCoord(coordinatesPass.y)}`
            }
        }

        if (envWithBall && this.isAttacking(envWithBall)){
            return this.atackController.getCommand(env, envHistory, hearedEvents)
        } else if (envWithBall) {
            return this.defenceController.getCommand(env, envHistory, hearedEvents)
        }
        return {
            n: 'turn',
            v: '90'
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