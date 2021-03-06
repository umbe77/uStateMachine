const mocha = require('mocha')

const assert = require('assert')

const WorkflowEngine = require('../lib/engine/engine')
const StateMachine = require('../lib/models/state-machine')
const {
    validSchema,
    validSchema_wrongstate,
    validSchema_dontchecktransition,
    a_onenter,
    a_onexit,
    a_onexit_timeout
} = require('./constants')
const CantMoveError = require('../lib/utilities/CantMoveError')
const CantContinueError = require('../lib/utilities/CantContinueError')

describe('WF Engine', () => {
    it('Instace should create in its initial state', (done) => {
        const sm = StateMachine.fromPlain(validSchema)
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

    it('Instance move to new state', (done) => {
        const stateMachine = StateMachine.fromPlain(validSchema)
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
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.ifError(err)
                assert.equal(instance.instanceId, inst.instanceId)
                assert.equal(instance.data.firstName, "Umbe")
                assert.equal(oldInstance.data.firstName, "Roberto")
                done()
            })
        })
    })

    it('Instance move to wrong new state', (done) => {
        const stateMachine = StateMachine.fromPlain(validSchema_wrongstate)
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
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.ok(err instanceof CantMoveError)
                done()
            })
        })
    })

    it('Instance move to fail check transistion', (done) => {
        const stateMachine = StateMachine.fromPlain(validSchema_dontchecktransition)
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
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.ok(err instanceof CantMoveError)
                done()
            })
        })
    })

    it('should Instance move to pass check transistion', (done) => {
        const stateMachine = StateMachine.fromPlain(validSchema_dontchecktransition)
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
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.ifError(err)
                assert.equal(instance.instanceId, inst.instanceId)
                assert.equal(instance.data.firstName, "Umbe")
                assert.equal(oldInstance.data.firstName, "Roberto")
                done()
            })
        })
    })

    it('should instance enrich data with onEnter Event', (done) => {
        const stateMachine = StateMachine.fromPlain(a_onenter)
        WorkflowEngine.createInstance(stateMachine, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, (err, inst) => {
            assert.ifError(err)
            assert.equal(inst.data.firstName, "Roberto")
            assert.equal(inst.data.lastName, "Ughi")
            assert.equal(inst.data.city, "Livorno")
            done()
        })
    })

    it('should instance can\'t go to new state', (done) => {
        const stateMachine = StateMachine.fromPlain(a_onenter)
        WorkflowEngine.createInstance(stateMachine, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, (err, inst) => {
            const transition = "InOrder"
            const data = {
                city: "Milano"
            }
            WorkflowEngine.execute({
                instance: inst,
                stateMachine,
                transition,
                data
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.ok(err instanceof CantContinueError)
                assert.equal(instance.instanceId, inst.instanceId)
                assert.equal(instance.data.firstName, "Roberto")
                assert.equal(oldInstance.data.firstName, "Roberto")
                assert.equal(instance.data.city, "Livorno")
                done()
            })
        })
    })

    it('should instance update its data during onExit event', (done) => {
        const stateMachine = StateMachine.fromPlain(a_onexit)
        WorkflowEngine.createInstance(stateMachine, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, (err, inst) => {
            const transition = "InOrder"
            const data = {}
            WorkflowEngine.execute({
                instance: inst,
                stateMachine,
                transition,
                data
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.equal(instance.instanceId, inst.instanceId)
                assert.equal(instance.data.state, "Toscana")
                done()
            })
        })
    })

    it('should instance update its data during onExit event with timeout', (done) => {
        const stateMachine = StateMachine.fromPlain(a_onexit_timeout)
        WorkflowEngine.createInstance(stateMachine, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, (err, inst) => {
            const transition = "InOrder"
            const data = {}
            WorkflowEngine.execute({
                instance: inst,
                stateMachine,
                transition,
                data
            }, (err, {
                instance,
                oldInstance
            }) => {
                assert.equal(instance.instanceId, inst.instanceId)
                assert.equal(instance.data.state, "Toscana")
                done()
            })
        })
    })

})