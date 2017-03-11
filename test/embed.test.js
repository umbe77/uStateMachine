const mocha = require('mocha')
const assert = require('assert')

const engine = require('nosql')

const {
    validSchema,
    an_instance
} = require('./constants')
const StateMachine = require('../lib/models/state-machine')
// const WorkflowInstance = require('../lib/models/workflow-instance')
// const status = require('../lib/models/workflow-instance-constants')

describe('embed persistance provider', () => {
    let embed = undefined
    let db = undefined
    before((done) => {
        global.appRootDir = require('path').resolve(__dirname)
        embed = require('./providers/embed')({
            "options": {
                "path": "~/persistance/statemachines.nosql"
            }
        })
        db = engine.load(`${__dirname}/persistance/statemachines.nosql`)
        db.insert(Object.assign({}, validSchema, {
            kind: "StateMachines"
        })).callback((err) => {
            db.insert(Object.assign({}, an_instance, {
                kind: "Instances"
            })).callback((err) => {
                done()
            })
        })
    })
    after((done) => {
        global.appRootDir = undefined
        db = engine.load(`${__dirname}/persistance/statemachines.nosql`)
        db.remove().make((builder) => {
            builder.callback(() => {
                done()
            })
        })
    })

    it('should load statemachines', (done) => {
        const _sm = StateMachine.fromPlain(validSchema)
        embed.loadStateMachines((err, _smlist) => {
            assert.equal(_smlist.length, 1, "got sm from embed")
            assert.deepEqual(_smlist[0], _sm, "StateMachine is right")
            done()
        })
    })

    it('should load StateMachine firstwf with version 1.0.0 from embed', (done) => {
        const _sm = StateMachine.fromPlain(validSchema)
        embed.loadStateMachine('FirstWF', '1.0.0', (err, sm) => {
            assert.deepEqual(sm, _sm, "StateMachine loaded from disk")
            done()
        })
    })

    it('should persist StateMachine smFirst_2 on embed', (done) => {
        const sm = StateMachine.fromPlain(require('./constants').smFirst_2)
        embed.saveStateMachine(sm, (err) => {
            assert.equal(!!err, false, "StatemMAchine Saved")
            done()
        })
    })

    it('should load instance from embed', (done) => {
        embed.loadInstance("27e8f2bf-e9a4-4503-b0a0-5a5c67259fc2", (err, instance) => {
            assert.deepEqual(instance.plain(), an_instance)
            done()
        })
    })

})