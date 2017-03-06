const mocha = require('mocha')
const assert = require('assert')

const semver = require('semver')

const StateMachine = require('../lib/models/state-machine')
const ValidationError = require('../lib/utilities/ValidationError')

const {
    validSchema,
    notValidSchema
} = require('./constants')

describe('StateMachine validation', () => {
    it('should validate schema', () => {
        const isValid = StateMachine.validateStateMachine(validSchema)
        assert.ok(isValid, "Schema is valid")
    })

    it('should not validate the schema', () => {
        try {
            StateMachine.validateStateMachine(notValidSchema)
        } catch (e) {
            assert.ok(e instanceof ValidationError, `Schema isn't valid due the following errors: ${e.errors.join(', ')}`)

        }
    })
})

describe('StateMachine Loading', () => {
    it('should StateMachine loaded', () => {
        const sm = StateMachine.fromPlain(validSchema)
        assert.equal(sm.name, "FirstWF", 'Schema Loaded')

        assert.ok(semver.eq("1.0.0", sm.version), "Schema Version is ok")

        assert.equal(sm.initialState, "PreOrder", 'intial state as expected')

    })
})