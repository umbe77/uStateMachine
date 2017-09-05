const StateMachine = require('../../models/state-machine')
const WorkflowInstance = require('../../models/workflow-instance')

const MongoClient = require('mongodb').MongoClient

const privateMembers = new WeakMap()

class MongoPersistance {
    constructor(settings) {
        const dbOpt = {
            server: (settings.options && settings.options.server) ? settings.options.server : "localhost",
            port: (settings.options && settings.options.port) ? settings.options.port : "27017",
            database: (settings.options && settings.options.database) ? settings.options.database : "uStateMachine",
        }

        MongoClient.connect(`mongodb://${dbOpt.server}:${dbOpt.port}/${dbOpt.database}`,
            (err, db) => {
                privateMembers.set(this, {
                    db: db
                })
            })

    }

    saveStateMachineGroup(smg, cb) {
        let dbSmg = Object.assign({}, smg)
        privateMembers.get(this).db.collection('StateMachineGroups').updateOne({
            name: dbSmg.name
        }, {
            $set: dbSmg
        }, {
            upsert: true
        }, (err) => {
            cb(err)
        })
    }

    loadStateMachineGroups(cb) {
        privateMembers.get(this).db.collection('StateMachineGroups').find().project({
            "_id": 0
        }).toArray((err, docs) => {
            cb(err, docs)
        })
    }

    loadInstancesOfGroup(groupName, cb) {
        privateMembers.get(this).db.collection('StateMachines').find({
            'name': groupName
        }).project({
            '_id': 0
        }).toArray((err, docs) => {
            cb(err, docs)
        })
    }

    loadStateMachines(cb) {
        privateMembers.get(this).db.collection('StateMachines').find().project({
            "_id": 0
        }).toArray((err, docs) => {
            if (err) {
                cb(err, undefined)
                return
            }
            const _stateMachines = docs.map((doc) => {
                return StateMachine.fromPlain(doc)
            })
            cb(undefined, _stateMachines)
        })
    }

    loadStateMachine(smName, smVersion, cb) {
        privateMembers.get(this).db.collection('StateMachines').findOne({
            name: smName,
            version: smVersion
        }, {
            fields: {
                "_id": 0
            }
        }, (err, doc) => {
            if (err) {
                cb(err, undefined)
                return
            }
            let sm = (doc) ? StateMachine.fromPlain(doc) : undefined
            cb(undefined, sm)
        })
    }

    saveStateMachine(sm, cb) {
        const dbSm = Object.assign({}, sm.plain())
        privateMembers.get(this).db.collection('StateMachines').updateOne({
            name: dbSm.name,
            version: dbSm.version
        }, {
            $set: dbSm
        }, {
            upsert: true
        }, (err) => {
            cb(err)
        })
    }

    loadInstances(cb) {
        privateMembers.get(this).db.collection("Instances").find().project({
            "_id": 0
        }).toArray((err, docs) => {
            if (err) {
                cb(err, undefined)
                return
            }
            const _instances = docs.map((doc) => {
                return WorkflowInstance.fromPlain(doc)
            })
            cb(undefined, _instances)
        })
    }

    loadInstance(instanceId, cb) {
        privateMembers.get(this).db.collection("Instances").findOne({
            "instanceId": instanceId
        }, {
            fields: {
                "_id": 0
            }
        }, (err, doc) => {
            if (err) {
                cb(err, undefined)
                return
            }
            let instance = (doc) ? WorkflowInstance.fromPlain(doc) : undefined
            cb(undefined, instance)
        })
    }

    saveInstance(instance, cb) {
        const dbInst = Object.assign({}, instance.plain())
        privateMembers.get(this).db.collection('Instances').updateOne({
            instanceId: dbInst.instanceId
        }, {
            $set: dbInst
        }, {
            upsert: true
        }, (err) => {
            cb(err)
        })
    }

    trackInstance(instanceTrack, cb) {
        privateMembers.get(this).db.collection('InstanceTracking').insert(instanceTrack, (err) => {
            cb(err)
        })
    }
}

let mongoPersistance = undefined

module.exports = (settings, reinitialize) => {
    if (reinitialize || !mongoPersistance) {
        mongoPersistance = new MongoPersistance(settings)
    }
    return mongoPersistance
}