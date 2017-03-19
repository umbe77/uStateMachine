
class BusyInstanceError extends Error {
    constructor(instanceId, status) {
        super(`Instance: ${instanceId} is in "${status}" status`)
        this.instanceId = instanceId
        this.status = status
    }
}

module.exports = BusyInstanceError