const semver = require('semver')
const StateMachineGroup = require('./models/state-machine-group')
const StateMachine = require('./models/state-machine')
const NotInCacheError = require('./utilities/NotInCacheError')
const {
    getTrackFromInstance
} = require('./models/workflow-instance-track')

const engine = require('./engine/engine')

const {
    versionComparer
} = require('./utilities/utils')


const internalGetStateMachine = (_cache, _persistance, smName, smVersion, cb) => {
    _cache.getStateMachine(smName, smVersion, (err, sm) => {
        if (err) {
            console.log(err)
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
                else {
                    cb(undefined, undefined)
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
        } else {
            cb(err, instance)
        }
    })
}

const internalGetCurrentVersion = (_cache, _persistance, smName, cb) => {
    _cache.getStateMachineCurrentVersion(smName, (err, version) => {
        if (err) {
            cb(err, undefined)
            return
        }
        if (!version) {
            _persistance.loadStateMachineGroup(smName, (err, group) => {
                if (err) {
                    cb(err, undefined)
                    return
                }
                _cache.pushStateMachineGroup(group, (err) => {
                    if (err) {
                        cb(err, undefined)
                        return
                    }
                    cb(undefined, group.version)
                })
            })
        } else {
            cb(err, version)
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
                let smVersionList = smList.map((sm) => {
                    sm.version
                })
                let lastReadVersion = smVersionList.sort(versionComparer)[0]
                if (lastReadVersion && semver.lt(lastVersion, lastReadVersion)) {
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
            internalGetCurrentVersion(this._cache, this._persistance, smName, (err, version) => {
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
        this._persistance.loadStateMachineGroups(cb)
    }

    getStateMachineAllVersions(smName, cb) {
        this._persistance.loadInstancesOfGroup(smName, cb)
    }

    getInstances(smName, cb) {
        this._persistance.loadInstances(smName, (err, docs) => {
            let instances = []
            if (docs) {
                instances = docs.map((doc) => {
                    return doc.plain()
                })
            }
            cb(err, instances)
        })
    }

    getAllowedTransitions(instanceId, cb) {
        this._persistance.loadAllowedTransitions(instanceId, cb)
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
                    this._persistance.trackInstance(getTrackFromInstance(instance), (err) => {
                        //WARNING: anche se il tracking va in errore noi andiamo avanti in ogni caso. trovare delle soluzione alternative valide
                        //TODO: Aggiungere il logging
                        this._cache.pushInstance(instance, (err, result) => {
                            if (err) {
                                cb(err, undefined)
                            }
                            else if (!result) {
                                cb(undefined, undefined)
                            }
                            else{
                                cb(undefined, instance.instanceId)
                            }
                        })
                    })
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
            //WARNING: Qui si fa un salvataggio preventivo in persistance perché l'instanza viene modificata dalla lettura in cache per il locking
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
                    engine.execute({
                        instance,
                        stateMachine,
                        transition: options.transition,
                        data: options.data
                    }, (err, result) => {
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
                                this._persistance.trackInstance(getTrackFromInstance(instance), (err) => {
                                    //WARNING: anche se il tracking va in errore noi andiamo avanti in ogni caso. trovare delle soluzione alternative valide
                                    //TODO: Aggiungere il logging
                                    cb(undefined, result)
                                })
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