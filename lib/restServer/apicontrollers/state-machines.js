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