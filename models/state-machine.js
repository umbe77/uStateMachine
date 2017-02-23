"use strict"

const Validator = require('jsonschema').Validator
const v = new Validator()
const smSchema = require('../Schema/state-machine.json')
const sSchema = require('../Schema/state.json')
const tSchema = require('../Schema/transition.json')
const privateMembers = new WeakMap()

const {ERROR, SUCCESS} = require('../utilities/constants')

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

    static validateStateMachine(sm) {
        v.addSchema(sSchema, '/state')
        v.addSchema(tSchema, '/transition')

        let isValid = v.validate(sm, smSchema)

        if (isValid.valid) {
            return {
                status: SUCCESS
            }
        }

        return {
            status: ERROR,
            errors: isValid.errors
        }

    }

    static load(sm) {

        let isValid = StateMachine.validateStateMachine(sm);

        let inst = null
        if (isValid.status === SUCCESS) {
            inst = new StateMachine(sm.name)
            let p = privateMembers.get(inst)
            p.initial = sm.initial
            p.states = sm.states
        }
        else {
            //TODO: throw log validation Errors
        }
        return inst
    }
}

module.exports = StateMachine