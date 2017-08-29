const semver = require('semver')
const StateMachineGroup = require('./models/state-machine-group')
const StateMachine = require('./models/state-machine')
const NotInCacheError = require('./utilities/NotInCacheError')

const engine = require('./engine/engine')

const {
    versionComparer
} = require('./utilities/utils')


const internalGetStateMachine = (_cache, _persistance, smName, smVersion, cb) => {
    _cache.getStateMachine(smName, smVersion, (err, sm) => {
        if (err) {
            cb(err, undefined)
            return
        }
        if (!sm) {
            _persistance.loadStateMachine(smName, smVersion, (err, dbSm) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                if (dbSm) {
                    _cache.pushStateMachine(dbSm, (err, result) => {
                        if (result) {
                            cb(undefined, dbSm)
                            return
                        }
                        _cache.getStateMachine(smName, smVersion, cb)
                    })
                }
            })
        } else {
            cb(undefined, sm)
        }
    })
}

const internalGetInstance = (_cache, _persistance, instanceId, cb) => {
    _cache.getInstance(instanceId, (err, instance) => {
        if (err instanceof NotInCacheError) {
            _persistance.loadInstance(instanceId, (err, instance) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                _cache.setInstance(instance, (err, instanceId) => {
                    _cache.getInstance(instanceId, cb)
                })
            })
        }
        else {
            cb(err, instance)
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

    addStateMachine(stateMachine, cb) {
        let sm = undefined
        try {
            sm = StateMachine.fromPlain(stateMachine)
        } catch (e) {
            cb(e)
            return
        }
        this._persistance.loadInstancesOfGroup(sm.name, (err, smList) => {
            if (err) {
                cb(err, undefined)
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
                    cb(err)
                    return
                }
                this._persistance.saveStateMachine(sm, (err) => {
                    if (err) {
                        cb(err)
                        return
                    }
                    this._cache.pushStateMachineGroup(smg, (err) => {
                        if (err) {
                            cb(err)
                            return
                        }
                        this._cache.pushStateMachine(sm, (err) => {
                            cb(err)
                        })
                    })
                })
            })

        })
    }

    getStateMachine(smName, smVersion, cb) {
        if (!smVersion) {
            //get info for currentversion
            this._cache.getStateMachineCurrentVersion(smName, (err, version) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                internalGetStateMachine(this._cache, this._persistance, smName, version, cb)
            })
        } else {
            internalGetStateMachine(this._cache, this._persistance, smName, smVersion, cb)
        }
    }

    getStateMachines(cb) {
        //TODO: Get all stateMachines in their current version
    }

    getStateMachineAllVersion(smName, cb) {
        //TODO: Get all Version of a specific State Machine
    }

    getInstances(smName, cmVersion, cb) {
        //TODO: Get all instances of a specific statemachine and version
    }

    createInstance(smName, data, cb) {
        this.getStateMachine(smName, undefined, (err, sm) => {
            engine.createInstance(sm, data, (err, instance) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                this._persistance.saveInstance(instance, (err) => {
                    if (err) {
                        cb(err, undefined)
                        return
                    }
                    this._cache.pushInstance(instance, cb)
                })
            })
        })
    }

    //{ instance, stateMachine, transition, data }
    //options: {instanceId, transition, data}
    executeInstance(options, cb) {
        //TODO: check options containing instanceId
        internalGetInstance(this._cache, this._persistance, options.instanceId, (err, instance) => {
            if (err) {
                cb(err, instance)
                return
            }
            this._persistance.saveInstance(instance, (err) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                this.getStateMachine(instance.stateMachineName, instance.version, (err, stateMachine) => {
                    if (err) {
                        cb(err, undefined)
                        return
                    }
                    //TODO: check options contain transition and data in correct format
                    engine.execute({instance, stateMachine, transition: options.transition, data: options.data}, (err, result) => {
                        if (err) {
                            cb(err, undefined)
                            return
                        }
                        this._cache.saveInstance(result.instance, (err) => {
                            if (err) {
                                cb(err, undefined) 
                                return
                            }
                            this._persistance.saveInstance(result.instance, (err) => {
                                if (err) {
                                    cb(err, undefined)
                                    return
                                }
                                cb(undefined, result)
                            })
                        })
                    })
                })
            })
        })
    }
}

module.exports = (cache, persistance) => {
    return new WfEngine(cache, persistance)
}