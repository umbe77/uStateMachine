
global.appRootDir = __dirname

const StateMachine = require('./models/state-machine')



let sm = StateMachine.load({
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            transitions: {
                "InOrder": {
                    destination: "InOrder"
                },
                "OrderSent": {
                    destination: "OrderSent"
                }
            }
        },
        "InOrder": {
            name: "InOrder",
            transitions: {
                "OrderSent": {
                    destination: "OrderSent"
                }
            }
        },
        "OrderSent": {
            name: "OrderSent",
            transitions: {}
        }
    },
    initial: "PreOrder"
})
