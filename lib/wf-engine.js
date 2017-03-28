const semver = require('semver')
const StateMachineGroup = require('./models/state-machine-group')
const StateMachine = require('./models/state-machine')
const {
    versionComparer
} = require('./utilities/utils')

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

    addStateMachine(stateMachine, callback) {
        let sm = undefined
        try {
            sm = StateMachine.fromPlain(stateMachine)
        }
        catch(e) {
            callback(e)
            return
        }
        this._persistance.loadInstancesOfGroup(sm.name, (err, smList) => {
            if (err) {
                callback(err, undefined)
                return
            }
            let lastVersion = sm.version
            if (smList.length > 0) {
                let lastReadVersion = smList.sort(versionComparer)[0]
                if (semver.lt(lastVersion, lastReadVersion)) {
                    lastVersion = lastReadVersion
                }
            }
            this._persistance.saveStateMachineGroup(new StateMachineGroup(sm.name, lastVersion), (err) => {
                if (err) {
                    callback(err)
                    return
                }
                this._persistance.saveStateMachine(sm, (err) => {
                    if (err) {
                        callback(err)
                        return
                    }
                    this._cache.pushStateMachineGroup(sm.name, (err) => {
                        if (err) {
                            callback(err)
                            return
                        }
                        this._cache.pushStateMachine(sm, (err) => {
                            callback(err)
                        })
                    })
                })
            })

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