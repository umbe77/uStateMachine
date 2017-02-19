"use strict"

const privateMembers = new WeakMap()

class StateMachine {
    constructor(name) {
        privateMembers.set(this, {
            name: name,
            data: {},
            states: {},
            current: {},
            initial: {}
        })
    }
}

module.exports = StateMachine