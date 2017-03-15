const mocha = require('mocha')
const assert = require('assert')

const uuid = require('uuid').v4
const Redis = require('ioredis')

const r = new Redis()

const redis = require('../lib/cache/builtin/redis')({
    port: 6379,
    host: "localhost",
    db: 0
})
redis.setTimeout(60)

const {
    validSchema,
    an_instance
} = require('./constants')


const StateMachine = require('../lib/models/state-machine')
const WorkflowInstance = require('../lib/models/workflow-instance')

describe('Redis Cache Provider', () => {

    before((done) => {
        r.flushall(() => {
            done()
        })
    })

    //Uncomment for ready test
    // after((done) => {
    //     r.flushall(() => {
    //         done()
    //     })
    // })

    it('should push StateMachine in cache', (done) => {
        redis.pushStateMachine(StateMachine.fromPlain(validSchema), (result) => {
            assert.ok(result)
            r.del(`${validSchema.name}:${validSchema.version}`, () => {
                done()
            })
        })
    })

    it('should StateMachine just in cache', (done) => {
        r.hmset(`${validSchema.name}:${validSchema.version}`, 'sm', JSON.stringify(validSchema), 'hash', validSchema.hash, (err, result) => {
            redis.pushStateMachine(StateMachine.fromPlain(validSchema), (result) => {
                assert.ok(!result)
                r.del(`${validSchema.name}:${validSchema.version}`, () => {
                    done()
                })
            })
        })
    })

    it('should get StateMachine FirstWF from cache', (done) => {
        r.hmset(`${validSchema.name}:${validSchema.version}`, 'sm', JSON.stringify(validSchema), 'hash', validSchema.hash, (err, result) => {
            redis.getStateMachine('FirstWF', '1.0.0', (err, sm) => {
                validSchema["dataSchema"] = undefined
                validSchema["hash"] = undefined
                assert.deepEqual(sm.plain(), validSchema)
                r.del(`${validSchema.name}:${validSchema.version}`, () => {
                    done()
                })
            })
        })
    })

    it ('should remove StateMachine from cache', (done) => {
        r.hmset(`${validSchema.name}:${validSchema.version}`, 'sm', JSON.stringify(validSchema), 'hash', validSchema.hash, (err, result) => {
            redis.removeStateMachine(validSchema.name, validSchema.version, (err, result) => {
                assert.ok(result)
                r.del(`${validSchema.name}:${validSchema.version}`, () => {
                    done()
                })
            })
        })        
    })
})