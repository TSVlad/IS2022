const getCommandFromTree = (tree, env, envHistory, hearedEvents) => {
    let currentNode = tree.root
    while (!!currentNode.next || currentNode.trueCond) {
        if (currentNode.exec) {
            console.log(`Next state is ${currentNode.next}`)
            currentNode.exec(env, envHistory, hearedEvents)
            currentNode = tree[currentNode.next]
        } else if (currentNode.condition) {
            const next = currentNode.condition(env, envHistory, hearedEvents) ? currentNode.trueCond : currentNode.falseCond
            currentNode = tree[next]
            console.log(`Next state is ${next}`)
        } else {
            console.log(`Finish tree`)
            return {
                n: 'turn',
                v: 0
            }
        }
    }
    return currentNode.exec(env, envHistory, hearedEvents)
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

module.exports = {getCommandFromTree, getRandomInt}