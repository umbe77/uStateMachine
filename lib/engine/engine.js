const WorkflowInstance = require('../models/workflow-instance')

function fire(instance, state, data) {

    if (instance.currentState && instance.currentState.onExit) {
        //FIre onExit Event (See how to run string and define contect of func)
    }

    if (state.onEnter) {
        //Fire onEnter Event (See how to run string and define contect of func)
    }

    instance.currentState = state
    instance.data = data
}

class WorkflowEngine {

    static init() {
        //TODO: load all stateMachines in Cache --> create a provider for that

    }

    static createInstance(stateMachine, data) {
        //TODO: Check if data passed are valid for schema in stateMachine

        let instance = WorkflowInstance.createInstance(stateMachine, data)

        fire(instance, stateMachine.initialState, data)

        return Object.assign({
            code: 0,
            instance: {}
        }, {code: 1, instance: instance})
    }

    static execute(instanceId, transition, data) {
        //TODO: Check if data passed are valid for schema in stateMachine

        /*
            get instance
            get stateMachine of instance
            get currentState for instance
            check if transition is possible
            check if state entering is possible
            fire transition
        */
        return {
            code: 0
        }
    }

}

module.exports = WorkflowEngine