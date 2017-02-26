

const StateMachine = require('../../models/state-machine')

const fs = require('fs')
const path = require('path')

const loadFileToObject = (fileName, callback) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            callback(err, undefined)
        }
        else {
            callback(undefined, JSON.parse(data))
        }
    })
}

const saveObjectToFile = (fileName, object, callback) => {
    fs.writeFile(fileName, JSON.stringify(object), (err) => {
        callback(err)
    })
}

const storages = function () {
    const settings = require('../../utilities/settings').getSettings()

    //TODO: add control for options presence
    const _stateMachines = settings.persistance.options.stateMachines.replace(/^~/, global.appRootDir)
    const _instances = settings.persistance.options.instances.replace(/^~/, global.appRootDir)
    return {
        _stateMachines,
        _instances
    }
}

class FileSystemPersistance {
    loadStateMachines(callback) {
        const {_stateMachines} = storages()
        fs.readdir(_stateMachines, (err, files) => {
            const _smList = []
            let runningTasks = 0
            files.forEach((file) => {
                ++runningTasks
                loadFileToObject(path.join(_stateMachines, file), (err, schema) => {
                    if (!err) {
                        StateMachine.load(schema, (schemaErr, sm) => {
                            --runningTasks
                            if (!schemaErr) {
                                _smList.push(sm)
                            }
                            if (runningTasks === 0) {
                                callback(undefined, _smList)
                            }
                        })
                    }
                    else {
                        --runningTasks
                        //TODO: ADD Logger
                    }
                })
            })
        })
    }

    loadStateMachine(smName, smVersion, callback) {
        const {_stateMachines} = storages()
        loadFileToObject(path.join(_stateMachines, `${smName.toLowerCase()}_${smVersion}.json`), (err, schema) => {
            if (err) {
                callback(err, undefined)
            }
            else {
                StateMachine.load(schema, (schemaErr, sm) => {
                    callback(schemaErr, sm)
                })
            }
        })
    }

    saveStateMachine(sm, callback) {
        const {_stateMachines} = storages()
        let fileName = path.join(_stateMachines, `${sm.name.toLowerCase()}_${sm.version}.json`)
        saveObjectToFile(fileName, sm, callback)
    }

    loadInstance(instanceId, callback) {
        const {_instances} = storages()
        let fileName = path.join(_instances, `${instanceId.toLowerCase()}.json`)
        loadFileToObject(fileName, (err, schema) => {
            if (err) {
                callback(err, undefined)
            }
            else {
                //TODO: set the loading of a Worrkflow instance
                callback(undefined, schema)
            }
        })
    }

    saveInstance(instance, callback) {
        const {_instances} = storages()
        let fileName = path.join(_instances, `${instance.instanceId.toLowerCase()}.json`)
        saveObjectToFile(fileName, callback)
    }
}

const fsPersistance = new FileSystemPersistance()

module.exports = fsPersistance