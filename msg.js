const {Flags} = require("./field");
module.exports = {
    parseMsg(msg) {
        if (msg.endsWith('\u0000')) {
            msg = msg.substring(0, msg.length - '\u0000'.length)
        }
        let array = msg.match(/(\(|[-\d\.]+|[\\\"\w]+|\))/g)
        let res = {
            msg,
            p: []
        }
        this.parse(array, {idx: 0}, res)
        this.makeCmd(res)
        return res
    },

    parse(array, index, res) {
        if (array[index.idx] !== '(') {
            return
        }
        index.idx++
        this.parseInner(array, index, res)
    },

    parseInner(array, index, res) {
        while (array[index.idx] !== ')') {
            if (array[index.idx] === '(') {
                let r = {p: []}
                this.parse(array, index, r)
                res.p.push(r)
            } else {
                let num = parseFloat(array[index.idx])
                res.p.push(isNaN(num) ? array[index.idx] : num)
                index.idx++
            }
        }
        index.idx++
    },

    makeCmd(res) {
        if (res.p && res.p.length > 0) {
            res.cmd = res.p.shift()
            for (let value of res.p) {
                this.makeCmd(value)
            }
        }
    },

    parseVisibleData(data) {
        const result = {
            flags: [],
            players: [],
            ball: null
        }

        for (let i = 1; i < data.p.length; i++) {
            switch(data.p[i].cmd.p[0]) {
                case 'f':
                case 'g':
                    let flagName = ''
                    for (const letter of data.p[i].cmd.p) {
                        flagName += letter
                    }

                    const potentialCoordinates = Flags[flagName]
                    if (!potentialCoordinates) {
                        continue
                    }
                    result.flags[flagName] = {
                        ...potentialCoordinates,
                        distance: data.p[i].p[0],
                        angle: data.p[i].p[1],
                        name: flagName
                    }
                    break
                case 'p':
                    result.players.push({
                        distance: data.p[i].p[0],
                        angle: data.p[i].p[1]
                    })
                    break
                case 'b':
                    result.ball = {
                        distance: data.p[i].p[0],
                        angle: data.p[i].p[1]
                    }
                    break
                default:
                    // console.log(`UNDEFINED: ${data.p[i].cmd.p[0]} in ${data.p[i].cmd.p}`)
            }
        }
        return result
    }
}