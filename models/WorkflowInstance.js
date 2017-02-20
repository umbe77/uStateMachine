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


}

module.exports = WorkflowInstance