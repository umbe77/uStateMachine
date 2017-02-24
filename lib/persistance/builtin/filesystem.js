const {settings} = require('../../utilities/settings')

//TODO: add control for options presence
const _stateMachines = settings.persistance.options.stateMachines.replace(/^~/, global.appRootDir)
const _instances = settings.persistance.options.instances.replace(/^~/, global.appRootDir)

const StateMachine = require('../../models/state-machine')

const fs = require('fs')
const path = require('path')

class FileSystemPersistance {
    loadStateMachines(callback) {
        process.nextTick(() => {
            fs.readdir(_stateMachines, (err, files) => {
                const _smList = []
                files.forEach((file) => {
                    _smList.push(StateMachine.load(require(path.join(_stateMachines, file))))
                })
                callback(_smList)
            })
        })
    }
}

const fsPersistance = new FileSystemPersistance()

module.exports = fsPersistance