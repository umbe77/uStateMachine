const path = require('path')
const {
    rest
} = require('urestserver')
const settings = require('./lib/utilities/settings').getSettings()

const cache = require('./lib/cache/cacheManager')
const persistance = require('./lib/persistance/persistance-manager')

const wfEngine = require('./lib/wf-engine')(cache, persistance)

const cluster = require('cluster')
const os = require('os')

const numCpus = os.cpus().length

if (cluster.isMaster) {

    console.log(`starting cluester on ${numCpus} workers`)

    for (let i = 0; i < numCpus; ++i) {
        cluster.fork()
    }

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`)
    })

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker died with [CODE]: ${code} -- [SIGNAL]: ${signal}`)
        console.log('restarting worker')
        cluster.fork()
    })

} else {
    rest.createRest({
            port: settings.port
        })
        .loadControllers(path.resolve('./lib/restServer/apicontrollers'))
        .addMiddleware((svc) => {
            svc.context.engine = wfEngine
        })
        .addMiddleware((svc) => {
            console.log(`${process.pid} -- [${svc.req.url}]`)
        })
        .run()
    console.log(`process started on pid: ${process.pid}`)
}