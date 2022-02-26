const GO = 'go_to_object', KICK = 'kick'
// для 18
const ANGLE_BIGGER_THAN = 1
// для 19
const TARGET_DIST = 5
// для 23
const DISTANCE_TO_LEADER = 10

const DecisionTree = {
    state: {
        next: 0,
        sequence: [
            {act: "go_to_object", objName: "frb", targetDist: 3},
            {act: "go_to_object", objName: "gl ", targetDist: 3},
            {act: "go_to_object", objName: "fc", targetDist: 3},
            {act: "kick", objName: "b", goal: "gr"}
        ],
        command: null
    },

    root: {
        exec: (mgr, state) => {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: ''
    },

    // 1
    roleKnown: {
        condition: (mgr, state) => !!state.role,
        trueCond:"amILeader",
        falseCond:"teammateVisible",
    },

    // 2
    teammateVisible: {
        condition: (mgr, state) => mgr.isTeammateVisible(),
        trueCond:"becomeSlave",
        falseCond:"becomeLeader",
    },

    // 3
    amILeader: {
        condition: (mgr, state) => state.role === 'LEADER',
        trueCond:"didIReachGoal",
        falseCond:"isMainTeammateReachedGoal",
    },

    // 4
    becomeSlave: {
        exec: (mgr, state) => {
            state.role = 'SLAVE'
            state.leader = mgr.getVisibleTeammate()
        },
        next: 'isMainTeammateReachedGoal'
    },

    // 5
    becomeLeader: {
        exec: (mgr, state) => {
            state.role = 'LEADER'
        },
        next:"didIReachGoal"
    },

    // 6
    didIReachGoal: {
        condition: (mgr, state) => mgr.isGoalReached(state.action),
        trueCond:"finishLeaderGoal",
        falseCond:"isFlagGoal",
    },

    // 7
    isMainTeammateReachedGoal: {
        condition: (mgr, state) => mgr.isGoalReached(state.action, state.leader),
        trueCond:"finishSlaveGoal",
        falseCond:"isAngleDifferenceBig",
    },

    // 8
    finishLeaderGoal: {
        exec: (mgr, state) => {
            state.next++
            state.action = state.sequence[state.next]
        },
        next:"isFlagGoal"
    },

    // 9
    isFlagGoal: {
        condition: (mgr, state) => state.action.act === GO,
        trueCond:"isFlagVisible",
        falseCond:"isBallVisible",
    },

    // 10
    finishSlaveGoal: {
        exec: (mgr, state) => {
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "isMainTeammateReachedGoal"
    },

    // 11
    isFlagVisible: {
        condition: (mgr, state) => mgr.isObjectVisible(state.action.objName),
        trueCond:"isAngleToObjectBig",
        falseCond:"rotate45",
    },

    // 12
    isBallVisible: {
        condition: (mgr, state) => mgr.isBallVisible(),
        trueCond:"isDistanceDifferenceSmall",
        falseCond:"rotate45",
    },

    // 13
    isDistanceDifferenceSmall: {
        condition: (mgr, state) => mgr.canIKick(),
        trueCond:"isKickDirectionVisible",
        falseCond:"isStartAngleDifferenceBig",
    },

    // 14
    isKickDirectionVisible: {
        condition: (mgr, state) => mgr.isObjectVisible(state.action.goal),
        trueCond:"strongKick",
        falseCond:"sendCommand",
    },

    // 15
    strongKick: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 100,
                a: mgr.getObject(state.action.goal).angle
            }
        },
        next: "sendCommand"
    },

    // 16
    rotateWithBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 5,
                a: 45
            }
        },
        next: "sendCommand"
    },

    // 17
    rotate45: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: 45
            }
        },
        next: "sendCommand"
    },

    // 18
    isAngleToObjectBig: {
        condition: (mgr, state) => mgr.getObject(state.action.objName).angle > ANGLE_BIGGER_THAN,
        trueCond:"rotateToObject",
        falseCond:"goToObject",
    },

    // 19
    goToObject: {
        exec: (mgr, state) => {
            const objDistance = mgr.getObject(state.action.objName).distance
            state.command = {
                n: 'dash',
                v: objDistance < TARGET_DIST ? 50 : 100
            }
        },
        next: "sendCommand"
    },

    // 20
    rotateToObject: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getObject(state.action.objName).angle
            }
        },
        next: "sendCommand"
    },

    // 21
    isStartAngleDifferenceBig: {
        condition: (mgr, state) => mgr.isStartAngleDifferenceBig(state.leader),
        trueCond:"turnToStartAngle",
        falseCond:"isStartDistanceDifferenceBig",
    },

    // 22
    turnToStartAngle: {
        exec: (mgr, state) => {
            const currentLeader = mgr.getTeammate(state.leader)
            const angle = (state.leader.angle + currentLeader.angle) / 2
            state.command = {
                n: 'turn',
                v: angle
            }
        },
        next: "sendCommand"
    },

    // 23
    isStartDistanceDifferenceBig: {
        condition: (mgr, state) => { // ?????
            const distanceToLeader = mgr.getTeammate(state.leader).distance
            return distanceToLeader > DISTANCE_TO_LEADER
        },
        trueCond:"fastStepForward",
        falseCond:"isStartDistanceDifferenceSmall",
    },

    // 24
    fastStepForward: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 150
            }
        },
        next: "sendCommand"
    },

    // 25
    isStartDistanceDifferenceSmall: {
        condition: (mgr, state) => true,
        trueCond:"doNothing",
        falseCond:"stepBackward",
    },

    // 26
    doNothing: {
        exec: (mgr, state) => {}
    },

    // 27
   stepBackward: {
       exec: (mgr, state) => {
           state.command = {
               n: 'dash',
               v: -100
           }
       },
       next: "sendCommand"
   },

   sendCommand: {
        exec: (mgr, state) => {
            mgr.sendCommand(state.command)
        }
   }
}

module.exports = DecisionTree