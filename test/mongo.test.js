const mocha = require('mocha')
const assert = require('assert')

const MongoClient = require('mongodb')

const {
    validSchema,
    an_instance
} = require('./constants')
const StateMachine = require('../lib/models/state-machine')

const mongo = require('../lib/persistance/builtin/mongo')({
    options: {
        server: "localhost",
        port: "27017",
        database: "uStateMachine"
    }
})

describe('mongodb persistance provider', () => {
    let database = undefined
    before((done) => {
        MongoClient.connect("mongodb://localhost:27017/uStateMachine", (err, db) => {
            database = db
            Promise.all([
                db.collection("StateMachines").insertOne(Object.assign({}, validSchema)),
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

    it('should load instance from embed', (done) => {
        mongo.loadInstance("27e8f2bf-e9a4-4503-b0a0-5a5c67259fc2", (err, instance) => {
            assert.deepEqual(instance.plain(), an_instance)
            done()
        })
    })
})