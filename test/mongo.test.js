const mocha = require('mocha')
const assert = require('assert')

const uuid = require('uuid').v4
const MongoClient = require('mongodb')

const {
    validSchema,
    smGroup,
    smGroup2,
    an_instance
} = require('./constants')
const StateMachine = require('../lib/models/state-machine')
const WorkflowInstance = require('../lib/models/workflow-instance')

const mongo = require('../lib/persistance/builtin/mongo')({
    options: {
        server: "localhost",
        port: "27017",
        database: "uStateMachineTestdb"
    }
}, true)

describe('mongodb persistance provider', () => {
    let database = undefined
    before((done) => {
        MongoClient.connect("mongodb://localhost:27017/uStateMachineTestdb", (err, db) => {
            database = db
            Promise.all([
                db.collection("StateMachines").insertOne(Object.assign({}, validSchema)),
                db.collection("StateMachineGroups").insertOne(Object.assign({}, smGroup)),
                db.collection("StateMachineGroups").insertOne(Object.assign({}, smGroup2)),
                db.collection("Instances").insertOne(Object.assign({}, an_instance))
            ]).then(() => {
                done()
            })
        })
    })
    after((done) => {
        database.dropDatabase(() => {
            done()
        })
    })

    it('should load statemachinegroups', (done) => {
        mongo.loadStateMachineGroups((err, docs) => {
            assert.ifError(err)
            assert.equal(docs.length, 2)
            done()
        })
    })

    it('should save statemachinegroup', (done) => {
        mongo.saveStateMachineGroup({
            name: "FirstWf",
            version: "1.0.0"
        }, (err) => {
            assert.ifError(err)
            mongo.loadStateMachineGroups((err, docs) => {
                assert.ifError(err)
                assert.equal(docs.length, 3)
                done()
            })
        })
    })

    it('should load statemachines', (done) => {
        const _sm = StateMachine.fromPlain(validSchema)
        mongo.loadStateMachines((err, _smlist) => {
            assert.equal(_smlist.length, 1, "got sm from mongo")
            assert.deepEqual(_smlist[0], _sm, "StateMachine is right")
            done()
        })
    })

    it('should load StateMachine firstwf with version 1.0.0 from mongo', (done) => {
        const _sm = StateMachine.fromPlain(validSchema)
        mongo.loadStateMachine('FirstWF', '1.0.0', (err, sm) => {
            assert.deepEqual(sm, _sm, "StateMachine loaded from disk")
            done()
        })
    })

    it('should persist StateMachine smFirst_2 on mongo', (done) => {
        const _sm = StateMachine.fromPlain(require('./constants').smFirst_2)
        mongo.saveStateMachine(_sm, (err) => {
            assert.equal(!!err, false, "StatemMAchine Saved")
            done()
        })
    })

    it('should load instance from mongo', (done) => {
        mongo.loadInstance("27e8f2bf-e9a4-4503-b0a0-5a5c67259fc2", (err, instance) => {
            assert.deepEqual(instance.plain(), an_instance)
            done()
        })
    })

    it('should save an instance', (done) => {
        let inst2 = Object.assign({}, an_instance)
        inst2.instanceId = uuid()
        mongo.saveInstance(WorkflowInstance.fromPlain(inst2), (err) => {
            assert.ifError(err)
            done()
        })
    })
})