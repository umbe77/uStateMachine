
class BusyInstanceError extends Error {
    constructor(instanceId, status) {
        super(`Instance: ${instanceId} is in "${status}" status`)
        super.name = "BusyInstanceError"
        this.instanceId = instanceId
        this.status = status
    }
}

module.exports = BusyInstanceError