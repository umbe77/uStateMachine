"use strict"

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
            initial:""
        })
    }

    get version() {
        return privateMembers.get(this).version
    }

    get name() {
        return privateMembers.get(this).name
    }

    get initialState() {
        return privateMembers.get(this).initial
    }

    static load(sm) {
        
        v.addSchema(sSchema, '/state')
        v.addSchema(tSchema, '/transition')
        
        let isValid = v.validate(sm, smSchema)

        console.log(isValid)

        let inst = new StateMachine(sm.name)
        
        return inst
    }
}

module.exports = StateMachine