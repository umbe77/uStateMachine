const mocha = require('mocha')
const assert = require('assert')

const memory = require('../lib/cache/builtin/memory')
const {validSchema} = require('./constants')

const StateMachine = require('../lib/models/state-machine')

describe('Memory cache provider', function() {
    it('should add StateMachine in Memory cache', (done) => {
        let sm = StateMachine.load(validSchema)
        memory.pushStateMachine(sm, () => {
            memory.getStateMachine(sm.name, (err, res) => {
                assert.deepEqual(res, sm, "Object from cache")
                done()
            })
        })
    })
})