const {router} = require('urestserver')
const {getResponse} = require('../../utilities/utils')

router.get("/statemachine/list", (svc) => {
    let engine = svc.context.engine
    engine.getStateMachines((err, docs) => {
        if (err) {
            //Define error handling in reults
        }
        svc.done(getResponse(docs))
    })
})

router.get("/statemachine/:name/versions", (svc) => {
    let engine = svc.context.engine
    engine.getStateMachineAllVersions(svc.params.name, (err, docs) => {
        if (err) {
            //Define error handling in reults
        }
        svc.done(getResponse(docs))
    })    
})

router.get("/statemachine/:name/:version", (svc) => {
    let engine = svc.context.engine
    engine.getStateMachine(svc.params.name, svc.params.version, (err, sm) => {
        if (err) {
            //Define error handling in reults
        }
        svc.done(getResponse(sm.plain()))
    })
})

router.post("/statemachine", (svc) => {
    let engine = svc.context.engine
    let sm = svc.body
    engine.addStateMachine(sm, (err) => {
        if (err) {
            //Define error handling in reults
        }
        svc.done(getResponse({
            status: "OK",
            mesagge: "StateMachine Created"
        }))
    })

})
