const validSchema = {
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
}

const notValidSchema = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
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
    }
}

const smFirst_2 = {
    "name": "FirstWF",
    "version": "2.0.0",
    "states": {
        "PreOrder": {
            "name": "PreOrder",
            "transitions": {
                "InOrder": {
                    "destination": "InOrder"
                },
                "OrderSent": {
                    "destination": "OrderSent"
                }
            }
        },
        "InOrder": {
            "name": "InOrder",
            "transitions": {
                "OrderSent": {
                    "destination": "OrderSent"
                }
            }
        },
        "OrderSent": {
            "name": "OrderSent",
            "transitions": {}
        }
    },
    "initial": "PreOrder"
}

module.exports = {
    validSchema: validSchema,
    notValidSchema: notValidSchema,
    smFirst_2: smFirst_2
}