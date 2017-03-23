const StateMachine = require('../../models/state-machine')
const WorkflowInstance = require('../../models/workflow-instance')

const semver = require('semver')

const MongoClient = require('mongodb').MongoClient

const privateMembers = new WeakMap()

function sortSm(a, b) {
    if (semver.gt(a, b)) {
        return -1
    }
    if (semver.lt(a, b)) {
        return 1
    }
    return 0
}


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

    loadStateMachines(callback) {
        privateMembers.get(this).db.collection('StateMachines').find().project({
            "_id": 0
        }).toArray((err, docs) => {
            if (err) {
                callback(err, undefined)
                return
            }
            const _stateMachines = docs.map((doc) => {
                return StateMachine.fromPlain(doc)
            })
            callback(undefined, _stateMachines)
        })
    }

    loadStateMachine(smName, smVersion, callback) {
        privateMembers.get(this).db.collection('StateMachines').findOne({
            name: smName,
            version: smVersion
        }, {
            fields: {
                "_id": 0
            }
        }, (err, doc) => {
            if (err) {
                callback(err, undefined)
                return
            }
            let sm = (doc) ? StateMachine.fromPlain(doc) : undefined
            callback(undefined, sm)
        })
    }

    saveStateMachine(sm, callback) {
        process.nextTick(() => {
            const dbSm = Object.assign({}, sm.plain())
            try {
                privateMembers.get(this).db.collection('StateMachines').updateOne({
                    name: dbSm.name,
                    version: dbSm.version
                }, {
                    $set: dbSm
                }, {
                    upsert: true
                })
                callback(undefined)
            } catch (e) {
                callback(e)
            }
        })
    }

    loadInstances(callback) {
        privateMembers.get(this).db.collection("Instances").find().project({
            "_id": 0
        }).toArray((err, docs) => {
            if (err) {
                callback(err, undefined)
                return
            }
            const _instances = docs.map((doc) => {
                return WorkflowInstance.fromPlain(doc)
            })
            callback(undefined, _instances)
        })
    }

    loadInstance(instanceId, callback) {
        privateMembers.get(this).db.collection("Instances").findOne({
            "instanceId": instanceId
        }, {
            fields: {
                "_id": 0
            }
        }, (err, doc) => {
            if (err) {
                callback(err, undefined)
                return
            }
            let instance = (doc) ? WorkflowInstance.fromPlain(doc) : undefined
            callback(undefined, instance)
        })
    }

    saveInstance(instance, callback) {
        process.nextTick(() => {
            const dbInst = Object.assign({}, instance.plain())
            try {
                privateMembers.get(this).db.collection('StateMachines').updateOne({
                    instanceId: dbInst.instanceId
                }, {
                    $set: dbInst
                }, {
                    upsert: true
                })
                callback(undefined)
            } catch (e) {
                callback(e)
            }
        })
    }
}

let mongoPersistance = undefined

module.exports = (settings) => {
    if (!mongoPersistance) {
        mongoPersistance = new MongoPersistance(settings)
    }
    return mongoPersistance
}