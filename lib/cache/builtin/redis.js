const Redis = require('ioredis')

let redis = undefined
let timeout = 20

class MemRedis {
    constructor(settings) {
        redis = new Redis(settings)
    }

    setTimeout(t) {
        timeout = t
    }

    pushStateMachine(sm, callback) {
        redis.set('test', 20, 'EX', timeout, 'NX')
        callback()
    }

    getStateMachine(smName, smVersion, callback) {

    }

    removeStateMachine(smName, smVersion, callback) {

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