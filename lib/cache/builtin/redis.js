const Redis = require('ioredis')

const StateMachine = require('../../models/state-machine')
const WorkflowInstance = require('../../models/workflow-instance')
const {
    PROCESSING,
    IDLE
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
                if (redis.call('HGET', KEYS[1], 'status') ~= 'Idle' and redis.call('HGET', KEYS[1], 'locking:id') == ARGV[2]) then
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
                        local inst = cjson.decode(redis.call('HGET', KEYS[1], 'inst'))
                        inst['status'] = 'Processing'
                        inst['lockingId'] = lockingid
                        local instEnc = cjson.encode(inst)
                        redis.call('HMSET', KEYS[1], 'inst', instEnc, 'status', 'Processing', 'locking:id', lockingid)
                        redis.call('PERSIST', KEYS[1])
                        return instEnc
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

    pushStateMachineGroup(smg, cb) {
        redis.set(`smg_${smg.name}`, smg.version, (err) => {
            cb(err)
        })
    }

    getStateMachineCurrentVersion(smName, cb) {
        redis.get(`smg_${smName}`, (err, result) => {
            cb(err, result)
        })
    }

    //Add StateMachine in cache and persist it
    pushStateMachine(sm, cb) {
        redis.smsetnx(`${sm.name}:${sm.version}`, 'sm', JSON.stringify(sm.plain()), 'hash', sm.hash, (err, result) => {
            cb(err, !!result)
        })
    }

    //Get StateMachine from cache 
    getStateMachine(smName, smVersion, cb) {
        redis.hget(`${smName}:${smVersion}`, 'sm', (err, result) => {
            cb(err, StateMachine.fromPlain(JSON.parse(result)))
        })
    }

    //Remove StateMachine from Cache but not touch the persistance storage
    removeStateMachine(smName, smVersion, cb) {
        redis.del(`${smName}:${smVersion}`, (err, result) => {
            cb(err, !!result)
        })
    }

    //Call when an instance is created
    pushInstance(instance, cb) {
        if (instance.status === IDLE) {
            redis.pushinst(instance.instanceId, JSON.stringify(instance.plain()), timeout, (err, result) => {
                cb(err, !!result)
            })
        }
        else{
            cb(new CacheError(CacheErrorCodes.NOTIDLE, 'cannot push a not idle instance in cache'))
        }
    }

    //Set instance from persistance storage
    setInstance(instance, cb) {
        redis.setinst(instance.instanceId, JSON.stringify(instance.plain()), instance.status, instance.lockingId, timeout, (err, result) => {
            if(err || result === 0) {
                cb(err, undefined)
            }
            else{
                cb(undefined, instance.instanceId)
            }
        })
    }

    //call when an instance is executed
    saveInstance(instance, cb) {
        redis.saveinst(instance.instanceId, JSON.stringify(instance.plain()), instance.lockingId, timeout, (err, result) => {
            if (err) {
                cb(err)
                return
            }
            if (result === 0) {
                cb(new CacheError(CacheErrorCodes.NOTVALIDLOCK, `LockingId: ${instance.lockingId} not valid for acquire lock on instance ${instance.instanceId}`))
                return
            }
            instance.lockingId = null
            instance.status = IDLE
            cb(undefined)
        })
    }

    //call when get an instance for transitions
    getInstance(instanceId, cb) {
        redis.getinst(instanceId, (err, result) => {
            if (typeof result === 'string') {
                const resultObj = JSON.parse(result)
                resultObj.status = PROCESSING
                cb(err, WorkflowInstance.fromPlain(resultObj))
                return
            }
            if (result === 0) {
                cb(new NotInCacheError(instanceId), undefined)
                return
            }
            cb(new BusyInstanceError(instanceId, result[1]), undefined)
        })
    }

    //TODO: Implement
    lockInstance(instance, cb) {
        cb()
    }

    //TODO: Implement
    unlockInstance(instance, lockingId, cb) {
        cb()
    }

    removeInstance(instanceId, cb) {
        //TODO: Implement system for removing instance after current processing
        cb()
    }
}

let mem = undefined

module.exports = (settings) => {
    if (!mem) {
        mem = new MemRedis(settings)
    }
    return mem
}