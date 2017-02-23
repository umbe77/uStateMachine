
const mocha = require('mocha')
const assert = require('assert')

const StateMachine = require('../lib/models/state-machine')
const {SUCCESS, ERROR} = require('../lib/utilities/constants')

const {validSchema, notValidSchema} = require('./constants')

describe('StateMachine validation', function(){
    it('should validate schema', function() {
        let validity = StateMachine.validateStateMachine(validSchema)
        assert.equal(validity.status, SUCCESS, "Schema is Valid")
    })
    it('should not validate the schema', function() {
        let validity = StateMachine.validateStateMachine(notValidSchema)
        assert.equal(validity.status, ERROR, `Schema isn't valid due the following errors: ${validity.errors.join(', ')}`)
    })
})

describe('StateMachine Loading', function(){
    it('should StateMachine loaded', function() { 
        let sm = StateMachine.load(validSchema)
        assert.equal(sm.name, "FirstWF", 'Schema Loaded')
        assert.equal(sm.initialState, "PreOrder", 'intial state as expected')
    })
}) 