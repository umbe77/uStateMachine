
class CantMoveError extends Error {
    constructor(smName, instanceId, transitionName) {
        super(`Instance: ${instanceId} of StateMachine: ${smName} can't use transition: ${transitionName}`)
        this.smName = smName
        this.instanceId = instanceId
        this.transitionName = transitionName
    }
}

module.exports = CantMoveError