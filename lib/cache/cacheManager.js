const settings = require('../utilities/settings').getSettings()

const invariantName = settings["cache"]["provider"]

let cache = settings.providers[invariantName]

if (!cache) {
    cache = require('./builtin/memory')
}

module.exports = cache