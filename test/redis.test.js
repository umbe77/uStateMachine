const mocha = require('mocha')
const assert = require('assert')

const uuid = require('uuid').v4

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
    it('test ioredis', (done) => {
        redis.pushStateMachine(undefined, () => {
            done()
        })
    })
})