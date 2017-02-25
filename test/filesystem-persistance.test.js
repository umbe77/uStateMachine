const mocha = require('mocha')
const assert = require('assert')

const expectedSm = require('./persistance/statemachines/firstwf.json')

const StateMachine = require('../lib/models/state-machine')

describe('Filesystem persistance provider', function () {
    let filesystem = undefined
    before(() => {
        global.appRootDir = require('path').resolve('./')
        filesystem = require('../lib/persistance/builtin/filesystem')
    })

    after(() => {
        global.appRootDir = undefined
    })

    it('should load StateMachines from filesystem', (done) => {
        StateMachine.load(expectedSm, (err, _sm) => {
            filesystem.loadStateMachines((err, smList) => {
                assert.equal(smList.length, 1, "got sm from filesystem")
                assert.deepEqual(smList[0], _sm, "StateMachine is right")
                done()
            })
        })
    })

    it('should load StateMachine firstwf with version 1.0.0 from filesystem', (done) => {
        StateMachine.load(expectedSm, (err, _sm) => {
            filesystem.loadStateMachine('FirstWf', '1.0.0', (err, sm) => {
                assert.deepEqual(sm, _sm, "StateMachine loaded from disk")
                done()
            })
        })
    })
})