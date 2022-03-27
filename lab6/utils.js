const getCommandFromTree = (tree, env, envHistory, hearedEvents) => {
    let currentNode = tree.root
    while (!!currentNode.next || currentNode.trueCond) {
        if (currentNode.exec) {
            currentNode.exec(env, envHistory, hearedEvents)
            console.log(currentNode.next)
            currentNode = this.dt[currentNode.next]
        } else if (currentNode.condition) {
            const next = currentNode.condition(this, this.dt.state) ? currentNode.trueCond : currentNode.falseCond
            currentNode = this.dt[next]
            console.log(next)
        } else {
            return {
                n: 'turn',
                v: 0
            }
        }
    }
    return currentNode.exec(env, envHistory, hearedEvents)
}

module.exports = getCommandFromTree