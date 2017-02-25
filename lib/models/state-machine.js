const Validator = require('jsonschema').Validator
const v = new Validator()
const smSchema = require('../Schema/state-machine.json')
const sSchema = require('../Schema/state.json')
const tSchema = require('../Schema/transition.json')
const privateMembers = new WeakMap()

class StateMachine {
    constructor(name) {
        privateMembers.set(this, {
            name: name,
            version: "1.0.0",
            dataSchema: {},
            states: {},
            initial: ""
        })
    }

    get version() {
        return privateMembers.get(this).version
    }

    get name() {
        return privateMembers.get(this).name
    }

    get states() {
        return privateMembers.get(this).states
    }

    get initialState() {
        return privateMembers.get(this).initial
    }

    static validateStateMachine(sm, callback) {
        process.nextTick(() => {
            v.addSchema(sSchema, '/state')
            v.addSchema(tSchema, '/transition')

            let isValid = v.validate(sm, smSchema)

            if (isValid.valid) {
                callback(undefined, true)
            }
            else {
                callback(isValid.errors, false)
            }
        })
    }

    static load(sm, callback) {

        StateMachine.validateStateMachine(sm, (err, isValid) => {
            if (isValid) {
                let inst = new StateMachine(sm.name)
                let p = privateMembers.get(inst)
                p.initial = sm.initial
                p.states = sm.states
                callback(undefined, inst)
            }            
            else{
                callback(err, undefined)
            }
        })
    }
}

module.exports = StateMachine