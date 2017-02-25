const {settings} = require('../../utilities/settings')

//TODO: add control for options presence
const _stateMachines = settings.persistance.options.stateMachines.replace(/^~/, global.appRootDir)
const _instances = settings.persistance.options.instances.replace(/^~/, global.appRootDir)

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

class FileSystemPersistance {
    loadStateMachines(callback) {
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
}

const fsPersistance = new FileSystemPersistance()

module.exports = fsPersistance