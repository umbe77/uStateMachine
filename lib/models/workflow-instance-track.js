
const getTrackFromInstance = (instance) => {
    let inst = instance.plain()
    return {
        instanceId: inst.instanceId,
        state: inst.currentState,
        trackingDate: new Date(),
        instanceData: inst
    }
}

module.exports = {
    getTrackFromInstance
}