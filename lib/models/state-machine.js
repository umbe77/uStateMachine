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
            version: "0.0.0",
            dataSchema: undefined,
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

    plain() {
        let internalData = privateMembers.get(this)
        return {
            name: internalData.name,
            version: internalData.version,
            dataSchema: internalData.dataSchema,
            states: internalData.states,
            initial: internalData.initial
        }
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
                p.version = sm.version
                callback(undefined, inst)
            }            
            else{
                callback(err, undefined)
            }
        })
    }
}

module.exports = StateMachine