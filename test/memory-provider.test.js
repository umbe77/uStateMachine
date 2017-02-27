const mocha = require('mocha')
const assert = require('assert')

const memory = require('../lib/cache/builtin/memory')
const {validSchema} = require('./constants')

const StateMachine = require('../lib/models/state-machine')

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
    
})