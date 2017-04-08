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
            hash: stateMachine.hash,
            lastChangeDate: new Date(),
            data: Object.assign({}, data),
            status: status.IDLE,
            lockingId: null
        })

        return inst
    }

    static fromPlain(plain) {
        let inst = new WorkflowInstance()

        privateMembers.set(inst, {
            instanceId: plain.instanceId,
            version: plain.version,
            smName: plain.smName,
            hash: plain.hash,
            currentState: plain.currentState,
            lastChangeDate: new Date(plain.lastChangeDate),
            data: Object.assign({}, plain.data),
            status: plain.status,
            lockingId: plain.lockingId
        })

        return inst
    }

    plain() {
        let internalData = privateMembers.get(this)
        return {
            instanceId: internalData.instanceId,
            version: internalData.version,
            smName: internalData.smName,
            hash: internalData.hash,
            currentState: internalData.currentState,
            lastChangeDate: internalData.lastChangeDate,
            data: Object.assign({}, internalData.data),
            status: internalData.status,
            lockingId: internalData.lockingId
        }
    }

    get version() {
        return privateMembers.get(this).version
    }

    get stateMachineName() {
        return privateMembers.get(this).smName
    }

    get hash() {
        return privateMembers.get(this).hash
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

    set status(value) {
        privateMembers.get(this).status = value
    }

    get lockingId() {
        return privateMembers.get(this).lockingId
    }

    set lockingId(value) {
        privateMembers.get(this).lockingId = value
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