const {settings} = require('../utilities/settings')

const invariantName = settings["persistance"]["provider"]

let persistance = settings.providers[invariantName]

if (!persistance) {
    persistance = require('./builtin/filesystem')
}

module.exports = persistance