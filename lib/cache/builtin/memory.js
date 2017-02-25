
const _stateMachines = {}
const _instances = {}

class Memory {
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
    pushInstance(inst, callback) {
        process.nextTick(() => {
            _instances[inst.instanceId] = inst
            callback(undefined, _instances[inst.instanceId])
        })
    }
    getInstance(instanceId, callback) {
        process.nextTick(() => {
            callback(undefined, _instances[instanceId])
        })
    }
}

const mem = new Memory()
module.exports = mem