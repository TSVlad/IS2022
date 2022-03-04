const Flags = {
    //TOP LINE
    ftl50: {x: -50, y: -39},
    ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39},
    ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39},
    ft0: {x: 0, y: -39},
    ftr10: {x: 10, y: -39},
    ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39},
    ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39},

    //BOTTOM LINE
    fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39},
    fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39},
    fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39},
    fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39},
    fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39},
    fbr50: {x: 50, y: 39},

    //LEFT LINE
    flt30: {x: -57.5, y: -30},
    flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10},
    fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10},
    flb20: {x: -57.5, y: 20},
    flb30: {x: -57.7, y: 30},

    //RIGHT LINE
    frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20},
    frt10: {x: 57.5, y: -10},
    fr0: {x: 57.5, y: 0},
    frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20},
    frb30: {x: 57.5, y: 30},

    //LEFT GOALS
    fglt: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0},
    fglb: {x: -52.5, y: 7.01},

    //RIGHT GOALS
    fgrt: {x: 52.5, y: -7.01},
    gr: {x: 52.5, y: 0},
    fgrb: {x: 52.5, y: 7.01},

    //CENTER LINE
    fct: {x: 0, y: -34},
    fc: {x: 0, y: 0},
    fcb: {x: 0, y: 34},

    //LEFT PENALTY AREA
    fplt: {x: -36, y: -20.15},
    fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15},

    //RIGHT PENALTY AREA
    fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0},
    fprb: {x: 36, y: 20.15},

    //CORNERS
    flb: {x: -52.5, y: 34},
    flt: {x: -52.5, y: -34},
    frb: {x: 52.5, y: 34},
    frt: {x: 52.5, y: -34}
}

const distance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

const alpha1F = (points) => (points[0].y - points[1].y)/(points[1].x - points[0].x)

const alpha2F = (points) => (points[0].y - points[2].y)/(points[2].x - points[0].x)

const beta1F = (points) => (points[1].y ** 2 - points[0].y ** 2 + points[1].x ** 2 - points[0].x ** 2 + points[0].distance ** 2 - points[1].distance ** 2)/(2 * (points[1].x - points[0].x))

const beta2F = (points) => (points[2].y ** 2 - points[0].y ** 2 + points[2].x ** 2 - points[0].x ** 2 + points[0].distance ** 2 - points[2].distance ** 2)/(2 * (points[2].x - points[0].x))

const getXByY = (y, points) => {
    let sqrtX = Math.sqrt(points[0].distance ** 2 - (y - points[0].y) ** 2)
    if (!sqrtX) {
        // console.log('NAN SQRT X')
        sqrtX = 0
    }
    const x1 = points[0].x + sqrtX;
    const x2 = points[0].x - sqrtX;
    const m1 = Math.abs((x1 - points[2].x) ** 2 + (y - points[2].y) ** 2 - points[2].distance ** 2)
    const m2 = Math.abs((x2 - points[2].x) ** 2 + (y - points[2].y) ** 2 - points[2].distance ** 2)
    // console.log(`x1: ${x1} y2: ${x2} m1: ${m1} m2: ${m2}`)
    if (m2 < m1) {
        return x2
    }
    return x1
}

const solutionForSameX = (points) => {
    // console.log('SAME X')
    const y = (points[1].y ** 2 - points[0].y ** 2 + points[0].distance ** 2 - points[1].distance ** 2)/(2 * (points[1].y - points[0].y))
    const x = getXByY(y, points)
    return {x, y}
}

const getYByX = (x, points) => {
    let sqrtY = Math.sqrt(points[0].distance ** 2 - (x - points[0].x) ** 2)

    if (!sqrtY) {
        // console.log('NAN SQRT Y')
        sqrtY = 0
    }

    const y1 = points[0].y + sqrtY;
    const y2 = points[0].y - sqrtY;
    const m1 = Math.abs((x - points[2].x) ** 2 + (y1 - points[2].y) ** 2 - points[2].distance ** 2)
    const m2 = Math.abs((x - points[2].x) ** 2 + (y2 - points[2].y) ** 2 - points[2].distance ** 2)
    // console.log(`y1: ${y1} y2: ${y2} m1: ${m1} m2: ${m2}`)
    if (m2 < m1) {
        return y2
    }
    return y1
}

const solutionForSameY = (points) => {
    // console.log('SAME Y')
    const x = (points[1].x ** 2 - points[0].x ** 2 + points[0].distance ** 2 - points[1].distance ** 2)/(2 * (points[1].x - points[0].x))
    const y = getYByX(x, points)
    return {x, y}
}

