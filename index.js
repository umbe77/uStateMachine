const path = require('path')
const {rest} = require('urestserver')
const settings = require('./lib/utilities/settings').getSettings()

const cache = require('./lib/cache/cacheManager')
const persistance = require('./lib/persistance/persistance-manager')

const wfEngine = require('./lib/wf-engine')(cache, persistance)

rest.createRest({
    port: settings.port
})
.loadControllers(path.resolve('./lib/restServer/apicontrollers'))
.addMiddleware((svc) => {
    svc.context.engine = wfEngine
})
.run()

