"use strict"

const privateMembers = new WeakMap()

class StateMachine {
    constructor(name) {
        privateMembers.set(this, {
            name: name,
            version: "1.0.0",
            dataSchema: {},
            states: {},
            initial: {}
        })
    }

    get version() {
        return privateMembers.get(this).version
    }

    get name() {
        return privateMembers.get(this).name
    }
}

module.exports = StateMachine