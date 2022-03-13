const GO = 'go_to_object', GOAL = 'goal'
// для 13
const DIST_TO_KICK = 0.5
// для 18
const ANGLE_BIGGER_THAN = 1
// для 19
const TARGET_DIST = 5
// для 21
const DIFF_ANGLE = 10
// для 23
const DISTANCE_TO_LEADER = 10

const DecisionTree = {
    state: {
        next: 0,
        sequence: [
            {act: "go_to_object", objName: "fplc", targetDist: 3},
            {act: "go_to_object", objName: "flt", targetDist: 3},
            {act: "go_to_object", objName: "fc", targetDist: 3},
            {act: "goal", objName: "b", goal: "gr"}
        ],
        command: null
    },

    // state: {
    //     next: 0,
    //     sequence: [
    //         // {act: "go_to_object", objName: "fplc", targetDist: 3},
    //         // {act: "go_to_object", objName: "flt", targetDist: 3},
    //         // {act: "go_to_object", objName: "fplt", targetDist: 3},
    //         // {act: "go_to_object", objName: "gl", targetDist: 3},
    //         // {act: "go_to_object", objName: "fglb", targetDist: 3},
    //         // {act: "go_to_object", objName: "flb10", targetDist: 3},
    //         // {act: "go_to_object", objName: "flb30", targetDist: 3},
    //         // {act: "go_to_object", objName: "fbl40", targetDist: 3},
    //         // {act: "go_to_object", objName: "fc", targetDist: 3},
    //         {act: "goal", objName: "b", goal: "gl"}
    //     ],
    //     command: null
    // },

    root: {
        exec: (mgr, state) => {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: 'roleKnown'
    },

    // 1
    roleKnown: {
        condition: (mgr, state) => !!state.role,
        trueCond:"amILeader",
        falseCond:"teammatesVisible",
    },

    // 2
    teammatesVisible: {
        condition: (mgr, state) => mgr.isTeammatesVisible(),
        trueCond:"chooseLeader",
        falseCond:"didITurnLeft",
    },

    // 3
    amILeader: {
        condition: (mgr, state) => state.role === 'LEADER',
        trueCond:"didIReachGoal",
        falseCond:"doISeeLeader",
    },

    // 4
    becomeSlave: {
        exec: (mgr, state) => {
            state.role = 'SLAVE'
            if (!state.turnedLeft && ! state.turnedRight) {
                state.turnCoeff = state.leader.angle > 0 ? -1 : 1
            } else if (state.turnedLeft && ! state.turnedRight) {
                state.turnCoeff = 1
            } else {
                state.turnCoeff = -1
            }
        },
        next: 'doISeeLeader'
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
        condition: (mgr, state) => mgr.isGoalReachedByLeader(state.action, state.leader),
        trueCond:"finishSlaveGoal",
        // falseCond:"isStartAngleDifferenceBig",
        falseCond:"isDistanceSmall"
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
        condition: (mgr, state) => !!mgr.getVisibleObject(state.action.objName),
        trueCond:"isAngleToObjectBig",
        falseCond:"rotate45",
    },

    // 12
    isBallVisible: {
        condition: (mgr, state) => !!mgr.getVisibleBall(),
        trueCond:"isDistanceDifferenceSmall",
        falseCond:"rotate45",
    },

    // 13
    isDistanceDifferenceSmall: {
        condition: (mgr, state) => mgr.getVisibleBall().distance <= DIST_TO_KICK,
        trueCond:"isKickDirectionVisible",
        falseCond:"isAngleToObjectBig",
    },

    // 14
    isKickDirectionVisible: {
        condition: (mgr, state) => !!mgr.getVisibleObject(state.action.goal),
        trueCond:"strongKick",
        falseCond:"rotateWithBall",
    },

    // 15
    strongKick: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 70,
                a: mgr.getVisibleObject(state.action.goal).angle
            }
        },
        next: "sendCommand"
    },

    // 16
    rotateWithBall: {
        exec: (mgr, state) => {
            state.command = {
                n: 'kick',
                v: 3,
                a: 60
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
        condition: (mgr, state) =>{
            return Math.abs(mgr.getVisibleObject(state.action.objName).angle) > ANGLE_BIGGER_THAN
        } ,
        trueCond:"rotateToObject",
        falseCond:"goToObject",
    },

    // 19
    goToObject: {
        exec: (mgr, state) => {
            const objDistance = mgr.getVisibleObject(state.action.objName).distance
            state.command = {
                n: 'dash',
                v: /*bjDistance < TARGET_DIST ? 50 : 100*/ 40,
            }
        },
        next: "sendCommand"
    },

    // 20
    rotateToObject: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: mgr.getVisibleObject(state.action.objName).angle
            }
        },
        next: "sendCommand"
    },

    // 21
    isStartAngleDifferenceBig: {
        condition: (mgr, state) => {
            const leader = mgr.getPlayer(state.leader)
            return Math.abs(leader.angle) > DIFF_ANGLE
        },
        trueCond:"turnToStartAngle",
        falseCond:"isStartDistanceDifferenceBig",
    },



    // 22
    turnToStartAngle: {
        exec: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
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
        condition: (mgr, state) => {
            const distanceToLeader = mgr.getPlayer(state.leader).distance
            return distanceToLeader > state.leader.distance
        },
        trueCond:"fastStepForward",
        falseCond:"isStartDistanceDifferenceSmall",
    },

    // 24
    fastStepForward: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 200
            }
        },
        next: "sendCommand"
    },

    // 25
    isStartDistanceDifferenceSmall: {
        condition: (mgr, state) => {
            const distanceToLeader = mgr.getPlayer(state.leader).distance
            return distanceToLeader < state.leader.distance
        },
        trueCond:"stepForward",
        falseCond:"stepBackward",
    },

    // 26
    stepForward: {
        exec: (mgr, state) => {
            // state.command = {
            // n: 'dash',
            // v: 100
            // }
        },
        // next: "sendCommand"
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

    // 28
    chooseLeader: {
        exec: (mgr, state) => {
            state.leader = mgr.chooseLeader(state.turnedRight)
            console.log('LEADER:', state.leader)
        },
        next: "becomeSlave"
    },

    // 29
    didITurnLeft:{
        condition: (mgr, state) => state.turnedLeft,
        trueCond:"didITurnRight",
        falseCond:"fixLeftTurn",
    },

    // 30
    fixLeftTurn: {
        exec: (mgr, state) => {
            state.turnedLeft = true
        },
        next: "turnLeftInBeginning"
    },

    //31
    turnLeftInBeginning: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: -45
            }
        },
        next: "sendCommand"
    },

    // 32
    didITurnRight:{
        condition: (mgr, state) => state.turnedRight,
        trueCond:"becomeLeader",
        falseCond:"fixRightTurn",
    },

    // 33
    fixRightTurn: {
        exec: (mgr, state) => {
            state.turnedRight = true
        },
        next: "turnRightInBeginning"

    },

    // 34
    turnRightInBeginning: {
        exec: (mgr, state) => {
            state.command = {
                n: 'turn',
                v: 90
            }
        },
        next: "sendCommand"
    },

    //35
    isDistanceSmall: {
        condition: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            return currentLeader.distance < 7
        },
        trueCond: 'turnToLeader',
        falseCond: 'isDistanceBig'
    },

    //36
    isDistanceBig: {
        condition: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            return currentLeader.distance > 10
        },
        trueCond:"isAngleBigOrSmall",
        falseCond:"doYouSeeLeaderWithAngle",
    },

    // 37
    turnToLeader: {
        exec: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            state.command = {
                n: 'turn',
                v: currentLeader.angle
            }
        },
        next: "sendCommand"
    },

    // 38
    isAngleBigOrSmall: {
        condition: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            return Math.abs(currentLeader.angle) > 35 || Math.abs(currentLeader.angle) < 25
        },
        trueCond: 'turnToLeaderWithAngle',
        falseCond: 'fastStep'
    },

    // 39
    doYouSeeLeaderWithAngle: {
        condition: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            return !(Math.abs(currentLeader.angle) > 35 || Math.abs(currentLeader.angle) < 25)
        },
        trueCond: 'stepForwardNormally',
        falseCond: 'turnToLeaderWithAngle'
    },

    // 40
    fastStep: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 100
            }
        },
        next: "sendCommand"
    },

    // 41
    turnToLeaderWithAngle: {
        exec: (mgr, state) => {
            const currentLeader = mgr.getPlayer(state.leader)
            state.command = {
                n: 'turn',
                v: currentLeader.angle + 30 * state.turnCoeff
                // v: currentLeader.angle > 0 ? currentLeader.angle - 30 : currentLeader.angle < 0 ?  currentLeader.angle + 30 : 0
            }
        },
        next: "sendCommand"
    },

    // 42
    stepForwardNormally: {
        exec: (mgr, state) => {
            state.command = {
                n: 'dash',
                v: 40
            }
        },
        next: "sendCommand"
    },

    // 43
    doISeeLeader: {
        condition: (mgr, state) => !!mgr.getPlayer(state.leader),
        trueCond: 'isMainTeammateReachedGoal',
        falseCond: 'rotate45'
    },



   sendCommand: {
        exec: (mgr, state) => {
            mgr.sendCommand(state.command)
        }
   }
}

module.exports = DecisionTree