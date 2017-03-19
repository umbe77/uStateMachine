
class NotInCacheError extends Error {
    constructor(instanceId) {
        super(`Instance: ${instanceId} isn't in cache`)
        this.instanceId = instanceId
    }
}

module.exports = NotInCacheError