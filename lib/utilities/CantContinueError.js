
class CantContinueError extends Error {
    constructor(smName, instanceId) {
        super(`Instance: ${instanceId} of StateMachine: ${smName} can't continue the transition`)
        this.smName = smName
        this.instanceId = instanceId
    }
}

module.exports = CantContinueError