const WorkflowInstance = require('../models/workflow-instance')
const CantContinueError = require('../utilities/CantContinueError')
const CantMoveError = require('../utilities/CantMoveError')

const vm = require('vm')

function checkTransition(transition, instance, data) {
    if (!transition.condition) {
        return true
    }

    const script = new vm.Script(transition.condition)
    const sandbox = {
        currentData: Object.assign({}, instance.data),
        data: Object.assign({}, data),
        canMove: true
    }
    const context = new vm.createContext(sandbox)
    script.runInContext(context)

    return sandbox.canMove
}

function fire(instance, sourceState, destinationState, data) {

    let currentData = Object.assign({}, instance.data)

    if (sourceState && sourceState.onExit) {
        //Fire onExit Event (See how to run string and define contect of func)
        const sandbox = {
            currentData: Object.assign({}, currentData),
            instanceId: instance.instanceId,
            canContinue: true
        }

        const script = new vm.Script(sourceState.onExit)
        const context = new vm.createContext(sandbox)
        script.runInContext(context)
        if (!sandbox.canContinue) {
            return false
        }
        data = Object.assign(currentData, sandbox.currentData)
    }

    if (destinationState.onEnter) {
        //Fire onEnter Event (See how to run string and define contect of func)
        const sandbox = {
            currentData: Object.assign({}, currentData),
            data: Object.assign({}, data),
            instanceId: instance.instanceId,
            canContinue: true
        }

        const script = new vm.Script(destinationState.onEnter)
        const context = new vm.createContext(sandbox)

        script.runInContext(context)
        if (!sandbox.canContinue) {
            return false
        }
        data = Object.assign({}, sandbox.currentData, sandbox.data)
    }

    instance.currentState = destinationState.name
    instance.data = data
    return true
}

class WorkflowEngine {

    static createInstance(stateMachine, data, callback) {
        //TODO: Check if data passed are valid for schema in stateMachine
        process.nextTick(() => {
            let instance = WorkflowInstance.createInstance(stateMachine, data)

            let err = undefined

            if (!fire(instance, undefined, stateMachine.states[stateMachine.initialState], data)) {
                err = new CantContinueError(stateMachine.name, instance.instanceId)
            }

            callback(err, instance)

        })
    }

    //Argument for Execute { instance, stateMachine, transition, data }
    static execute(options, callback) {
        //TODO: Check if data passed are valid for schema in stateMachine
        process.nextTick(() => {

            const instance = Object.assign({}, options.instance.plain())
            const stateMachine = options.stateMachine
            const transitionName = options.transition
            const data = options.data

            //TODO: check if transition is valid
            const transition = stateMachine.states[instance.currentState].transitions[transitionName]
            if (!transition) {
                //transition is not valid
                callback(new CantMoveError(stateMachine.name, instance.instanceId, transitionName), { })
                return
            }

            let err = undefined

            //checkTransitionCondition
            if (!checkTransition(transition, instance, data)) {
                err = new CantMoveError(stateMachine.name, instance.instanceId, transitionName)
            }
            else if (!fire(instance, stateMachine.states[instance.currentState], stateMachine.states[transition.destination], data)) {
                err = new CantContinueError(stateMachine.name, instance.instanceId)
            }

            callback(err, {
                instance: WorkflowInstance.fromPlain(instance),
                oldInstance: options.instance,
            })

        })
    }

}

module.exports = WorkflowEngine