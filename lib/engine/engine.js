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


function getScriptCode(script) {
    return `
        (function() {
            return new Promise((end) => {
                ${script}
            })
        })
    `
}

function onExit(sourceState, sandbox) {
    if (sourceState && sourceState.onExit) {
        const script = new vm.Script(getScriptCode(sourceState.onExit))
        const context = new vm.createContext(sandbox)
        return script.runInContext(context)()
    } else {
        return Promise.resolve()
    }
}

function onEnter(destinationState, sandbox) {
    if (destinationState.onEnter) {
        const script = new vm.Script(getScriptCode(destinationState.onEnter))
        const context = new vm.createContext(sandbox)
        return script.runInContext(context)()
    } else {
        return Promise.resolve()
    }
}

function fire(instance, sourceState, destinationState, data) {

    return new Promise(
        (resolve) => {
            let currentData = Object.assign({}, instance.data)

            const sandboxExit = {
                currentData: Object.assign({}, currentData),
                instanceId: instance.instanceId,
                canContinue: true
            }

            const sandboxEnter = {
                currentData: {},
                data: {},
                instanceId: instance.instanceId,
                canContinue: true
            }

            onExit(sourceState, sandboxExit).then(() => {
                if (sandboxExit.canContinue) {
                    sandboxEnter.currentData =  Object.assign(currentData, sandboxExit.currentData)
                    sandboxEnter.data = Object.assign({}, data)
                    return onEnter(destinationState, sandboxEnter).then(() => {return Promise.resolve(true)})
                } else {
                    return Promise.resolve(false)
                }
            }).then((canContinue) => {

                if (!canContinue) {
                    resolve(canContinue)
                } else if (sandboxEnter.canContinue) {
                    data = Object.assign({}, sandboxEnter.currentData, sandboxEnter.data)

                    instance.currentState = destinationState.name
                    instance.data = data

                    resolve(sandboxEnter.canContinue)
                } else {
                    resolve(false)
                }
            })

        }
    )

}

class WorkflowEngine {

    static createInstance(stateMachine, data, callback) {
        //TODO: Check if data passed are valid for schema in stateMachine
        process.nextTick(() => {
            let instance = WorkflowInstance.createInstance(stateMachine, data)

            fire(instance,
                undefined,
                stateMachine.states[stateMachine.initialState],
                data).then((canContinue) => {
                let err = undefined
                if (!canContinue) {
                    err = new CantContinueError(stateMachine.name, instance.instanceId)
                }
                callback(err, instance)
            })
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

            const transition = stateMachine.states[instance.currentState].transitions[transitionName]
            if (!transition) {
                //transition is not valid
                callback(new CantMoveError(stateMachine.name, instance.instanceId, transitionName), {})
                return
            }

            //checkTransitionCondition
            if (!checkTransition(transition, instance, data)) {
                const err = new CantMoveError(stateMachine.name, instance.instanceId, transitionName)
                callback(err, {
                    instance: WorkflowInstance.fromPlain(instance),
                    oldInstance: options.instance,
                })
            } else {
                fire(instance,
                    stateMachine.states[instance.currentState],
                    stateMachine.states[transition.destination],
                    data).then((canContinue) => {
                    let err = undefined
                    if (!canContinue) {
                        err = new CantContinueError(stateMachine.name, instance.instanceId)
                        callback(err, {
                            instance: WorkflowInstance.fromPlain(instance),
                            oldInstance: options.instance,
                        })
                    } else {
                        callback(err, {
                            instance: WorkflowInstance.fromPlain(instance),
                            oldInstance: options.instance,
                        })
                    }
                })
            }
        })
    }
}


module.exports = WorkflowEngine