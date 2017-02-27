
const mocha = require('mocha')

const assert = require('assert')

const WorkflowEngine = require('../lib/engine/engine')
const StateMachine = require('../lib/models/state-machine')
const {validSchema} = require('./constants')

describe('WF Engine', () => {
    it('Instace should create in its initial state', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            let result = WorkflowEngine.createInstance(sm, {
                firstName: "Roberto",
                lastName: "Ughi"
            }, (err, instance) => {
                assert.ifError(err, "No Error in instance creation")

                assert.equal(instance.currentState, "PreOrder", 'Initial State is PreOrder')
                assert.deepEqual(instance.data, {
                    firstName: "Roberto",
                    lastName: "Ughi"
                }, 'instance data is as excpeted')
                done()
            })

        })
    })
})