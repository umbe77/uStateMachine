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
const status = require('../lib/models/workflow-instance-constants')
const NotInCacheError = require('../lib/utilities/NotInCacheError')
const BusyInstanceError = require('../lib/utilities/BusyInstanceError')

describe('Redis Cache Provider', function () {

    this.timeout(2000)

    before((done) => {
        r.flushall(() => {
            done()
        })
    })

    after((done) => {
        r.flushall(() => {
            done()
        })
    })

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

    it('should remove StateMachine from cache', (done) => {
        r.hmset(`${validSchema.name}:${validSchema.version}`, 'sm', JSON.stringify(validSchema), 'hash', validSchema.hash, (err, result) => {
            redis.removeStateMachine(validSchema.name, validSchema.version, (err, result) => {
                assert.ok(result)
                r.del(`${validSchema.name}:${validSchema.version}`, () => {
                    done()
                })
            })
        })
    })


    it('should add Instance in cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        redis.pushInstance(inst, (err, result) => {
            assert.ifError(err)
            assert.ok(result)
            r.del(inst.instanceId, () => {
                done()
            })
        })
    })

    it('should get Instance from cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        r.hmset(plain.instanceId, 'inst', JSON.stringify(plain), 'status', plain.status)
        redis.getInstance(plain.instanceId, (err, instance) => {
            assert.ifError(err)
            plain.status = status.PROCESSING
            assert.deepEqual(instance.plain(), plain)
            r.hget(plain.instanceId, 'status', (err, result) => {
                assert.equal(result, status.PROCESSING)
                r.del(plain.instanceId, () => {
                    done()
                })
            })
        })
    })

    it('should get Expired Instance from cache', (done) => {
        redis.setTimeout(1)
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        redis.pushInstance(inst, (err, result) => {
            assert.ifError(err)
            assert.ok(result)
            setTimeout(() => {
                redis.getInstance(plain.instanceId, (err) => {
                    assert.ok(err instanceof NotInCacheError)
                    assert.equal(err.instanceId, plain.instanceId)
                    redis.setTimeout(60)
                    done()
                })
            }, 1200)
        })
    })

    it('should Instance not in cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        redis.getInstance(plain.instanceId, (err) => {
            assert.ok(err instanceof NotInCacheError)
            assert.equal(err.instanceId, plain.instanceId)
            done()
        })
    })

    it('should Instance busy', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        plain.status = status.PROCESSING
        r.hmset(plain.instanceId, 'inst', JSON.stringify(plain), 'status', plain.status)
        redis.getInstance(plain.instanceId, (err) => {
            assert.ok(err instanceof BusyInstanceError)
            assert.equal(err.instanceId, plain.instanceId)
            assert.equal(err.status, status.PROCESSING)
            r.del(plain.instanceId, () => {
                done()
            })
        })
    })

    it('should set instance in cache', (done) => {
        let plain = Object.assign({}, an_instance)
        plain.instanceId = uuid()
        let inst = WorkflowInstance.fromPlain(plain)
        redis.setInstance(inst, (err, instanceId) => {
            assert.equal(instanceId, plain.instanceId)
            r.hget(instanceId, 'status', (err, result) => {
                assert.equal(result, status.IDLE)
                r.del(instanceId, () => {
                    done()
                })
            })
        })
    })
})