const getPointWhereYNotEquals = (y, points, from) => {
    for (let i = from; i < points.length; i++) {
        if (points[i].y !== y) {
            return points[i]
        }
    }
    // console.log('FEW POINTS')
}

const getPointWhereXNotEquals = (x, points, from) => {
    for (let i = from; i < points.length; i++) {
        if (points[i].x !== x) {
            return points[i]
        }
    }
}

const getCoordinatesBy3Points = (points) => {
    // console.log(points)
    if (points[0].x === points[1].x) {
        return solutionForSameX([points[0], points[1], getPointWhereXNotEquals(points[0].x, points, 2)])
    }
    if (points[0].x === points[2].x) {
        return solutionForSameX([points[0], points[2], points[1]])
    }

    if (points[0].y === points[1].y) {
        return solutionForSameY([points[0], points[1], getPointWhereYNotEquals(points[0].y, points, 2)])
    }
    if (points[0].y === points[2].y) {
        return solutionForSameY([points[0], points[2], points[1]])
    }

    const alpha1 = alpha1F(points)
    const alpha2 = alpha2F(points)
    const beta1 = beta1F(points)
    const beta2 = beta2F(points)

    // console.log(alpha1, beta1, alpha2, beta2)

    const y = (beta1 - beta2)/(alpha2 - alpha1)
    const x = alpha1 * y + beta1

    return {x,y}
}

const getDistanceToObject = (d1, alpha1, dA, alphaA) => {
    return Math.sqrt(d1 ** 2 + dA ** 2 - 2 * d1 * dA * Math.cos(Math.abs(degToRad(alpha1) - degToRad(alphaA))))
}

const degToRad = (deg) => {
    return (Math.PI * deg) / 180;
}

const getObjectCoordinates = (coordinates, points, object) => {

    const pointsForGettingCoordinates= [];
    pointsForGettingCoordinates.push({
        ...coordinates,
        distance: object.distance
    })

    pointsForGettingCoordinates.push({
        x: points[0].x,
        y: points[0].y,
        distance: getDistanceToObject(points[0].distance, points[0].angle, object.distance, object.angle)
    })

    let newPoint;

    if (coordinates.x === points[0].x && coordinates.x === points[1].x) {
        newPoint = getPointWhereXNotEquals(coordinates.x, points, 2)

    } else if (coordinates.y === points[0].y && coordinates.y === points[1].y) {
        newPoint = getPointWhereYNotEquals(coordinates.y, points, 2)

    } else {
        newPoint = points[1]
    }

    pointsForGettingCoordinates.push({
        x: newPoint.x,
        y: newPoint.y,
        distance: getDistanceToObject(newPoint.distance, newPoint.angle, object.distance, object.angle)
    })

    return getCoordinatesBy3Points(pointsForGettingCoordinates)

}

const checkXLine = (flags) => {
    if (flags[0].x === flags[1].x && flags[0].x === flags[2].x) {
        let foundAnother = false;
        for (let i = 3; i < flags.length; i++) {
            foundAnother = flags[i].x !== flags[0].x
            if (foundAnother) {
                break
            }
        }
        return foundAnother
    } else {
        return true
    }
}

const checkYLine = (flags) => {
    if (flags[0].y === flags[1].y && flags[0].y === flags[2].y) {
        let foundAnother = false;
        for (let i = 3; i < flags.length; i++) {
            foundAnother = flags[i].y !== flags[0].y
            if (foundAnother) {
                break
            }
        }
        return foundAnother
    } else {
        return true
    }
}

const getAgentCoordinates = (objects) => {
    if (objects.flags.keys().length >= 3) {
        if (!checkXLine(objects.flags) || !checkYLine(objects.flags.values())) {
            return null
        }
        return getCoordinatesBy3Points(Object.values(objects.flags).sort((f1, f2) => f1.distance - f2.distance))
    } else {
        return null;
    }
}

const getDistanceBetweenObjects = (obj1, obj2) => Math.sqrt(obj1.distance**2 + obj2.distance**2 - 2 * obj1.distance * obj2.distance * Math.cos(degToRad(Math.abs(obj1.angle - obj2.angle))))

module.exports = {
    Flags, getAgentCoordinates, getObjectCoordinates, checkYLine, checkXLine, getDistanceBetweenObjects, findCrossWithGoal
}
