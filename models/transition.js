"use strict"

const privateMembers = new WeakMap()

class Transition {
    constructor() {
        privateMembers.set(this, {
            destination: "",
            condition: ""
        })
    }
}

module.exports = Transition