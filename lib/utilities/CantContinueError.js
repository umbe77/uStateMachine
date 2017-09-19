
class CantContinueError extends Error {
    constructor(smName, instanceId) {
        super(`Instance: ${instanceId} of StateMachine: ${smName} can't continue the transition`)
        super.name = "CantContinueError"
        this.smName = smName
        this.instanceId = instanceId
    }
}

module.exports = CantContinueError