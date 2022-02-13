
/*
const getA = (points) => alpha(points) ** 2 + 1

const getB = (points) => -2 * (alpha(points) * (points[0].coordinates.x - beta(points)) + points[0].coordinates.y)

const getC = (points) => (points[0].coordinates.x - beta(points)) ** 2 + points[0].coordinates.y ** 2 - points[0].distance ** 2

const alpha = (points) => (points[0].coordinates.y - points[1].coordinates.y)/(points[1].coordinates.x - points[0].coordinates.x)

const beta = (points) => (points[1].coordinates.y ** 2 - points[0].coordinates.y ** 2 + points[1].coordinates.x ** 2 - points[0].coordinates.x ** 2 + points[0].distance ** 2 - points[1].distance ** 2)/(2 * (points[1].coordinates.x - points[0].coordinates.x))
*/

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
    fgl: {x: -52.5, y: 0},
    fglb: {x: -52.5, y: 7.01},

    //RIGHT GOALS
    fgrt: {x: -52.5, y: -7.01},
    fgr: {x: -52.5, y: 0},
    fgrb: {x: -52.5, y: 7.01},

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

/*const getCoordinatesBy2Points = (points) => {
    console.log(`Points: ${points.length}`)
    const a = getA(points)
    const b = getB(points)
    const c = getC(points)

    const sqrtY = Math.sqrt(b**2 - 4 * a * c)
    let y = (-b + sqrtY)/(2 * a)
    console.log(`Y1: ${y}`)
    let y2 = (-b - sqrtY)/(2 * a)
    console.log(`Y2: ${y2}`)
    if (isNaN(y) || y < -39 || y > 39) {
        y = y2
    }
    const sqrtX = Math.sqrt(points[0].distance ** 2 - (y - points[0].coordinates.y) ** 2)
    let x = points[0].coordinates.x + sqrtX;
    console.log(`X1: ${x}`)
    let x2 = points[0].coordinates.x - sqrtX;
    console.log(`X2: ${x2}`)
    if (isNaN(x) || x < -57.5 || x > 57.5) {
        x = x2
    }
    return {x, y}
}*/

const alpha1F = (points) => (points[0].y - points[1].y)/(points[1].x - points[0].x)

const alpha2F = (points) => (points[0].y - points[2].y)/(points[2].x - points[0].x)

const beta1F = (points) => (points[1].y ** 2 - points[0].y ** 2 + points[1].x ** 2 - points[0].x ** 2 + points[0].distance ** 2 - points[1].distance ** 2)/(2 * (points[1].x - points[0].x))

const beta2F = (points) => (points[2].y ** 2 - points[0].y ** 2 + points[2].x ** 2 - points[0].x ** 2 + points[0].distance ** 2 - points[2].distance ** 2)/(2 * (points[2].x - points[0].x))

const getCoordinatesBy3Points = (points) => {
    const alpha1 = alpha1F(points)
    const alpha2 = alpha2F(points)
    const beta1 = beta1F(points)
    const beta2 = beta2F(points)

    console.log(points)
    console.log(alpha1)
    console.log(alpha2)
    console.log(beta1)
    console.log(beta2)

    const y = (beta1 - beta2)/(alpha2 - alpha1)
    const x = alpha1 * y + beta1

    return {x,y}
}

module.exports = {
    Flags, getCoordinatesBy3Points
}
