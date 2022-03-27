const PositionController = require("./PositionController");

class PressingController {
}

class DefenceController {
    constructor() {
        this.pressingController = new PressingController()
        this.positionController = new PositionController()
    }

    getCommand(env, envHistory, hearedEvents){}

}

module.exports = DefenceController