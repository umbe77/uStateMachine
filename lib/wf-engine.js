const semver = require('semver')
const StateMachineGroup = require('./models/state-machine-group')
const StateMachine = require('./models/state-machine')

const engine = require('./engine/engine')

const {
    versionComparer
} = require('./utilities/utils')


const internalGetStateMachine = (_cache, _persistance, smName, smVersion, callback) => {
    _cache.getStateMachine(smName, smVersion, (err, sm) => {
        if (err) {
            callback(err ,undefined)
            return
        }
        if (!sm) {
            _persistance.loadStateMachine(smName, smVersion, (err, dbSm) => {
                if (err) {
                    callback(err, undefined)
                    return
                }
                if (dbSm) {
                    _cache.pushStateMachine(dbSm, (err, result) => {
                        if (result) {
                            callback(undefined, dbSm)
                            return
                        }
                        _cache.getStateMachine(smName, smVersion, callback)
                    })
                }
            })
        }
        else {
            callback(undefined, sm)
        }
    })
}

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
            const smg = new StateMachineGroup(sm.name, lastVersion)
            this._persistance.saveStateMachineGroup(smg, (err) => {
                if (err) {
                    callback(err)
                    return
                }
                this._persistance.saveStateMachine(sm, (err) => {
                    if (err) {
                        callback(err)
                        return
                    }
                    this._cache.pushStateMachineGroup(smg, (err) => {
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

    getStateMachine(smName, smVersion, callback) {
        if (!smVersion) {
            //get info for currentversion
            this._cache.getStateMachineCurrentVersion(smName, (err, version) => {
                if (err) {
                    callback(err, undefined)
                    return
                }
                internalGetStateMachine(this._cache, this._persistance, smName, version, callback)
            })
        }
        else {
            internalGetStateMachine(this._cache, this._persistance, smName, smVersion, callback)
        }
    }

    //TODO: Save in persistance storage
    //TODO: Save in cache
    createInstance(smName, data, callback) {
        this.getStateMachine(smName, undefined, (err, sm) => {
            engine.createInstance(sm, data, (err, instance) => {
                if (err) {
                    callback(err, undefined)
                    return
                }
                this._persistance.saveInstance(instance, (err) => {
                    if (err) {
                        //throw some kind of error
                        return
                    }
                    this._cache.pushInstance(instance, callback)
                })
            })
        })
    }

    //TODO: Implement
    executeInstance(instanceId, callback) {

    }
}

module.exports = (cache, persistance) => {
    return new WfEngine(cache, persistance)
}