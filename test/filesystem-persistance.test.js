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

    it('should load StateMachine from filesystem', (done) => {
        let sm = StateMachine.load(expectedSm)
        filesystem.loadStateMachines((smList) => {
            assert.equal(smList.length, 1, "got sm from filesystem")
            assert.deepEqual(smList[0], sm, "StateMachine is right")
            done()
        })
    })
})