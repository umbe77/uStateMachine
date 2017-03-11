const StateMachine = require('../../lib/models/state-machine')
const WorkflowInstance = require('../../lib/models/workflow-instance')
const engine = require('nosql')


const privateMembers = new WeakMap()

class EmbedPersistance {

    constructor(settings) {
        //TODO: add control for options presence
        const storagePath = settings.options.path.replace(/^~/, global.appRootDir)
    
        const _db = new engine.load(storagePath)
        privateMembers.set(this, {
            db: _db
        })
    }

    loadStateMachines(callback) {

        privateMembers.get(this).db.find().make((builder) => {
            builder.where("kind", "StateMachines")
            builder.callback((err, docs, cnt) => {
                if (cnt === 0) {
                    callback(undefined, [])
                    return
                }

                const _stateMachines = docs.map((doc) => {
                    delete doc["kind"]
                    return StateMachine.fromPlain(doc)
                })

                callback(undefined, _stateMachines)
            })
        })
    }

    loadStateMachine(smName, smVersion, callback) {
        privateMembers.get(this).db.find().make((builder) => {
            builder.first()
            builder.and()
            builder.where("kind", "StateMachines")
            builder.where("name", smName)
            builder.where("version", smVersion)
            builder.end()
            builder.callback((err, doc) => {

                try {
                    delete doc["kind"]
                    const sm = StateMachine.fromPlain(doc)
                    callback(undefined, sm)
                }
                catch(e) {
                    callback(e, undefined)
                }
            })
        })
    }

    saveStateMachine(sm, callback) {
        const dbSm = Object.assign({}, sm.plain(), { kind: 'StateMachines' })
        privateMembers.get(this).db.update(dbSm, dbSm).make((builder) => {
            builder.and()
            builder.where("kind", "StateMachines")
            builder.where("name", dbSm.name)
            builder.where("version", dbSm.version)
            builder.end()
            builder.callback((err) => {
                callback(err)
            })
        })
    }

    loadInstances(callback) {
        privateMembers.get(this).db.find().make((builder) => {
            builder.where("kind", "Instances")
            builder.callback((err, docs) => {
                callback(err, docs.map((doc) => {
                    delete doc["kind"]
                    return WorkflowInstance.fromPlain(doc)
                }))
            })
        })
    }

    loadInstance(instanceId, callback) {
        privateMembers.get(this).db.find().make((builder) => {
            builder.first()
            builder.and()
            builder.where("kind", "Instances")
            builder.where("instanceId", instanceId)
            builder.end()
            builder.callback((err, doc) => {
                delete doc['kind']
                const inst = WorkflowInstance.fromPlain(doc)
                callback(err, inst)
            })
        })
    }

    saveInstance(instance, callback) {
        const dbInst = Object.assign({}, instance.plain(), { kind: 'Instances'})
        privateMembers.get(this).db.update(dbInst, dbInst).make((builder) => {
            builder.and()
            builder.where("kind", "Instances")
            builder.where("instanceId", dbInst.instanceId)
            builder.end()
            builder.callback((err) => {
                callback(err)
            })
        })
    }

}

const embedPersistance = undefined

module.exports = (settings) => {
    if (!embedPersistance) {
        return new EmbedPersistance(settings)
    }
    return embedPersistance
}