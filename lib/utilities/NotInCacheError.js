
class NotInCacheError extends Error {
    constructor(instanceId) {
        super(`Instance: ${instanceId} isn't in cache`)
        super.name = "NotInCacheError"
        this.instanceId = instanceId
    }
}

module.exports = NotInCacheError