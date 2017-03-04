const mocha = require('mocha')
const assert = require('assert')

const uuid = require('uuid').v4

const memory = require('../lib/cache/builtin/memory')({timeout: 300000})
const {
    validSchema,
    an_instance
} = require('./constants')


const StateMachine = require('../lib/models/state-machine')
const WorkflowInstance = require('../lib/models/workflow-instance')

describe('Memory cache provider', () => {

    it('should add StateMachine in Memory cache', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            memory.pushStateMachine(sm, () => {
                memory.getStateMachine(sm.name, sm.version, (err, res) => {
                    assert.deepEqual(res, sm, "Object from cache")
                    done()
                })
            })
        })
    })
    it('should get error when get a StateMachine not in cache', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            memory.pushStateMachine(sm, () => {
                memory.getStateMachine(sm.name, "1.1.0", (err, res) => {
                    assert.equal(err.message, `Cannot find StateMachine: ${sm.name} version: 1.1.0`)
                    assert.equal(res, undefined, "Object isn't in cache")
                    done()
                })
            })
        })
    })
    it('should remove StateMachine from cache', (done) => {
        StateMachine.load(validSchema, (err, sm) => {
            memory.pushStateMachine(sm, () => {
                memory.removeStateMachine(sm.name, sm.version, () => {
                    memory.getStateMachine(sm.name, sm.version, (errGet, _sm) => {
                        assert.equal(errGet.message, `Cannot find StateMachine: ${_sm.name} version: ${_sm.version}`)
                    })
                    done()
                })
            })
        })
    })

    it('should add Instance in Memory cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        memory.pushInstance(inst, (err, instance) => {
            assert.ifError(err)
            memory.getInstance(instance.instanceId, (errGet, instanceGot) => {
                assert.ifError(errGet)
                assert.deepEqual(inst, instanceGot)
                done()
            })
        })
    })

    it('should remove Instance from Memory cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        memory.pushInstance(inst, (err, instance) => {
            assert.ifError(err)
            memory.removeInstance(instance.instanceId, (errRemove) => {
                assert.ifError(errRemove)
                memory.getInstance(instance.instanceId, (errGet, instanceGot) => {
                    assert.ifError(errGet)
                    assert.equal(instanceGot, undefined)
                    done()
                })
            })
        })
    })

    it ('should Instance removed after period of time', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        memory.timeout = 100
        memory.pushInstance(inst, (err, instance) => {
            assert.ifError(err)
            setTimeout(() => {
                memory.getInstance(instance.instanceId, (errGet, instanceGot) => {
                    assert.ifError(errGet)
                    assert.equal(instanceGot, undefined)
                    done()
                })
            }, 130)
        })
    })

    it ('should Instance renew timeout', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        memory.timeout = 180
        memory.pushInstance(inst, (err, instance) => {
            assert.ifError(err)
            setTimeout(() => {
                memory.getInstance(instance.instanceId, (errGet, instanceGot) => {
                    assert.ifError(errGet)
                    assert.deepEqual(inst, instanceGot)
                    done()
                })
            }, 130)
        })
    })

})