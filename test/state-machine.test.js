
const mocha = require('mocha')
const assert = require('assert')

const semver = require('semver')

const StateMachine = require('../lib/models/state-machine')

const {validSchema, notValidSchema} = require('./constants')

describe('StateMachine validation', () => {
    it('should validate schema', (done) => {
        StateMachine.validateStateMachine(validSchema, (err, isValid) => {
            assert.ok(isValid, "Schema is valid")
            done()
        })
    })
    it('should not validate the schema', (done) => {
        StateMachine.validateStateMachine(notValidSchema, (err, isValid) => {
            assert.equal(isValid, false, `Schema isn't valid due the following errors: ${err.join(', ')}`)
            done()
        })
    })
})

describe('StateMachine Loading', () => {
    it('should StateMachine loaded', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            assert.equal(sm.name, "FirstWF", 'Schema Loaded')
            
            assert.ok(semver.eq("1.0.0", sm.version), "Schema Version is ok")

            assert.equal(sm.initialState, "PreOrder", 'intial state as expected')
            done()
        })
    })
}) 