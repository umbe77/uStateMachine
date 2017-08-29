const path = require('path')
const {rest} = require('urestserver')
const settings = require('./lib/utilities/settings').getSettings()

rest.createRest({
    port: settings.port,
    controllerPath: path.resolve('./lib/restServer')
})
.loadControllers(path.resolve('./lib/restServer'))
.run()

