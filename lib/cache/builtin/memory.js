
const _stateMachines = {}
const _instances = {}

class Memory {
    pushStateMachine(sm, callback) {
        process.nextTick(() => {
            _stateMachines[sm.name] = sm
            callback()
        })
    }
    getStateMachine(smName, callback) {
        process.nextTick(() => {
            callback(undefined, _stateMachines[smName])
        })
    }
    pushInstance(inst, callback) {
        process.nextTick(() => {
            _instances[inst.instanceId] = inst
            callback()
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