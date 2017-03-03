const status = require('./workflow-instance-constants')

const uuid = require("uuid")

const privateMembers = new WeakMap()

class WorkflowInstance {

    static createInstance(stateMachine, data) {
        let inst = new WorkflowInstance()
        
        privateMembers.set(inst, {
            instanceId: uuid.v4(),
            version: stateMachine.version,
            currentState: "",
            smName: stateMachine.name,
            lastChangeDate: new Date(),
            data: Object.assign({}, data),
            status: status.IDLE
        })

        return inst
    }

    static fromPlain(plain) {
        let inst = new WorkflowInstance()

        privateMembers.set(inst, {
            instanceId: plain.instanceId,
            version: plain.version,
            smName: plain.smName,
            currentState: plain.currentState,
            lastChangeDate: plain.lastChangeDate,
            data: Object.assign({}, plain.data),
            status: plain.status
        })

        return inst
    }

    plain() {
        let internalData = privateMembers.get(this)
        return {
            instanceId: internalData.instanceId,
            version: internalData.version,
            smName: internalData.smName,
            currentState: internalData.currentState,
            lastChangeDate: internalData.lastChangeDate,
            data: Object.assign({}, internalData.data),
            status: internalData.status
        }
    }

    get version() {
        return privateMembers(this).version
    }

    get stateMachineName() {
        return privateMembers.get(this).smName
    }

    get data() {
        return privateMembers.get(this).data
    }

    set data(value) {
        let p = privateMembers.get(this) 
        p.data = Object.assign(p.data, value)
    }

    get lastChangeDate() {
        return privateMembers.get(this).lastChangeDate
    }

    setlastChangeDate() {
        privateMembers.get(this).lastChangeDate = new Date()
    }

    get status() {
        return privateMembers.get(this).status
    }

    get instanceId() {
        return privateMembers.get(this).instanceId
    }

    get currentState() {
        return privateMembers.get(this).currentState
    }

    set currentState(value) {
        privateMembers.get(this).currentState = value
    }
    
}

module.exports = WorkflowInstance