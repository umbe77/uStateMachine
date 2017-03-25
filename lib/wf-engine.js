class WfEngine {
    constructor(cache, persistance) {
        this._cache = cache
        this._persistance = persistance
    }

    // init(done) {
    //     this._persistance.loadStateMachines((err, list) => {
    //         list.forEach((sm, idx) => {
    //             this._cache.pushStateMachine(sm, () => {
    //                 if (idx + 1 === list.length) {
    //                     done()
    //                 }
    //             })
    //         })
    //     })
    // }

    addStateMachine(sm, callback) {
        this._persistance.loadInstancesOfGroup(sm.name, (err, smList) => {
            if (err) {
                callback(err, undefined)
                return
            }

            
        })
    }

    //TODO: Implement
    createInstance(smName, callback) {
        //this._cache.getStateMachine()
    }

    //TODO: Implement
    executeInstance(instanceId, callback) {

    }
}

module.exports = (cache, persistance) => {
    return new WfEngine(cache, persistance)
}