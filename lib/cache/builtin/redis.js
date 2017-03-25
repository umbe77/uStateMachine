const Redis = require('ioredis')

const StateMachine = require('../../models/state-machine')
const WorkflowInstance = require('../../models/workflow-instance')
const {
    PROCESSING,
    IDLE,
    LOCKED
} = require('../../models/workflow-instance-constants')
const CacheError = require('../../utilities/CacheError')
const CacheErrorCodes = require('../../utilities/CacheErrorCodes')
const NotInCacheError = require('../../utilities/NotInCacheError')
const BusyInstanceError = require('../../utilities/BusyInstanceError')

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
                    return redis.call('HMSET', KEYS[1], ARGV[1], ARGV[2], ARGV[3], ARGV[4])
                end
                return 0
            `
        })

        redis.defineCommand('pushinst', {
            numberOfKeys: 1,
            lua: `
                if (redis.call('EXISTS', KEYS[1]) == 0) then
                    local result = redis.call('HMSET', KEYS[1], 'inst', ARGV[1], 'status', 'Idle')
                    redis.call('EXPIRE', KEYS[1], ARGV[2])
                    return result
                end
                return 0
            `
        })

        redis.defineCommand('saveinst', {
            numberOfKeys: 1,
            lua: `
                if (redis.call('HGET', KEYS[1], 'status') ~= 'Idle' and redis.call('HGET', KEYS[1], 'locking:id') == ARGV[2])) then
                    redis.call('HMSET', KEYS[1], 'inst', ARGV[1], 'status', 'Idle')
                    redis.call('HDEL', KEYS[1], 'locking:id')
                    redis.call('EXPIRE', KEYS[1], ARGV[3])
                    return 1
                end
                return 0
            `
        })

        redis.defineCommand('setinst', {
            numberOfKeys: 1,
            lua: `
                if (redis.call('EXISTS', KEYS[1]) == 1) then
                    return 1
                end 
                redis.call('HMSET', KEYS[1], 'inst', ARGV[1], 'status', ARGV[2])
                if (ARGV[3] ~= nil) then
                    redis.call('HSET', KEYS[1], 'locking:id', ARGV[3])
                end
                if (ARGV[2] == 'Idle') then
                    redis.call('EXPIRE', KEYS[1], ARGV[4])
                end
                return 1
            `
        })

        redis.defineCommand('getinst', {
            numberOfKeys: 1,
            lua: `
                if (redis.call('EXISTS', KEYS[1]) == 1) then
                    local status = redis.call('HGET', KEYS[1], 'status')
                    if (status == 'Idle') then 
                        local lockingid = redis.call('INCR', 'locking:id')
                        redis.call('HMSET', KEYS[1], 'status', 'Processing', 'locking:id', lockingid)
                        redis.call('PERSIST', KEYS[1])
                        return redis.call('HGET', KEYS[1], 'inst')
                    end
                    return {'status', status}
                end
                return 0
            `
        })
    }

    setTimeout(t) {
        timeout = t
    }

    pushStateMachineGroup(smg, callback) {
        redis.set(`smg_${smg.name}`, smg.version, (err) => {
            callback(err)
        })
    }

    getStateMachineCurrentVersion(smName, callback) {
        redis.get(`smg_${smName}`, (err, result) => {
            callback(err, result)
        })
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

    //Call when an instance is created
    pushInstance(instance, callback) {
        if (instance.status === IDLE) {
            redis.pushinst(instance.instanceId, JSON.stringify(instance.plain()), timeout, (err, result) => {
                callback(err, !!result)
            })
        }
        else{
            callback(new CacheError(CacheErrorCodes.NOTIDLE, 'cannot push a not idle instance in cache'))
        }
    }

    //Set instance from persistance storage
    setInstance(instance, callback) {
        redis.setinst(instance.instanceId, JSON.stringify(instance.plain()), instance.status, instance.lockingId, timeout, (err, result) => {
            if(err || result === 0) {
                callback(err, undefined)
            }
            else{
                callback(undefined, instance.instanceId)
            }
        })
    }

    //call when an instance is executed
    saveInstance(instance, callback) {
        redis.saveinst(instance.instanceId, JSON.stringify(instance.plain()), instance.lockingId, timeout, (err, result) => {
            if (err) {
                callback(err)
                return
            }
            if (result === 0) {
                callback(new CacheError(CacheErrorCodes.NOTVALIDLOCK, `LockingId: ${instance.lockingID} not valid for acquire lock on instance ${instance.instanceId}`))
                return
            }
            callback(undefined)
        })
    }

    //call when get an instance for transitions
    getInstance(instanceId, callback) {
        redis.getinst(instanceId, (err, result) => {
            if (typeof result === 'string') {
                const resultObj = JSON.parse(result)
                resultObj.status = PROCESSING
                callback(err, WorkflowInstance.fromPlain(resultObj))
                return
            }
            if (result === 0) {
                callback(new NotInCacheError(instanceId), undefined)
                return
            }
            callback(new BusyInstanceError(instanceId, result[1]), undefined)
        })
    }

    //TODO: Implement
    lockInstance(instance, callback) {
        callback()
    }

    //TODO: Implement
    unlockInstance(instance, lockingId, callback) {
        callback()
    }

    removeInstance(instanceId, callback) {
        //TODO: Implement system for removing instance after current processing
        callback()
    }
}

let mem = undefined

module.exports = (settings) => {
    if (!mem) {
        mem = new MemRedis(settings)
    }
    return mem
}