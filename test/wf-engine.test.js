const mocha = require('mocha')
const assert = require('assert')

const MongoClient = require('mongodb')
const {
    validSchema,
    smGroup,
    smGroup2,
    an_instance
} = require('./constants')

const Redis = require('ioredis')

const r = new Redis()

const cache = require('../lib/cache/builtin/redis')({
    port: 6379,
    host: "localhost",
    db: 1
})
cache.setTimeout(60)

const persistance = require('../lib/persistance/builtin/mongo')({
    options: {
        server: "localhost",
        port: "27017",
        database: "uStateMachineTest"
    }
}, true)

const wfEngine = require('../lib/wf-engine')(cache, persistance)

describe('Core engine test', () => {
    let database = undefined
    before((done) => {
        MongoClient.connect("mongodb://localhost:27017/uStateMachineTest", (err, db) => {
            database = db
            Promise.all([
                //db.collection("StateMachines").insertOne(Object.assign({}, validSchema)),
                db.collection("StateMachineGroups").insertOne(Object.assign({}, smGroup)),
                db.collection("StateMachineGroups").insertOne(Object.assign({}, smGroup2)),
                db.collection("Instances").insertOne(Object.assign({}, an_instance))
            ]).then(() => {
                r.flushall(() => {
                    done()
                })
            })
        })
    })
    after((done) => {
        database.dropDatabase(() => {
            r.flushall(() => {
                done()
            })
        })
    })

    it('should add statemachine', (done) => {
        wfEngine.addStateMachine(validSchema, (err) => {
            assert.ifError(err)
            done()
        })
    })
})