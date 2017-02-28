
const mocha = require('mocha')

const assert = require('assert')

const WorkflowEngine = require('../lib/engine/engine')
const StateMachine = require('../lib/models/state-machine')
const {validSchema, validSchema_wrongstate, validSchema_dontchecktransition} = require('./constants')
const CantMoveError = require('../lib/utilities/CantMoveError')

describe('WF Engine', () => {
    it('Instace should create in its initial state', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            WorkflowEngine.createInstance(sm, {
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

    it('Instance move to new state', (done) => {
        StateMachine.load(validSchema, (err, stateMachine) => {
            WorkflowEngine.createInstance(stateMachine, {
                firstName: "Roberto",
                lastName: "Ughi"
            }, (err, inst) => {
                const transition = "InOrder"
                const data = {
                    firstName: "Umbe"
                }
                WorkflowEngine.execute({
                    instance: inst,
                    stateMachine,
                    transition,
                    data
                }, (err, {instance, oldInstance}) => {
                    assert.ifError(err)
                    assert.equal(instance.instanceId, inst.instanceId)
                    assert.equal(instance.data.firstName, "Umbe")
                    assert.equal(oldInstance.data.firstName, "Roberto")
                    done()
                })
            })
        })
    })

    it('Instance move to wrong new state', (done) => {
        StateMachine.load(validSchema_wrongstate, (err, stateMachine) => {
            WorkflowEngine.createInstance(stateMachine, {
                firstName: "Roberto",
                lastName: "Ughi"
            }, (err, inst) => {
                const transition = "OrderSent"
                const data = {
                    firstName: "Umbe"
                }
                WorkflowEngine.execute({
                    instance: inst,
                    stateMachine,
                    transition,
                    data
                }, (err, {instance, oldInstance}) => {
                    assert.ok(err instanceof CantMoveError)
                    done()
                })
            })
        })
    })

    it('Instance move to fail check transistion', (done) => {
        StateMachine.load(validSchema_dontchecktransition, (err, stateMachine) => {
            WorkflowEngine.createInstance(stateMachine, {
                firstName: "Roberto",
                lastName: "Ughi"
            }, (err, inst) => {
                const transition = "InOrder"
                const data = {
                    firstName: "Roberto"
                }
                WorkflowEngine.execute({
                    instance: inst,
                    stateMachine,
                    transition,
                    data
                }, (err, {instance, oldInstance}) => {
                    assert.ok(err instanceof CantMoveError)
                    done()
                })
            })
        })
    })

    it('Instance move to pass check transistion', (done) => {
        StateMachine.load(validSchema_dontchecktransition, (err, stateMachine) => {
            WorkflowEngine.createInstance(stateMachine, {
                firstName: "Roberto",
                lastName: "Ughi"
            }, (err, inst) => {
                const transition = "InOrder"
                const data = {
                    firstName: "Umbe"
                }
                WorkflowEngine.execute({
                    instance: inst,
                    stateMachine,
                    transition,
                    data
                }, (err, {instance, oldInstance}) => {
                    assert.ifError(err)
                    assert.equal(instance.instanceId, inst.instanceId)
                    assert.equal(instance.data.firstName, "Umbe")
                    assert.equal(oldInstance.data.firstName, "Roberto")
                    done()
                })
            })
        })
    })

})