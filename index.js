const path = require('path')
const {
    rest
} = require('urestserver')
const settings = require('./lib/utilities/settings').getSettings()

const cache = require('./lib/cache/cacheManager')
const persistance = require('./lib/persistance/persistance-manager')

const wfEngine = require('./lib/wf-engine')(cache, persistance)

const logger = require('./lib/logger/logger')

const cluster = require('cluster')
const os = require('os')

const numCpus = os.cpus().length

if (cluster.isMaster) {

    logger.info(`starting cluester on ${numCpus} workers`)

    for (let i = 0; i < numCpus; ++i) {
        cluster.fork()
    }

    cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`)
    })

    cluster.on('exit', (worker, code, signal) => {
        logger.info(`worker died with [CODE]: ${code} -- [SIGNAL]: ${signal}`)
        logger.info('restarting worker')
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
            logger.info(`${process.pid} -- [${svc.req.url}]`)
        })
        .run()
    logger.info(`process started on pid: ${process.pid}`)
}