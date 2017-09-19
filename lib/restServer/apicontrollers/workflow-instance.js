const {
    router
} = require('urestserver')
const {
    getResponse,
    formatErrorResponse
} = require('../../utilities/utils')

router.get("/instance/:smname/list", (svc) => {
    let engine = svc.context.engine
    engine.getInstances(svc.params.smname, (err, instances) => {
        if (err) {
            svc.done(formatErrorResponse(err))
        } else {
            svc.done(getResponse(instances))
        }
    })
})

router.get("/instance/:id/transitions", (svc) => {
    let engine = svc.context.engine
    engine.getAllowedTransitions(svc.params.id, (err, transitions) => {
        if (err) {
            svc.done(formatErrorResponse(err))
        } else {
            svc.done(getResponse(transitions))
        }
    })
})

//TODO: Definire come gestire il locking esplicito e come gestire il timeout di locking
router.get("/instance/:id", (svc) => {
    let engine = svc.context.engine
    svc.done(getResponse({}))
})

//Create Instance
router.post("/instance/:name", (svc) => {
    let engine = svc.context.engine
    let data = svc.body
    engine.createInstance(svc.params.name, data, (err, instanceId) => {
        if (err) {
            svc.done(formatErrorResponse(err))
        } else {
            svc.done(getResponse({
                instanceId
            }))
        }
    })
})

//Execute Instance
router.put("/instance/:id/:transition", (svc) => {
    let engine = svc.context.engine
    let data = svc.body
    engine.executeInstance({
        instanceId: svc.params.id,
        transition: svc.params.transition,
        data
    }, (err, result) => {
        if (err) {
            svc.done(formatErrorResponse(err))
        } else {
            svc.done(getResponse({
                instance: result.instance.plain(),
                oldInstance: result.oldInstance.plain()
            }))
        }
    })
})