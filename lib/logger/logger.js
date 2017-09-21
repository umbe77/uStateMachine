const settings = require('../utilities/settings').getSettings()
const winston = require('winston')
require('winston-daily-rotate-file')

const logSettings = Object.assign({
    level: 'info',
    path: '/var/uStateMachine/log'
}, settings.log)

const logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            level: logSettings.level,
            colorize: true,
            timestamp: true          
        }),
        new (winston.transports.DailyRotateFile)({
            filename: `${logSettings.path}/service`,
            datePattern: 'yyyy-MM-dd',
            maxDays: 122,
            level: logSettings.level
        })
    ]
})

module.exports = logger