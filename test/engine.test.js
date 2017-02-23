
const mocha = require('mocha')

const assert = require('assert')

const WorkflowEngine = require('../lib/engine/engine')
const StateMachine = require('../lib/models/state-machine')
const {validSchema} = require('./constants')

describe('WF Engine', function(){
    it('Instace should create in its initial state', function(){
        let sm = StateMachine.load(validSchema)
        let result = WorkflowEngine.createInstance(sm, {
            firstName: "Roberto",
            lastName: "Ughi"
        })

        assert.equal(result.code, 1, 'instance created succesfully')

        let instance = result.instance

        assert.equal(instance.currentState, "PreOrder", 'Initial State is PreOrder')
        assert.deepEqual(instance.data, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, 'instance data is as excpeted' )
    })
})