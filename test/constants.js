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

const a_onenter = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            onEnter: `
                data.city = "Livorno"
            `,
            transitions: {
                "InOrder": {
                    destination: "InOrder"
                }
            }
        },
        "InOrder": {
            name: "InOrder",
            onEnter: `
                canContinue = (currentData === 'Livorno')
            `,
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

const a_onexit = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            onEnter: `
                data.city = "Livorno"
            `,
            onExit: `
                currentData.state = "Toscana"
            `,
            transitions: {
                "InOrder": {
                    destination: "InOrder"
                }
            }
        },
        "InOrder": {
            name: "InOrder",
            onEnter: `
                canContinue = (currentData.city === 'Livorno')
            `,
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

const an_instance = {
    "instanceId": "27e8f2bf-e9a4-4503-b0a0-5a5c67259fc2",
    "version": "1.0.0",
    "smName":  "FirstWF",
    "currentState": "PreOrder",
    "lastChangeDate": new Date(),
    "data": {
        "firstName": "Roberto",
        "lastName": "Ughi"
    }
}

module.exports = {
    a_onenter,
    a_onexit,
    validSchema,
    notValidSchema,
    smFirst_2,
    validSchema_wrongstate,
    validSchema_dontchecktransition,
    an_instance
}