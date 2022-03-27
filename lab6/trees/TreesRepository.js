const TreesRepository = {
    teammatesSortedByX: [],
    enemiesSortedByX: [],
    currentAngle: 0,

    addAngle: angle => {
        const newAngle = this.currentAngle + angle
        if (newAngle > 180){
            this.currentAngle = -360  + newAngle
        } else if (newAngle < -180){
            this.currentAngle = 360 + newAngle
        } else {
            this.currentAngle = newAngle
        }
    }
}

export default TreesRepository