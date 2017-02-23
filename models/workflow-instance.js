"use strict"

const uuid = require("uuid")

const privateMembers = new WeakMap()

class WorkflowInstance {

    static createInstance(stateMachine, data) {
        let inst = new WorkflowInstance()
        
        console.log("pippo")
        
        privateMembers.set(inst, {
            instanceId: uuid.v4(),
            version: stateMachine.version,
            currentState: "",
            smName: stateMachine.name,
            data: Object.assign({}, data)
        })

        return inst
    }

    get data() {
        return privateMembers.get(this).data
    }

    set data(value) {
        let p = privateMembers.get(this) 
        p.data = Object.assign(p.data, value)
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