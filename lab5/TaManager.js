const ShooterTA = require("./ShooterTA");
const GkTA = require("./GkTA");
class TaManager {

    constructor() {
        this.ta = process.env.GK ? GkTA : ShooterTA
    }

    getCommand() {
        let command = undefined
        while (!command) {
            console.log(`IN NODE ${this.ta.state.currentNode}`)
            const currentNode = this.ta.nodes[this.ta.state.currentNode]
            if (currentNode.getCommand) {
                command = currentNode.getCommand(this.ta.state)
            }

            let dest = null

            for (const edgeName of currentNode.e) {
                const edge = this.ta.edges[edgeName]
                if (edge.condition(this.ta.state)) {
                    dest = edge.destination
                    break
                }
            }

            if (!dest) {
                this.ta.state.currentNode = 'start'
                if (!command) {
                    command = {
                        n: 'turn',
                        v: '0'
                    }
                }
            } else {
                this.ta.state.currentNode = dest
            }
        }
        return command
    }

    addInfo(info) {
        this.ta.addInfo(this.ta.state, info)
    }

    initTA() {
        this.ta.restart(this.ta.state)
    }
}

module.exports = TaManager