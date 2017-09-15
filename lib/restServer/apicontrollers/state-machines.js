const {router} = require('urestserver')

router.get("/statemachine/list", (svc) => {
    let engine = svc.context.engine
    engine.getStateMachines((err, docs) => {
        svc.done({
            body: JSON.stringify(docs),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    })
})

router.post("/statemachine", (svc) => {
    let engine = svc.context.engine
    let sm = svc.body
    engine.addStateMachine(sm, (err) => {
        if (err) {
            //Define error handling in reults
        }
        svc.done({
            body: JSON.stringify({
                status: "OK",
                mesagge: "StateMachine Created"
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    })

})