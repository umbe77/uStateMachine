const Redis = require('ioredis')

const StateMachine = require('../../models/state-machine')

let redis = undefined
let timeout = 20

class MemRedis {
    constructor(settings) {
        redis = new Redis(settings)
        //lua for pushStateMachine
        redis.defineCommand('smsetnx', {
            numberOfKeys: 1,
            lua: `
                if (redis.call('EXISTS', KEYS[1]) == 0) then
                    redis.call('HMSET', KEYS[1], ARGV[1], ARGV[2], ARGV[3], ARGV[4])
                    return 1
                end
                return 0
            `
        })
    }

    setTimeout(t) {
        timeout = t
    }

    //Add StateMachine in cache and persist it
    pushStateMachine(sm, callback) {
        redis.smsetnx(`${sm.name}:${sm.version}`, 'sm', JSON.stringify(sm.plain()), 'hash', sm.hash, (err, result) => {
            callback(!!result)
        })
    }

    //Get StateMachine from cache or persistance storage
    getStateMachine(smName, smVersion, callback) {
        redis.hget(`${smName}:${smVersion}`, 'sm', (err, result) => {
            callback(err, StateMachine.fromPlain(JSON.parse(result)))
        })
    }

    //Remove StateMachine from Cache but not touch the persistance storage
    removeStateMachine(smName, smVersion, callback) {
        redis.del(`${smName}:${smVersion}`, (err, result) => {
            callback(err, !!result)
        })
    }

    pushInstance(isntance, callback) {

    }

    getInstance(instanceId, callback) {

    }

    removeInstance(instanceId, callback) {

    }
}

let mem = undefined

module.exports = (settings) => {
    if (!mem) {
        mem = new MemRedis(settings)
    }
    return mem
}