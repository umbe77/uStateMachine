const crypto = require('crypto')
const Validator = require('jsonschema').Validator
const v = new Validator()
const smSchema = require('../Schema/state-machine.json')
const sSchema = require('../Schema/state.json')
const tSchema = require('../Schema/transition.json')
const ValidationError = require('../utilities/ValidationError')
const privateMembers = new WeakMap()

//TODO define a system to create an hash on Schema in order to understaend if tow schema is compatible in same version

class StateMachine {
    constructor(name) {
        privateMembers.set(this, {
            name: name,
            version: "0.0.0",
            dataSchema: undefined,
            states: {},
            initial: "",
            hash: ""
        })
    }

    get version() {
        return privateMembers.get(this).version
    }

    get name() {
        return privateMembers.get(this).name
    }

    get hash() {
        //TODO: Calculate Hash based on states and transitions
        return privateMembers.get(this).hash
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
            initial: internalData.initial,
            hash: internalData.hash
        }
    }

    static validateStateMachine(sm) {
        v.addSchema(sSchema, '/state')
        v.addSchema(tSchema, '/transition')

        let isValid = v.validate(sm, smSchema)

        if (isValid.valid) {
            return true
        }
        throw new ValidationError(isValid.errors)
    }

    static fromPlain(sm) {

        const isValid = StateMachine.validateStateMachine(sm)
        if (isValid) {
            let inst = new StateMachine(sm.name)
            let p = privateMembers.get(inst)
            p.initial = sm.initial
            p.states = sm.states
            p.version = sm.version
            p.hash = sm.hash
            return inst
        }
        return undefined
    }
}

module.exports = StateMachine