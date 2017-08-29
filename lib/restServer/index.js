const {
    router
} = require('urestserver')

router.get('/', (svc) => {
    svc.done({
        body: "It works!",
        headers: {
            'Content-Type': 'text/plain'
        }
    })
})