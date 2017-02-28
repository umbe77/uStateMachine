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

const validSchema_wrongstate = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            transitions: {
                "InOrder": {
                    destination: "InOrder"
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

const validSchema_dontchecktransition = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            transitions: {
                "InOrder": {
                    destination: "InOrder",
                    condition: `
                        if (currentData.firstName === data.firstName) {
                            canMove = false
                        }
                    ` 
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
    validSchema,
    notValidSchema,
    smFirst_2,
    validSchema_wrongstate,
    validSchema_dontchecktransition
}