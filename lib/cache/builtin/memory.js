const settings = require('../../utilities/settings').getSettings()

const _stateMachines = {}
const _instances = {}

class Memory {

    constructor() {
        this.timeout = settings["cache"]["timeout"]
    }

    setTimeout(timeout) {
        this.timeout = timeout
    }

    pushStateMachine(sm, callback) {
        process.nextTick(() => {
            if (!_stateMachines[sm.name]) {
                _stateMachines[sm.name] = {}
            }
            _stateMachines[sm.name][sm.version] = sm
            callback(undefined, _stateMachines[sm.name][sm.version])
        })
    }
    getStateMachine(smName, smVersion, callback) {
        process.nextTick(() => {
            let sm = _stateMachines[smName] && _stateMachines[smName][smVersion]
            callback(!sm ? new ReferenceError(`Cannot find StateMachine: ${smName} version: ${smVersion}`, __filename, 18) : undefined, sm)
        })
    }
    removeStateMachine(smName, smVersion, callback) {
        process.nextTick(() => {
            let sm = _stateMachines[smName] && _stateMachines[smName][smVersion]
            let err = !sm ? new ReferenceError(`Cannot find StateMachine: ${smName} version: ${smVersion}`, __filename, 24) : undefined
            if (err) {
                callback(err)
                return
            }
            delete _stateMachines[smName][smVersion]
            if (Object.getOwnPropertyNames(_stateMachines[smName]).length === 0) {
                delete _stateMachines[smName]
            }
            callback(err)

        })
    }
    pushInstance(inst, callback) {
        process.nextTick(() => {
            if (_instances[inst.instanceId]) {
                clearTimeout(_instances[inst.instanceId].keyTimerId)
            }
            const keyTimerId = setTimeout(() => {
                delete _instances[inst.instanceId]
            }, this.timeout)
            _instances[inst.instanceId] = {
                keyTimerId,
                inst
            }
            callback(undefined, _instances[inst.instanceId].inst)
        })
    }
    getInstance(instanceId, callback) {
        process.nextTick(() => {
            callback(undefined, (!!_instances[instanceId]) ? _instances[instanceId].inst : undefined)
        })
    }
    removeInstance(instanceId, callback) {
        process.nextTick(() => {
            delete _instances[instanceId]
            callback(undefined)
        })
    }
}

const mem = new Memory()
module.exports = mem