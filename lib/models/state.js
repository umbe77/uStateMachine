const privateMembers = new WeakMap()

class State {
    constructor(name) {
        privateMembers.set(this, {
            name: name, 
            transitions: {}
        })
    }

    get name() {
        return privateMembers.get(this).name
    }

    get transitions() {
        return privateMembers.get(this).transitions
    }

    onEnter(data) {

    }

    onExit(data) {

    }
}

module.exports = State