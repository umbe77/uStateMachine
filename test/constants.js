const status = require('../lib/models/workflow-instance-constants')

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
                end()
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
                end()
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
                end()
            `,
            onExit: `
                currentData.state = "Toscana"
                end()
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
                end()
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

const a_onexit_timeout = {
    name: "FirstWF",
    version: "1.0.0",
    states: {
        "PreOrder": {
            name: "PreOrder",
            onEnter: `
                data.city = "Livorno"
                end()
            `,
            onExit: `
                setTimeout(() => {
                    currentData.state = "Toscana"
                    end()
                }, 200)
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
                end()
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
    "hash": "",
    "currentState": "PreOrder",
    "lastChangeDate": new Date(Date.parse('2017-03-03T00:38:03')),
    "status": status.IDLE,
    "lockingId": null,
    "data": {
        "firstName": "Roberto",
        "lastName": "Ughi"
    }
}

module.exports = {
    a_onenter,
    a_onexit,
    a_onexit_timeout,
    validSchema,
    notValidSchema,
    smFirst_2,
    validSchema_wrongstate,
    validSchema_dontchecktransition,
    an_instance
}