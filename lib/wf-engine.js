class WfEngine {
    constructor(cache, persistance) {
        this._cache = cache
        this._persistance = persistance
    }

    init(done) {
        this._persistance.loadStateMachines((err, list) => {
            list.forEach((sm, idx) => {
                this._cache.pushStateMachine(sm, () => {
                    if (idx + 1 === list.length) {
                        done()
                    }
                })
            })
        })
    }

    createInstance(smName, callback) {
        //this._cache.getStateMachine()
    }
}

module.exports = (cache, persistance) => {
    return new WfEngine(cache, persistance)
}