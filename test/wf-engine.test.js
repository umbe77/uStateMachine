const mocha = require('mocha')
const assert = require('assert')

const WorkflowInstance = require('../lib/models/workflow-instance')

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

    it('should create a brand new instance', (done) => {
        wfEngine.createInstance(validSchema.name, {
            firstName: "Roberto",
            lastName: "Ughi"
        }, (err, instanceId) => {
            assert.ifError(err, "No Error in instance creation")

            r.hget(instanceId, "inst", (err, result) => {
                assert.ifError(err)

                let inst = WorkflowInstance.fromPlain(JSON.parse(result))

                assert.equal(inst.currentState, "PreOrder", 'Initial State is PreOrder')
                assert.deepEqual(inst.data, {
                    firstName: "Roberto",
                    lastName: "Ughi"
                }, 'instance data is as excpeted')

            })

            database.collection('Instances').findOne({"instanceId": instanceId}, (err, result) => {
                assert.ifError(err)
                assert.ok(result)
            })

            done()

        })
    })

    it('should execute an instance', (done) => {
        let instanceId = WorkflowInstance.fromPlain(an_instance).instanceId
        database.collection("StateMachines").insertOne(Object.assign({}, validSchema), () => {
            wfEngine.executeInstance({
                instanceId,
                transition: "InOrder",
                data: {
                    firstName: "Umbe"
                }
            }, (err, result) => {
                let newInstance = result.instance
                assert.equal(newInstance.currentState, "InOrder")
                assert.equal(newInstance.data.firstName, "Umbe")
                done()
            })
        }) 
    })
})