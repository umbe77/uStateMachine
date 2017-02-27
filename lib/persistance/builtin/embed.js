const StateMachine = require('../../models/state-machine')
const engine = require('nosql')



const getStoragePath = function () {
    const settings = require('../../utilities/settings').getSettings()

    //TODO: add control for options presence
    return settings.persistance.options.path.replace(/^~/, global.appRootDir)
}

const privateMembers = new WeakMap()

class EmbedPersistance {

    constructor() {
        const storagePath = getStoragePath()
        const _db = new engine.load(storagePath)
        privateMembers.set(this, {
            db: _db
        })
    }

    loadStateMachines(callback) {

        privateMembers.get(this).db.find().make((builder) => {
            builder.callback((err, docs, cnt) => {
                if (cnt === 0) {
                    callback(undefined, [])
                    return
                }
                let idx = 0
                const _stateMachines = []
                docs.forEach((doc) => {
                    ++idx
                    StateMachine.load(doc, (schemaErr, sm) => {
                        if (!schemaErr)            {
                            _stateMachines.push(sm)
                        }
                        if (idx === cnt) {
                            callback(undefined, _stateMachines)
                        }
                    })
                })
            }) 
        })



    }

    loadStateMachine(smName, smVersion, callback) {
        privateMembers.get(this).db.find().make((builder) => {
            builder.first()
            builder.and()
            builder.where("name", smName)
            builder.where("version", smVersion)
            builder.end()
            builder.callback((err, doc) => {
                StateMachine.load(doc, (err, sm) => {
                    if (err){
                        callback(err, undefined)
                    }
                    else{
                        callback(undefined, sm)
                    }
                })
            }) 
        })
    }

    saveStateMachine(sm, callback) {
        privateMembers.get(this).db.update(sm, sm).make((builder) => {
            builder.and()
            builder.where("name", sm.name)
            builder.where("version", sm.version)
            builder.end()
            builder.callback((err) => {
                callback(err)
            })
        })
    }

    loadInstance(instanceId, callback) {

    }

    saveInstance(instance, callback) {

    }

}

module.exports = new EmbedPersistance()