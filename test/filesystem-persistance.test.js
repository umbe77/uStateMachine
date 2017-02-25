const mocha = require('mocha')
const assert = require('assert')

const {initSettings, resetDef} = require('../lib/utilities/settings')
const defaultSettings = require('../lib/utilities/default-settings.json')
const expectedSm = require('./persistance/statemachines/firstwf_1.0.0.json')
const StateMachine = require('../lib/models/state-machine')

describe('Filesystem persistance provider', function () {
    let filesystem = undefined
    before(() => {
        global.appRootDir = require('path').resolve('./')
        filesystem = require('../lib/persistance/builtin/filesystem')
        initSettings(defaultSettings, {
            persistance: {
                "provider": "filesystem",
                "options": {
                    "stateMachines": "~/test/persistance/statemachines",
                    "instances": "~/test/persistance/instances"
                }
            }
        })
    })

    after(() => {
        global.appRootDir = undefined
        resetDef()
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

    it('should persist StateMachine smFirst_2 on filesystem', (done) => {
        StateMachine.load(require('./constants').smFirst_2, (err, sm) => {
            filesystem.saveStateMachine(sm, (err) => {
                assert.equal(!!err, false, "StatemMAchine Saved")
                done()
            })
        })
    })
})